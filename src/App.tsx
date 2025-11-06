import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdPage from "./pages/AdPage";
import DownloadPage from "./pages/DownloadPage";
import AdminDashboard from "./pages/AdminDashboard";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import ShortLinkRedirect from "./pages/ShortLinkRedirect";
import NotFound from "./pages/NotFound";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import UserDashboard from "./pages/UserDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/ad/1" replace />} />
          
          {/* User Auth Routes */}
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/signup" element={<UserSignup />} />
          <Route 
            path="/user/dashboard" 
            element={
              <ProtectedRoute allowedRoles={["user", "developer", "admin"]}>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Public Routes */}
          <Route path="/ad/:pageId" element={<AdPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/s/:shortCode" element={<ShortLinkRedirect />} />
          
          {/* Admin/Developer Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/developer" 
            element={
              <ProtectedRoute allowedRoles={["developer", "admin"]}>
                <DeveloperDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
