import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadConfig, updatePageVisit, updateAdClick } from "@/lib/adFunnelConfig";
import CountdownTimer from "@/components/CountdownTimer";
import AdCard from "@/components/AdCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";

const AdPage = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [showNext, setShowNext] = useState(false);
  const [pageConfig, setPageConfig] = useState<any>(null);

  const currentPage = parseInt(pageId || "1", 10);

  useEffect(() => {
    const config = loadConfig();
    const page = config.pages.find((p) => p.id === currentPage);
    
    if (!page) {
      navigate("/");
      return;
    }

    setPageConfig(page);
    updatePageVisit(currentPage);
  }, [currentPage, navigate]);

  const handleCountdownComplete = () => {
    setShowNext(true);
  };

  const handleNext = () => {
    if (currentPage < 4) {
      navigate(`/ad/${currentPage + 1}`);
    } else {
      navigate("/download");
    }
  };

  const handleAdClick = (adId: string) => {
    updateAdClick(adId);
  };

  if (!pageConfig) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Software Download</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Step {currentPage} of 4</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-smooth ${
                      step <= currentPage ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Countdown Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Preparing Your Download
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your download will be ready in a moment. While you wait, check out these premium offers from our partners.
            </p>
            
            <div className="pt-6">
              <CountdownTimer
                seconds={pageConfig.countdown}
                onComplete={handleCountdownComplete}
              />
            </div>
          </div>

          {/* Ads Section */}
          {pageConfig.ads.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                Featured Offers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageConfig.ads.map((ad: any) => (
                  <AdCard key={ad.id} ad={ad} onAdClick={handleAdClick} />
                ))}
              </div>
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-center">
            {showNext ? (
              <Button
                onClick={handleNext}
                size="lg"
                className="gradient-primary text-white shadow-large hover:shadow-medium transition-smooth group"
              >
                {currentPage < 4 ? (
                  <>
                    Continue to Next Step
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-smooth" />
                  </>
                ) : (
                  <>
                    Get Your Download
                    <Download className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Next button will appear when countdown completes</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdPage;
