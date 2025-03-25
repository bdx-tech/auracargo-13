
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CreditCard, 
  DollarSign, 
  Plus, 
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

interface PaymentsPageProps {
  loading: boolean;
  payments: any[];
}

const PaymentsPage: React.FC<PaymentsPageProps> = ({ loading, payments }) => {
  const [activeTab, setActiveTab] = useState("invoices");
  const { toast } = useToast();
  
  // Pre-process payments to add due dates (30 days from creation)
  const processedPayments = payments.map(payment => ({
    ...payment,
    dueDate: format(addDays(new Date(payment.created_at), 30), 'yyyy-MM-dd')
  }));
  
  // Calculate totals
  const totalPaid = processedPayments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
    
  const totalOutstanding = processedPayments
    .filter(payment => payment.status !== 'paid')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  
  // Find next payment due
  const nextPaymentDue = processedPayments
    .filter(payment => payment.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  
  // Mock data for payment methods
  const paymentMethods = [
    { id: "PM-001", type: "credit_card", last4: "4242", expiry: "05/25", default: true },
    { id: "PM-002", type: "bank_account", accountNumber: "****6789", bankName: "Chase", default: false }
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "pending":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "overdue":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const handleMakePayment = () => {
    toast({
      title: "Payment feature",
      description: "Payment processing will be implemented soon.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your payments data is being exported",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-kargon-dark">Payments</h1>
        <Button 
          className="bg-kargon-red hover:bg-kargon-red/90"
          onClick={handleMakePayment}
        >
          <DollarSign className="mr-2 h-4 w-4" /> Make Payment
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <>
                <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
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
              <Skeleton className="h-8 w-28" />
            ) : (
              <>
                <div className="text-2xl font-bold">${totalOutstanding.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Across {processedPayments.filter(p => p.status !== 'paid').length} invoices
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
              <Skeleton className="h-8 w-28" />
            ) : nextPaymentDue ? (
              <>
                <div className="text-2xl font-bold">
                  {format(new Date(nextPaymentDue.dueDate), 'MMM dd, yyyy')}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ${Number(nextPaymentDue.amount).toFixed(2)}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">No payments due</div>
                <p className="text-xs text-gray-500 mt-1">All payments are settled</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="invoices" className="w-full" value={activeTab} onValueChange={setActiveTab}>
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
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                {loading ? (
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : processedPayments.length > 0 ? (
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
                      {processedPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">INV-{payment.id.substring(0, 8)}</TableCell>
                          <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
                          <TableCell>{format(new Date(payment.created_at), 'yyyy-MM-dd')}</TableCell>
                          <TableCell>{payment.dueDate}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(payment.status)}
                              <Badge variant="outline" className={getStatusBadgeColor(payment.status)}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {payment.shipment_id ? 
                              payment.shipment_id.substring(0, 8) : 
                              '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No invoices found.
                  </div>
                )}
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
