
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [loadingMessage, setLoadingMessage] = useState("Loading your account...");

  useEffect(() => {
    // Update loading message after a delay to provide better feedback
    const messageTimeout = setTimeout(() => {
      setLoadingMessage("Still verifying your account. This won't take much longer.");
    }, 3000);

    return () => clearTimeout(messageTimeout);
  }, []);

  if (isLoading) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  if (!user) {
    // Redirect to login but save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
