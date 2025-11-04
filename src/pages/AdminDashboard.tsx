import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Settings, BarChart3 } from "lucide-react";
import AdManagement from "@/components/admin/AdManagement";
import CountdownSettings from "@/components/admin/CountdownSettings";
import Analytics from "@/components/admin/Analytics";
import ConfigManager from "@/components/admin/ConfigManager";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("ads");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary rounded-lg p-2">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Software Download Funnel</p>
              </div>
            </div>
            <ConfigManager />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="ads" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Ads</span>
            </TabsTrigger>
            <TabsTrigger value="countdown" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Countdown</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ads" className="space-y-6">
            <AdManagement />
          </TabsContent>

          <TabsContent value="countdown" className="space-y-6">
            <CountdownSettings />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Analytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
