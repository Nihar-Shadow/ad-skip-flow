import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Download, Upload } from "lucide-react";
import { exportConfig, importConfig } from "@/lib/adFunnelConfig";
import { toast } from "sonner";

const ConfigManager = () => {
  const [importData, setImportData] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([config], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-funnel-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Configuration exported successfully");
  };

  const handleImport = () => {
    const success = importConfig(importData);
    if (success) {
      toast.success("Configuration imported successfully");
      setImportData("");
      setIsImportOpen(false);
      window.location.reload();
    } else {
      toast.error("Failed to import configuration. Please check the JSON format.");
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleExport} variant="outline" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Configuration</DialogTitle>
            <DialogDescription>
              Paste your configuration JSON below to restore settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your JSON configuration here..."
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleImport} className="flex-1 gradient-primary text-white">
                Import Configuration
              </Button>
              <Button onClick={() => setIsImportOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfigManager;
