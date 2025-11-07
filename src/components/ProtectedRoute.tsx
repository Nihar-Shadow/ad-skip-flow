import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "developer" | "user")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();

  const isAdminDeveloperRoute = allowedRoles && !allowedRoles.includes('user');

  if (isAdminDeveloperRoute) {
    // For admin/developer routes, use hardcoded auth
    if (!auth.isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }

    const hardcodedRole = auth.getUserRole();
    if (allowedRoles && hardcodedRole && !allowedRoles.includes(hardcodedRole)) {
      // Redirect based on user's actual role
      if (hardcodedRole === 'admin') {
        return <Navigate to="/admin" replace />;
      } else if (hardcodedRole === 'developer') {
        return <Navigate to="/developer" replace />;
      }
    }

    return <>{children}</>;
  } else {
    // For user routes, use Supabase auth
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/user/login" replace />;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      // Redirect based on user's actual role
      if (userRole === 'admin') {
        return <Navigate to="/admin" replace />;
      } else if (userRole === 'developer') {
        return <Navigate to="/developer" replace />;
      } else {
        return <Navigate to="/user/dashboard" replace />;
      }
    }

    return <>{children}</>;
  }
}
