
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CheckCircle2, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: {
    id: string;
    amount: number;
    shipment_id?: string;
  };
  onSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  invoice,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !invoice) return;
    
    setLoading(true);
    
    try {
      // In a real app, you would integrate with a payment processor here
      // For our dummy implementation, we'll just update the database
      
      // Generate mock transaction ID
      const transactionId = `TXN${Math.floor(100000000 + Math.random() * 900000000)}`;
      
      // Update payment status in database
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          payment_method: paymentMethod,
          transaction_id: transactionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id);
        
      if (error) throw error;
      
      // Create a notification about the payment
      await supabase
        .from('notifications')
        .insert([{
          title: "Payment Successful",
          content: `Your payment of $${invoice.amount.toFixed(2)} has been processed successfully.`,
          user_id: user.id
        }]);
      
      setSuccess(true);
      
      // Reset form after showing success for 2 seconds
      setTimeout(() => {
        setSuccess(false);
        setPaymentInfo({
          cardNumber: "",
          expiryDate: "",
          cvc: "",
          name: "",
        });
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 2000);
      
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => !loading && onOpenChange(value)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Make a Payment</DialogTitle>
          <DialogDescription>
            Complete your payment of ${invoice.amount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        {success ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium">Payment Successful!</h3>
            <p className="text-muted-foreground text-center">
              Your payment has been processed successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-4">
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card" className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Credit Card
                  </Label>
                </div>
              </RadioGroup>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name on Card</Label>
                <Input
                  id="name"
                  name="name"
                  value={paymentInfo.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={handleChange}
                  placeholder="4242 4242 4242 4242"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    value={paymentInfo.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    name="cvc"
                    value={paymentInfo.cvc}
                    onChange={handleChange}
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${invoice.amount.toFixed(2)}`
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
