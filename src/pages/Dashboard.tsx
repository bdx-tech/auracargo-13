
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import OverviewPage from "./dashboard/Overview";
import ShipmentsPage from "./dashboard/Shipments";
import DocumentsPage from "./dashboard/Documents";
import PaymentsPage from "./dashboard/Payments";
import SettingsPage from "./dashboard/Settings";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          variant: "destructive",
          title: "Error fetching profile",
          description: "Could not load your profile information"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <DashboardSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            userProfile={userProfile}
            loading={loading}
          />
          
          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && <OverviewPage userId={user?.id} setActiveTab={setActiveTab} />}
            {activeTab === "shipments" && <ShipmentsPage userId={user?.id} />}
            {activeTab === "documents" && <DocumentsPage userId={user?.id} />}
            {activeTab === "payments" && <PaymentsPage userId={user?.id} />}
            {activeTab === "settings" && <SettingsPage userProfile={userProfile} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
