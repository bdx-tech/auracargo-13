
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AdminSignup from "@/pages/AdminSignup";
import ForgotPassword from "@/pages/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Services from "@/pages/Services";
import Contact from "@/pages/Contact";
import TrackingPage from "@/pages/TrackingPage";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Faq from "@/pages/Faq";
import Projects from "@/pages/Projects";
import CreateShipment from "@/pages/CreateShipment";
import SupportChat from "@/pages/SupportChat";

// Admin dashboard pages
import Overview from "@/pages/admin/Overview";
import ShipmentsManagement from "@/pages/admin/ShipmentsManagement";
import SupportManagement from "@/pages/admin/SupportManagement";
import Users from "@/pages/admin/Users";
import SystemSettings from "@/pages/admin/SystemSettings";

// User dashboard pages
import DashboardOverview from "@/pages/dashboard/Overview";
import Shipments from "@/pages/dashboard/Shipments";
import Documents from "@/pages/dashboard/Documents";
import Settings from "@/pages/dashboard/Settings";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/track" element={<TrackingPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/projects" element={<Projects />} />
          
          {/* Protected User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index element={<DashboardOverview />} />
            <Route path="shipments" element={<Shipments />} />
            <Route path="documents" element={<Documents />} />
            <Route path="settings" element={<Settings />} />
            <Route path="create-shipment" element={<CreateShipment />} />
            <Route path="support" element={<SupportChat />} />
          </Route>
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
            <Route index element={<Overview />} />
            <Route path="shipments" element={<ShipmentsManagement />} />
            <Route path="support" element={<SupportManagement />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
