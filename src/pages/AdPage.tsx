import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { loadConfig, updatePageVisit, updateAdClick } from "@/lib/adFunnelConfig";
import CountdownTimer from "@/components/CountdownTimer";
import AdCard from "@/components/AdCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";

const AdPage = () => {
  const params = useParams();
  const pageIdParam = params.pageId;
  const navigate = useNavigate();

  const [showNext, setShowNext] = useState(false);
  const [pageConfig, setPageConfig] = useState(null);

  // store currentPage in state derived from param
  const currentPage = parseInt(pageIdParam || "1", 10);

  // keep a ref to the latest page so callbacks can confirm they're acting on the right page
  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    // defensive: reset UI when page changes
    setShowNext(false);

    const config = typeof loadConfig === "function" ? loadConfig() : null;
    if (!config || !Array.isArray(config.pages)) {
      console.warn("ad funnel config missing or invalid", config);
      navigate("/");
      return;
    }

    // find page by numeric id (be tolerant of string ids)
    const page = config.pages.find((p) => Number(p.id) === currentPage);
    if (!page) {
      navigate("/");
      return;
    }

    setPageConfig(page);

    // track visit (guarded)
    try {
      updatePageVisit(currentPage);
    } catch (err) {
      console.warn("updatePageVisit failed:", err);
    }

    // ensure showNext is false until countdown triggers for this page
    setShowNext(false);
  }, [currentPage, navigate]);

  // The handler for CountdownTimer completion.
  // We use useCallback so the function identity is stable,
  // but we also check currentPageRef to ensure this completion belongs to the active page.
  const handleCountdownComplete = useCallback(() => {
    // guard: ensure the completion is for the active page
    // (this protects against any stale timer firing after navigation)
    if (currentPageRef.current !== currentPage) {
      // stale completion — ignore
      return;
    }
    setShowNext(true);
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < 4) {
      navigate(`/ad/${currentPage + 1}`);
    } else {
      navigate("/download");
    }
  };

  const handleAdClick = (adId) => {
    try {
      updateAdClick(adId);
    } catch (err) {
      console.warn("updateAdClick failed:", err);
    }
  };

  if (!pageConfig) {
    return null;
  }

  // defensive fallbacks
  const countdownSeconds =
    typeof pageConfig.countdown === "number" && pageConfig.countdown >= 0
      ? pageConfig.countdown
      : 10;
  const ads = Array.isArray(pageConfig.ads) ? pageConfig.ads : [];

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
            <div className="flex items-center gap-4">
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
              <Link to="/user/dashboard">
                <Button variant="outline" size="sm">User Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Countdown Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Preparing Your Download</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your download will be ready in a moment. While you wait, check out these premium
              offers from our partners.
            </p>

            <div className="pt-6">
              {/* IMPORTANT: give CountdownTimer a key that changes per-page so it remounts fresh.
                  This prevents any internal timer state from leaking across pages. */}
              <CountdownTimer
                key={`countdown-page-${currentPage}-${countdownSeconds}`}
                seconds={countdownSeconds}
                onComplete={handleCountdownComplete}
              />
            </div>
          </div>

          {/* Ads Section */}
          {ads.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                Featured Offers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad) => (
                  <AdCard key={ad.id} ad={ad} onAdClick={() => handleAdClick(ad.id)} />
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
