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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/ad/1" replace />} />
          <Route path="/ad/:pageId" element={<AdPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/developer" element={<DeveloperDashboard />} />
          <Route path="/s/:shortCode" element={<ShortLinkRedirect />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
