
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TrackingPage from "./pages/TrackingPage";
import CreateShipment from "./pages/CreateShipment";
import SupportChat from "./pages/SupportChat";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Faq from "./pages/Faq";
import LoadingSpinner from "./components/LoadingSpinner";
import ChatBubble from "./components/ChatBubble";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Configure React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry failed queries once
      staleTime: 60000, // Consider data fresh for 60 seconds (increased from 30s)
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't automatically refetch on component mount
      cacheTime: 300000, // Cache data for 5 minutes
      // Add timeout to prevent hanging requests
      queryFn: async ({ queryKey }) => {
        console.log('Query executed for:', queryKey);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        try {
          // This is just a placeholder as we don't know what the actual query function is
          // The actual query function will be provided when useQuery is called
          throw new Error('queryFn not implemented');
        } finally {
          clearTimeout(timeoutId);
        }
      },
    },
  },
});

// Wrapper component to conditionally show ChatBubble
const AppContent = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reduce loading time to improve UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600); // Reduced from 800ms to 600ms for better UX

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Starting application..." />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/services" element={<Services />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/tracking/:trackingNumber" element={<TrackingPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-shipment" element={<ProtectedRoute><CreateShipment /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><SupportChat /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faq" element={<Faq />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Show Chat Bubble on all pages except Admin and Support pages when user is logged in */}
      {user && !window.location.pathname.includes('/admin') && !window.location.pathname.includes('/support') && (
        <ChatBubble />
      )}
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
