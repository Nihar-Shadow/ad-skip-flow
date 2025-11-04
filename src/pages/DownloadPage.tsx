import { useEffect } from "react";
import { loadConfig, updatePageVisit, updateDownloadCount } from "@/lib/adFunnelConfig";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Shield, Zap } from "lucide-react";
import { toast } from "sonner";

const DownloadPage = () => {
  useEffect(() => {
    updatePageVisit(5);
  }, []);

  const handleDownload = () => {
    const config = loadConfig();
    updateDownloadCount();
    
    toast.success("Download Started!", {
      description: "Your software is now downloading...",
    });

    // Simulate download
    window.location.href = config.downloadURL;
  };

  const config = loadConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Card */}
          <div className="bg-card rounded-2xl shadow-large p-8 md:p-12 border border-border">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-gradient-success rounded-full p-6 shadow-large">
                  <CheckCircle className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-3">
                You're All Set!
              </h1>
              <p className="text-lg text-muted-foreground">
                Thank you for your patience. Your download is ready.
              </p>
            </div>

            {/* Software Info */}
            <div className="bg-muted/50 rounded-lg p-6 mb-8 border border-border/50">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-lg p-3">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-foreground mb-1">
                    {config.softwareName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Latest version • Fully licensed • Safe & secure
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-secondary" />
                <span className="text-muted-foreground">Virus-free</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Zap className="w-5 h-5 text-accent" />
                <span className="text-muted-foreground">Fast Download</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span className="text-muted-foreground">Verified File</span>
              </div>
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              size="lg"
              className="w-full gradient-success text-white shadow-large hover:shadow-medium transition-smooth group text-lg py-6"
            >
              <Download className="mr-2 w-6 h-6 group-hover:animate-bounce" />
              Download Now
            </Button>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                By downloading, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>

          {/* Support Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Need help? Contact our{" "}
              <a href="#" className="text-primary hover:underline">
                support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
