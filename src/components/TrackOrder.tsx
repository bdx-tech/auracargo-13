
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const TrackOrder = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive",
      });
      return;
    }

    // Navigate to tracking page with the tracking number
    navigate(`/tracking/${trackingNumber}`);
  };

  return (
    <section className="relative z-30 -mt-16 mb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-kargon-dark mb-4">Track Your Order</h2>
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Enter your tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="h-12"
              />
            </div>
            <Button 
              type="submit" 
              className="bg-kargon-red hover:bg-kargon-red/90 text-white h-12 px-6"
            >
              <Search className="mr-2 h-5 w-5" />
              TRACK
            </Button>
          </form>
          <p className="text-gray-500 text-sm mt-4">
            Enter your tracking number to get real-time updates on your shipment's location and status.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrackOrder;
