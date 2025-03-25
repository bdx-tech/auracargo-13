
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PaystackButton } from "react-paystack";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Loader2, Package, ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Price per kg in Naira
const PRICE_PER_KG = 1500;
const PAYSTACK_PUBLIC_KEY = "pk_test_a072d7eb86e3b66f02782571ccfb4e2d6ec70e61";

const shipmentFormSchema = z.object({
  origin: z.string().min(5, { message: "Origin address is required" }),
  destination: z.string().min(5, { message: "Destination address is required" }),
  weight: z.coerce.number().min(0.1, { message: "Weight must be greater than 0" }),
  dimensions: z.string().optional(),
  service_type: z.string().default("Standard"),
  recipient_name: z.string().min(3, { message: "Recipient name is required" }),
  recipient_email: z.string().email({ message: "Valid email is required" }).optional(),
  recipient_phone: z.string().min(5, { message: "Valid phone number is required" }),
});

type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;

const CreateShipment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      origin: "",
      destination: "",
      weight: undefined,
      dimensions: "",
      service_type: "Standard",
      recipient_name: "",
      recipient_email: "",
      recipient_phone: "",
    },
  });

  const weight = form.watch("weight") || 0;
  const amount = Math.ceil(weight * PRICE_PER_KG * 100); // Amount in kobo (smallest currency unit)
  const recipientEmail = form.watch("recipient_email") || "";

  const handlePaymentSuccess = async (reference: any) => {
    setPaymentReference(reference.reference);
    setIsProcessing(true);
    
    try {
      // Verify payment
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
        body: { reference: reference.reference }
      });
      
      if (verifyError) throw new Error(verifyError.message);
      
      if (!verifyData.status || verifyData.data.status !== 'success') {
        throw new Error('Payment verification failed');
      }
      
      console.log('Payment verified:', verifyData);
      
      // Generate tracking number
      const trackingNumber = `AUR${Math.floor(100000 + Math.random() * 900000)}`;
      
      const formData = form.getValues();
      
      // Create shipment
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .insert([
          {
            origin: formData.origin,
            destination: formData.destination,
            weight: formData.weight,
            dimensions: formData.dimensions || null,
            service_type: formData.service_type,
            status: 'Pending',
            tracking_number: trackingNumber,
            user_id: user?.id
          }
        ])
        .select();
      
      if (shipmentError) throw shipmentError;
      
      // Create payment record with enhanced details
      await supabase
        .from('payments')
        .insert([
          {
            amount: amount / 100, // Convert back to naira
            currency: "NGN", // Nigerian Naira
            payment_method: 'Paystack',
            status: 'paid',
            shipment_id: shipmentData[0].id,
            user_id: user?.id,
            transaction_id: verifyData.data.id,
            payment_provider: 'paystack',
            payment_reference: reference.reference
          }
        ]);
      
      // Create notification
      await supabase
        .from('notifications')
        .insert([
          {
            title: "New Shipment Created",
            content: `Your shipment to ${formData.destination} has been created with tracking number ${trackingNumber} and payment has been confirmed.`,
            user_id: user?.id
          }
        ]);
      
      toast({
        title: "Payment Successful!",
        description: "Your shipment has been created and payment has been confirmed.",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error("Error creating shipment after payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create shipment. Please contact support.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentClose = () => {
    toast({
      title: "Payment Cancelled",
      description: "You can complete your payment later.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                <CardTitle>Create New Shipment</CardTitle>
              </div>
              <CardDescription>
                Enter shipment details and complete payment to create a new shipment.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Shipment Details</h3>
                      
                      <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origin Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St, City, Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="destination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination Address</FormLabel>
                            <FormControl>
                              <Input placeholder="456 Elm St, City, Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (kg)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  min="0.1" 
                                  placeholder="10.5"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dimensions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dimensions (LxWxH cm)</FormLabel>
                              <FormControl>
                                <Input placeholder="30x20x15" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="service_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Type</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Standard, Express, etc."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Recipient Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="recipient_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipient Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="recipient_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipient Email</FormLabel>
                            <FormControl>
                              <Input placeholder="johndoe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="recipient_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipient Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+234 800 123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="bg-gray-50 p-4 rounded-md border mt-4">
                        <h4 className="font-medium">Shipping Cost</h4>
                        <p className="text-sm text-gray-500 mb-2">₦{PRICE_PER_KG} per kg</p>
                        
                        <div className="flex justify-between items-center">
                          <span>Weight:</span>
                          <span>{weight} kg</span>
                        </div>
                        
                        <div className="flex justify-between items-center font-bold border-t mt-2 pt-2">
                          <span>Total:</span>
                          <span>₦{(weight * PRICE_PER_KG).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!paymentReference && weight > 0 && (
                    <Alert className="bg-green-50 border-green-200">
                      <AlertTitle>Ready for Payment</AlertTitle>
                      <AlertDescription>
                        Complete your shipment by making a payment of ₦{(weight * PRICE_PER_KG).toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {paymentReference && (
                    <Alert className="bg-green-50 border-green-200">
                      <AlertTitle>Payment Successful</AlertTitle>
                      <AlertDescription>
                        Your payment has been received. Reference: {paymentReference}
                      </AlertDescription>
                    </Alert>
                  )}
                </form>
              </Form>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              
              {weight > 0 && !paymentReference && (
                <PaystackButton
                  text={isProcessing ? "Processing..." : "Pay & Create Shipment"}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md inline-flex items-center justify-center gap-2 h-10"
                  amount={amount}
                  email={recipientEmail || user?.email || "customer@example.com"}
                  publicKey={PAYSTACK_PUBLIC_KEY}
                  onSuccess={handlePaymentSuccess}
                  onClose={handlePaymentClose}
                  metadata={{
                    custom_fields: [
                      {
                        display_name: "Shipment Type",
                        variable_name: "shipment_type",
                        value: form.getValues().service_type
                      }
                    ]
                  }}
                />
              )}
              
              {isProcessing && (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateShipment;
