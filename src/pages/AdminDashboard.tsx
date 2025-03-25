
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminOverview from "./admin/Overview";
import UsersPage from "./admin/Users";
import ShipmentsManagement from "./admin/ShipmentsManagement";
import PaymentsManagement from "./admin/PaymentsManagement";
import SystemSettings from "./admin/SystemSettings";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // Extra safety check - if somehow an unauthorized user gets to this page, redirect them
    if (user && !isAdmin) {
      navigate("/dashboard");
    }
  }, [user, isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && <AdminOverview />}
            {activeTab === "users" && <UsersPage />}
            {activeTab === "shipments" && <ShipmentsManagement />}
            {activeTab === "payments" && <PaymentsManagement />}
            {activeTab === "settings" && <SystemSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
