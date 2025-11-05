import { Navigate } from "react-router-dom";
import { auth } from "@/lib/auth";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "developer")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = auth.isAuthenticated();
  const userRole = auth.getUserRole();

  useEffect(() => {
    // Update last activity on component mount (user is accessing protected content)
    if (isAuthenticated) {
      auth.updateLastActivity();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    console.log('🔒 DEBUG: ProtectedRoute - User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    console.log('🔒 DEBUG: ProtectedRoute - User role not allowed, redirecting to login');
    // Clear session if user somehow accessed wrong role-protected area
    auth.logout();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}