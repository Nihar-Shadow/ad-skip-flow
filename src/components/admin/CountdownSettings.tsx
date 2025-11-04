import { useState, useEffect } from "react";
import { loadConfig, saveConfig } from "@/lib/adFunnelConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Save } from "lucide-react";
import { toast } from "sonner";

const CountdownSettings = () => {
  const [countdowns, setCountdowns] = useState<Record<number, number>>({});
  const [downloadSettings, setDownloadSettings] = useState({
    softwareName: "",
    downloadURL: "",
  });

  useEffect(() => {
    const config = loadConfig();
    const countdownMap: Record<number, number> = {};
    config.pages.forEach((page) => {
      countdownMap[page.id] = page.countdown;
    });
    setCountdowns(countdownMap);
    setDownloadSettings({
      softwareName: config.softwareName,
      downloadURL: config.downloadURL,
    });
  }, []);

  const handleSave = () => {
    const config = loadConfig();
    config.pages = config.pages.map((page) => ({
      ...page,
      countdown: countdowns[page.id] || page.countdown,
    }));
    config.softwareName = downloadSettings.softwareName;
    config.downloadURL = downloadSettings.downloadURL;
    saveConfig(config);
    toast.success("Settings saved successfully");
  };

  const handleCountdownChange = (pageId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setCountdowns({ ...countdowns, [pageId]: numValue });
  };

  return (
    <div className="space-y-6">
      {/* Countdown Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            Countdown Timer Settings
          </CardTitle>
          <CardDescription>
            Set the countdown duration (in seconds) for each ad page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((pageId) => (
              <div key={pageId} className="space-y-2">
                <Label htmlFor={`countdown-${pageId}`}>Page {pageId} Countdown</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`countdown-${pageId}`}
                    type="number"
                    min="1"
                    max="120"
                    value={countdowns[pageId] || 0}
                    onChange={(e) => handleCountdownChange(pageId, e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    seconds
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Download Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Download Page Settings</CardTitle>
          <CardDescription>
            Configure the final download page information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="softwareName">Software Name</Label>
            <Input
              id="softwareName"
              value={downloadSettings.softwareName}
              onChange={(e) =>
                setDownloadSettings({ ...downloadSettings, softwareName: e.target.value })
              }
              placeholder="Enter software name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="downloadURL">Download URL</Label>
            <Input
              id="downloadURL"
              value={downloadSettings.downloadURL}
              onChange={(e) =>
                setDownloadSettings({ ...downloadSettings, downloadURL: e.target.value })
              }
              placeholder="https://example.com/download/file.exe"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full gradient-primary text-white shadow-medium">
        <Save className="w-4 h-4 mr-2" />
        Save All Settings
      </Button>
    </div>
  );
};

export default CountdownSettings;
