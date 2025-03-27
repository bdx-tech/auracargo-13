
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminOverview from "./admin/Overview";
import UsersPage from "./admin/Users";
import ShipmentsManagement from "./admin/ShipmentsManagement";
import SystemSettings from "./admin/SystemSettings";
import SupportManagement from "./admin/SupportManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import LoadingSpinner from "@/components/LoadingSpinner";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Extra safety check - if somehow an unauthorized user gets to this page, redirect them
    if (user && !isAdmin) {
      navigate("/dashboard");
      return;
    }

    // Set a timeout for loading indication
    const loadingTimeoutId = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000);

    // Simulate initial data load
    const loadingTimerId = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => {
      clearTimeout(loadingTimerId);
      clearTimeout(loadingTimeoutId);
    };
  }, [user, isAdmin, navigate]);

  if (isLoading) {
    return <LoadingSpinner message={loadingTimeout ? "Still loading admin data... This is taking longer than expected." : undefined} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Main Content */}
          <div className="flex-1 mt-6 md:mt-0">
            {activeTab === "overview" && <AdminOverview />}
            {activeTab === "users" && <UsersPage />}
            {activeTab === "shipments" && <ShipmentsManagement />}
            {activeTab === "settings" && <SystemSettings />}
            {activeTab === "support" && <SupportManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
