import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  amount: number;
  email: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  amount,
  email
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  
  const config = {
    reference: `pay_${new Date().getTime()}`,
    email: email,
    amount: amount * 100,
    publicKey: "pk_test_a072d7eb86e3b66f02782571ccfb4e2d6ec70e61",
  };
  
  const initializePayment = usePaystackPayment(config);
  
  const handlePaymentInitialize = () => {
    setIsProcessing(true);
    
    initializePayment({
      onSuccess: (reference) => handlePaymentSuccess(reference),
      onClose: () => {
        setIsProcessing(false);
        toast({
          variant: "destructive",
          title: "Payment Cancelled",
          description: "You've cancelled the payment process.",
        });
      },
    });
  };
  
  const handlePaymentSuccess = async (reference: any) => {
    try {
      setIsVerifying(true);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference: reference.reference }
      });
      
      if (error) throw error;
      
      if (data.status === "success" && data.data.status === "success") {
        setIsPaid(true);
        setIsVerifying(false);
        setIsProcessing(false);
        
        toast({
          title: "Payment Successful",
          description: "Your payment has been verified successfully.",
        });
        
        setTimeout(() => {
          onOpenChange(false);
          onSuccess();
        }, 2000);
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      setIsVerifying(false);
      setIsProcessing(false);
      
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "There was an error verifying your payment.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isProcessing && newOpen === false) return;
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Please complete your payment to create your shipment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="border rounded-md p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Service Fee</span>
                <span className="font-medium">₦{amount.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold">₦{amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {isPaid ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-center font-medium text-green-600">Payment Successful!</p>
              <p className="text-center text-sm text-gray-500">Redirecting to create your shipment...</p>
            </div>
          ) : (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing || isVerifying}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentInitialize}
                disabled={isProcessing || isVerifying}
              >
                {isProcessing ? (
                  <>
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    )}
                  </>
                ) : (
                  'Pay Now'
                )}
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
