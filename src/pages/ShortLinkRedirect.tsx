import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const ShortLinkRedirect = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirectToOriginalUrl = async () => {
      if (!shortCode) {
        setError("Invalid short link");
        return;
      }

      // Fetch the short link data
      const { data, error: fetchError } = await supabase
        .from("short_links")
        .select("*")
        .eq("short_code", shortCode)
        .single();

      if (fetchError || !data) {
        setError("Short link not found");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      // Increment click count
      await supabase
        .from("short_links")
        .update({ click_count: data.click_count + 1 })
        .eq("short_code", shortCode);

      // Redirect to original URL
      window.location.href = data.original_url;
    };

    redirectToOriginalUrl();
  }, [shortCode, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Redirecting...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you</p>
      </div>
    </div>
  );
};

export default ShortLinkRedirect;
