import { useEffect, useState } from "react";
import { loadConfig, resetConfig } from "@/lib/adFunnelConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, MousePointerClick, Download } from "lucide-react";
import { toast } from "sonner";

const COLORS = ["hsl(217, 91%, 60%)", "hsl(160, 84%, 39%)", "hsl(25, 95%, 53%)", "hsl(280, 85%, 60%)"];

const Analytics = () => {
  const [data, setData] = useState<any>(null);

  const loadAnalytics = () => {
    const config = loadConfig();
    setData(config.analytics);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all analytics data? This cannot be undone.")) {
      resetConfig();
      loadAnalytics();
      toast.success("Analytics reset successfully");
    }
  };

  if (!data) return null;

  const pageVisitData = Object.entries(data.pageVisits).map(([page, visits]) => ({
    name: page === "5" ? "Download" : `Ad Page ${page}`,
    visits: visits as number,
  }));

  const adClickData = Object.entries(data.adClicks).map(([ad, clicks]) => ({
    name: ad,
    clicks: clicks as number,
  }));

  const totalVisits = Object.values(data.pageVisits).reduce((a: any, b: any) => a + b, 0) as number;
  const totalClicks = Object.values(data.adClicks).reduce((a: any, b: any) => a + b, 0) as number;
  const conversionRate = totalVisits > 0 ? ((data.totalDownloads / totalVisits) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Visits</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalVisits}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all funnel pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ad Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">Advertisement engagements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{data.totalDownloads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {conversionRate}% conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Page Visits Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Page Visits by Funnel Stage</CardTitle>
          <CardDescription>Traffic flow through the download funnel</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pageVisitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar dataKey="visits" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ad Clicks Chart */}
      {adClickData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Advertisement Performance</CardTitle>
            <CardDescription>Click distribution across all ads</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={adClickData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="clicks"
                >
                  {adClickData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={loadAnalytics} variant="outline" className="flex-1">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
        <Button onClick={handleReset} variant="destructive" className="flex-1">
          Reset Analytics
        </Button>
      </div>
    </div>
  );
};

export default Analytics;
