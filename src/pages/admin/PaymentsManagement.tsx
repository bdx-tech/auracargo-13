
import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  CreditCard, 
  Download, 
  Eye,
  BarChart,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  transaction_id: string | null;
  payment_reference: string | null;
  payment_provider: string | null;
  currency: string;
  profiles: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  shipments: {
    id: string;
    tracking_number: string;
    origin: string;
    destination: string;
  } | null;
}

const PaymentsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          status,
          payment_method,
          created_at,
          transaction_id,
          payment_reference,
          payment_provider,
          currency,
          profiles:user_id (
            email,
            first_name,
            last_name
          ),
          shipments (
            id,
            tracking_number,
            origin,
            destination
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPayments(data || []);
    } catch (err: any) {
      console.error('Error fetching payments:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const refreshPaymentStatus = async (paymentId: string, paymentReference: string | null) => {
    if (!paymentReference) {
      toast({
        variant: "destructive",
        title: "Cannot verify payment",
        description: "No payment reference found"
      });
      return;
    }
    
    try {
      setIsRefreshing(true);
      
      // Call the verify-payment edge function
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference: paymentReference }
      });
      
      if (error) throw error;
      
      if (data && data.status && data.data && data.data.status === 'success') {
        // Update payment status in database
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentId);
          
        if (updateError) throw updateError;
        
        toast({
          title: "Payment status updated",
          description: `Payment verified and updated to: ${data.data.status}`
        });
        
        // Refresh the payments list
        fetchPayments();
      } else {
        toast({
          variant: "destructive",
          title: "Payment verification failed",
          description: data?.message || "Could not verify payment status"
        });
      }
    } catch (err: any) {
      console.error('Error verifying payment:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An error occurred while verifying the payment"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchPayments();
    
    // Set up realtime subscription for payments
    const paymentsChannel = supabase
      .channel('payments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          console.log('Payment change detected:', payload);
          fetchPayments();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(paymentsChannel);
    };
  }, []);
  
  const filteredPayments = payments.filter(payment => 
    payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    payment.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (payment.profiles?.email && payment.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (payment.shipments?.tracking_number && payment.shipments.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
      case "success":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
      case "abandoned":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getCustomerName = (payment: Payment) => {
    if (!payment.profiles) return "Unknown";
    
    const firstName = payment.profiles.first_name || "";
    const lastName = payment.profiles.last_name || "";
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return payment.profiles.email;
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return currency === "NGN" ? 
      `₦${amount.toLocaleString()}` : 
      `$${amount.toFixed(2)}`;
  };

  const getPaymentProviderLink = (payment: Payment) => {
    if (payment.payment_provider === 'paystack' && payment.payment_reference) {
      return `https://dashboard.paystack.com/#/transactions/${payment.payment_reference}`;
    }
    return null;
  };

  const totalRevenue = payments.reduce((sum, payment) => 
    payment.status.toLowerCase() === "paid" || payment.status.toLowerCase() === "completed" || payment.status.toLowerCase() === "success"
      ? sum + Number(payment.amount) : sum, 0
  );
  
  const pendingRevenue = payments.reduce((sum, payment) => 
    payment.status.toLowerCase() === "pending" ? sum + Number(payment.amount) : sum, 0
  );
  
  const failedRevenue = payments.reduce((sum, payment) => 
    payment.status.toLowerCase() === "failed" || payment.status.toLowerCase() === "abandoned" 
      ? sum + Number(payment.amount) : sum, 0
  );
  
  const completedCount = payments.filter(
    payment => 
      payment.status.toLowerCase() === "paid" || 
      payment.status.toLowerCase() === "completed" || 
      payment.status.toLowerCase() === "success"
  ).length;
  
  const pendingCount = payments.filter(
    payment => payment.status.toLowerCase() === "pending"
  ).length;
  
  const failedCount = payments.filter(
    payment => payment.status.toLowerCase() === "failed" || payment.status.toLowerCase() === "abandoned"
  ).length;

  const exportPaymentsData = () => {
    // Create CSV content
    const headers = [
      'ID', 'Customer', 'Amount', 'Currency', 'Method', 'Date', 'Status', 
      'Reference', 'Transaction ID', 'Provider', 'Shipment ID'
    ].join(',');
    
    const rows = filteredPayments.map(payment => [
      payment.id,
      getCustomerName(payment),
      payment.amount,
      payment.currency,
      payment.payment_method,
      new Date(payment.created_at).toISOString().split('T')[0],
      payment.status,
      payment.payment_reference || '',
      payment.transaction_id || '',
      payment.payment_provider || '',
      payment.shipments?.id || ''
    ].join(','));
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payments-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export complete",
      description: `${filteredPayments.length} payment records exported`
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments Management</h1>
        <p className="text-muted-foreground">Track and manage all payment transactions</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : totalRevenue > 0 ? formatCurrency(totalRevenue, payments[0]?.currency || 'USD') : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">{isLoading ? '...' : completedCount} successful transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : pendingRevenue > 0 ? formatCurrency(pendingRevenue, payments[0]?.currency || 'USD') : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">{isLoading ? '...' : pendingCount} pending transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : failedRevenue > 0 ? formatCurrency(failedRevenue, payments[0]?.currency || 'USD') : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">{isLoading ? '...' : failedCount} failed transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : 
                payments.length > 0 
                  ? `${((completedCount / payments.length) * 100).toFixed(1)}%` 
                  : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">Based on all transactions</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search payments..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={exportPaymentsData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchPayments()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        {isLoading ? (
          <div className="p-8 text-center">Loading payments...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error: {error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Shipment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.transaction_id || payment.id.slice(0, 8)}</TableCell>
                    <TableCell>{getCustomerName(payment)}</TableCell>
                    <TableCell>{formatCurrency(Number(payment.amount), payment.currency)}</TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>{format(new Date(payment.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.payment_reference ? 
                        <div className="flex items-center gap-1">
                          <span title={payment.payment_reference}>{payment.payment_reference.slice(0, 8)}...</span>
                        </div> : 
                        '-'}
                    </TableCell>
                    <TableCell>
                      {payment.shipments ? (
                        <span className="text-xs" title={`${payment.shipments.origin} to ${payment.shipments.destination}`}>
                          {payment.shipments.tracking_number.slice(0, 10)}...
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {getPaymentProviderLink(payment) && (
                          <a 
                            href={getPaymentProviderLink(payment)!} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        {payment.payment_reference && payment.status.toLowerCase() === 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => refreshPaymentStatus(payment.id, payment.payment_reference)}
                            disabled={isRefreshing}
                          >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default PaymentsManagement;
