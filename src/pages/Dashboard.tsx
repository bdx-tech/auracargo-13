import { useState, useEffect } from "react";
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
  const { user, profile } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    shipments: [],
    documents: [],
    payments: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Fetch shipments
        const { data: shipments, error: shipmentsError } = await supabase
          .from('shipments')
          .select('*')
          .eq('user_id', user.id);
          
        if (shipmentsError) throw shipmentsError;
        
        // Fetch documents
        const { data: documents, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id);
          
        if (documentsError) throw documentsError;
        
        // Fetch payments
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('*, shipments(*)')
          .eq('user_id', user.id);
          
        if (paymentsError) throw paymentsError;
        
        // Fetch notifications
        const { data: notifications, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (notificationsError) throw notificationsError;
        
        setDashboardData({
          shipments: shipments || [],
          documents: documents || [],
          payments: payments || [],
          notifications: notifications || []
        });
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up real-time listeners
    const shipmentChannel = supabase
      .channel('shipments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'shipments', filter: `user_id=eq.${user?.id}` },
        (payload) => {
          console.log('Shipment change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setDashboardData(prevData => ({
              ...prevData,
              shipments: [payload.new, ...prevData.shipments]
            }));
          } else if (payload.eventType === 'UPDATE') {
            setDashboardData(prevData => ({
              ...prevData,
              shipments: prevData.shipments.map(s => 
                s.id === payload.new.id ? payload.new : s
              )
            }));
          } else if (payload.eventType === 'DELETE') {
            setDashboardData(prevData => ({
              ...prevData,
              shipments: prevData.shipments.filter(s => s.id !== payload.old.id)
            }));
          }
        }
      )
      .subscribe();
      
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` },
        (payload) => {
          console.log('Notification change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setDashboardData(prevData => ({
              ...prevData,
              notifications: [payload.new, ...prevData.notifications]
            }));
            
            toast({
              title: payload.new.title,
              description: payload.new.content,
            });
          } else if (payload.eventType === 'UPDATE') {
            setDashboardData(prevData => ({
              ...prevData,
              notifications: prevData.notifications.map(n => 
                n.id === payload.new.id ? payload.new : n
              )
            }));
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(shipmentChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user, toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <DashboardSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            profile={profile}
          />
          
          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && 
              <OverviewPage 
                loading={loading}
                data={dashboardData} 
                setActiveTab={setActiveTab} 
              />
            }
            {activeTab === "shipments" && 
              <ShipmentsPage 
                loading={loading}
                shipments={dashboardData.shipments} 
              />
            }
            {activeTab === "documents" && 
              <DocumentsPage 
                loading={loading}
                documents={dashboardData.documents} 
              />
            }
            {activeTab === "payments" && 
              <PaymentsPage 
                loading={loading}
                payments={dashboardData.payments} 
              />
            }
            {activeTab === "settings" && 
              <SettingsPage 
                loading={loading}
                profile={profile} 
              />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
