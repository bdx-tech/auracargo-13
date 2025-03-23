
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  ArrowLeft,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const TrackingPage = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<any | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackingNumber) {
      fetchShipmentData(trackingNumber);
    }
  }, [trackingNumber]);

  const fetchShipmentData = async (tracking: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch shipment details
      const { data: shipmentData, error: shipmentError } = await supabase
        .from("shipments")
        .select("*")
        .eq("tracking_number", tracking)
        .single();

      if (shipmentError) {
        throw new Error(shipmentError.message === "The result contains 0 rows" 
          ? "No shipment found with this tracking number" 
          : shipmentError.message);
      }

      setShipment(shipmentData);

      // Fetch tracking events
      const { data: eventsData, error: eventsError } = await supabase
        .from("tracking_events")
        .select("*")
        .eq("shipment_id", shipmentData.id)
        .order("created_at", { ascending: false });

      if (eventsError) throw new Error(eventsError.message);

      setTrackingEvents(eventsData || []);
    } catch (err: any) {
      console.error("Error fetching tracking data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "text-green-600";
      case "In Transit":
        return "text-blue-600";
      case "Approved":
        return "text-blue-600";
      case "Delayed":
        return "text-orange-600";
      case "Rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "In Transit":
        return <Truck className="h-6 w-6 text-blue-600" />;
      case "Approved":
        return <CheckCircle className="h-6 w-6 text-blue-600" />;
      case "Pending":
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case "Delayed":
        return <AlertTriangle className="h-6 w-6 text-orange-600" />;
      case "Rejected":
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      default:
        return <Package className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Tracking Information</span>
                {shipment && (
                  <div className={`flex items-center ${getStatusColor(shipment.status)}`}>
                    {getStatusIcon(shipment.status)}
                    <span className="ml-2 font-semibold">{shipment?.status}</span>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                Tracking number: <span className="font-semibold">{trackingNumber}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading tracking information...</p>
                </div>
              ) : error ? (
                <div className="py-8 text-center text-red-600">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-medium">{error}</p>
                  <p className="mt-2">Please check the tracking number and try again.</p>
                </div>
              ) : shipment ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">From</h3>
                      <p className="font-medium">{shipment.origin}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">To</h3>
                      <p className="font-medium">{shipment.destination}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Ship Date</h3>
                      <p>{format(new Date(shipment.created_at), "MMM dd, yyyy")}</p>
                    </div>
                    {shipment.estimated_delivery && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Estimated Delivery</h3>
                        <p>{format(new Date(shipment.estimated_delivery), "MMM dd, yyyy")}</p>
                      </div>
                    )}
                    {shipment.service_type && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Service</h3>
                        <p>{shipment.service_type}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <h3 className="text-lg font-semibold mb-4">Tracking History</h3>
                    
                    {trackingEvents.length > 0 ? (
                      <div className="space-y-0">
                        {trackingEvents.map((event, index) => (
                          <div key={event.id} className="relative pb-8">
                            {index < trackingEvents.length - 1 && (
                              <div className="absolute left-6 top-6 bottom-0 w-0.5 bg-gray-200"></div>
                            )}
                            <div className="relative flex items-start group">
                              <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                <Package className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="ml-4 pt-1.5">
                                <p className="font-medium">{event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}</p>
                                <p className="text-sm text-gray-500">{event.location || "Location not available"}</p>
                                <p className="text-xs text-gray-400">{format(new Date(event.created_at), "MMM dd, yyyy h:mm a")}</p>
                                {event.description && (
                                  <p className="mt-1 text-sm">{event.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg bg-gray-50">
                        <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p>No tracking updates available yet</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TrackingPage;
