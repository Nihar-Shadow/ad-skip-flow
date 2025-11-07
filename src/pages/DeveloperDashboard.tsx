import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Settings, BarChart3, Link, LogOut, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import AdManagement from "@/components/admin/AdManagement";
import CountdownSettings from "@/components/admin/CountdownSettings";
import Analytics from "@/components/admin/Analytics";
import ConfigManager from "@/components/admin/ConfigManager";
import LinkShortener from "@/components/admin/LinkShortener";
import { UserManagement } from "@/components/user/UserManagement";

const DeveloperDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary rounded-lg p-2">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
              <h1 className="text-xl font-bold text-foreground">Developer Panel</h1>
              <p className="text-xs text-muted-foreground">Software Download Funnel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConfigManager />
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Ads</span>
            </TabsTrigger>
            <TabsTrigger value="countdown" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Countdown</span>
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <Link className="w-4 h-4" />
              <span className="hidden sm:inline">Links</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users"><UserManagement /></TabsContent>
          <TabsContent value="ads"><AdManagement /></TabsContent>
          <TabsContent value="countdown"><CountdownSettings /></TabsContent>
          <TabsContent value="links"><LinkShortener /></TabsContent>
          <TabsContent value="analytics"><Analytics /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DeveloperDashboard;
