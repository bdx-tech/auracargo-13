import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  DollarSign, 
  Plus, 
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentsPageProps {
  userId: string | undefined;
}

interface Payment {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  payment_method: string;
  currency: string;
  transaction_id: string | null;
  shipment_id: string | null;
  updated_at: string;
  user_id: string | null;
  shipments?: any;
}

const PaymentsPage: React.FC<PaymentsPageProps> = ({ userId }) => {
  const [invoices, setInvoices] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalPaid: 0,
    outstanding: 0,
    nextDueDate: null as string | null,
    nextDueAmount: 0,
    nextDueInvoice: ""
  });
  const { toast } = useToast();
  
  const fetchPaymentData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError("");
    
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*, shipments:shipment_id(tracking_number)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (paymentsError) {
        if (paymentsError.code === 'PGRST116') {
          setInvoices([]);
        } else {
          throw paymentsError;
        }
      } else {
        setInvoices(paymentsData || []);
        
        if (paymentsData && paymentsData.length > 0) {
          const paid = paymentsData
            .filter(p => p.status === 'Completed' || p.status === 'paid')
            .reduce((sum, p) => sum + Number(p.amount), 0);
          
          const pending = paymentsData
            .filter(p => p.status === 'Pending' || p.status === 'pending' || p.status === 'overdue')
            .reduce((sum, p) => sum + Number(p.amount), 0);
          
          const pendingInvoices = paymentsData
            .filter(p => p.status === 'Pending' || p.status === 'pending')
            .map(p => ({
              ...p,
              calculatedDueDate: new Date(new Date(p.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }))
            .sort((a, b) => new Date(a.calculatedDueDate).getTime() - new Date(b.calculatedDueDate).getTime());
          
          setStats({
            totalPaid: paid,
            outstanding: pending,
            nextDueDate: pendingInvoices.length > 0 ? pendingInvoices[0].calculatedDueDate : null,
            nextDueAmount: pendingInvoices.length > 0 ? pendingInvoices[0].amount : 0,
            nextDueInvoice: pendingInvoices.length > 0 ? pendingInvoices[0].id : ""
          });
        }
      }
      
      setPaymentMethods([
        { id: "PM-001", type: "credit_card", last4: "4242", expiry: "05/25", default: true },
        { id: "PM-002", type: "bank_account", accountNumber: "****6789", bankName: "Chase", default: false }
      ]);
      
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setError("Failed to fetch payment data. Please try again.");
      toast({
        variant: "destructive",
        title: "Error loading payment data",
        description: "There was a problem loading your payment information."
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPaymentData();
  }, [userId]);

  const getStatusBadgeColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === "paid" || normalizedStatus === "completed") {
      return "bg-green-100 text-green-800 hover:bg-green-100";
    } else if (normalizedStatus === "pending") {
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    } else if (normalizedStatus === "overdue") {
      return "bg-red-100 text-red-800 hover:bg-red-100";
    } else {
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === "paid" || normalizedStatus === "completed") {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    } else if (normalizedStatus === "pending") {
      return <Clock className="h-4 w-4 text-blue-600" />;
    } else if (normalizedStatus === "overdue") {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    } else {
      return null;
    }
  };

  const calculateDueDate = (createdAt: string) => {
    const created = new Date(createdAt);
    const dueDate = new Date(created);
    dueDate.setDate(created.getDate() + 30);
    return dueDate;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-kargon-dark">Payments</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPaymentData}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button className="bg-kargon-red hover:bg-kargon-red/90">
            <DollarSign className="mr-2 h-4 w-4" /> Make Payment
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">${stats.totalPaid.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">${stats.outstanding.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {invoices.filter(inv => 
                    inv.status === 'Pending' || 
                    inv.status === 'pending' || 
                    inv.status === 'overdue'
                  ).length} invoice(s)
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Next Payment Due</CardTitle>
            <Clock className="h-4 w-4 text-kargon-red" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : stats.nextDueDate ? (
              <>
                <div className="text-2xl font-bold">
                  {new Date(stats.nextDueDate).toLocaleDateString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.nextDueInvoice} (${stats.nextDueAmount.toFixed(2)})
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">No pending payments</div>
                <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Invoice History</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" /> View Statement
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="flex items-center gap-2 text-red-500 mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              ) : null}
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Shipment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array(4).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>${Number(invoice.amount).toFixed(2)}</TableCell>
                          <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{calculateDueDate(invoice.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(invoice.status)}
                              <Badge variant="outline" className={getStatusBadgeColor(invoice.status)}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{invoice.shipments?.tracking_number || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No invoices found. Payments will appear here when you create shipments.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="methods" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your saved payment methods</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {method.type === 'credit_card' ? (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {method.type === 'credit_card' 
                                ? `Credit Card ending in ${method.last4}` 
                                : `Bank Account (${method.bankName})`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {method.type === 'credit_card' 
                                ? `Expires ${method.expiry}` 
                                : `Account ending in ${method.accountNumber}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.default && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                              Default
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentsPage;
