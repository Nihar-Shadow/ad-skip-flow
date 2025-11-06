import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Trash2, ExternalLink, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ShortLink {
  id: string;
  short_code: string;
  original_url: string;
  click_count: number;
  created_at: string;
}

const LinkShortener = () => {
  const [longUrl, setLongUrl] = useState("");
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchShortLinks();
  }, []);

  const fetchShortLinks = async () => {
    const { data, error } = await supabase
      .from("short_links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch short links",
        variant: "destructive",
      });
      return;
    }

    setShortLinks(data || []);
  };

  const generateShortCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateShortLink = async () => {
    if (!longUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(longUrl);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const shortCode = generateShortCode();

    const { error } = await supabase.from("short_links").insert({
      short_code: shortCode,
      original_url: longUrl,
      click_count: 0,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create short link",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Short link created successfully",
    });

    setLongUrl("");
    fetchShortLinks();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("short_links").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete short link",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Short link deleted successfully",
    });

    fetchShortLinks();
  };

  const copyToClipboard = (shortCode: string) => {
    const fullUrl = `${window.location.origin}/s/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Copied",
      description: "Short link copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Create Short Link
          </CardTitle>
          <CardDescription>
            Generate a short link for any URL and track clicks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="Enter long URL (e.g., https://example.com/very/long/url)"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleGenerateShortLink()}
              className="flex-1"
            />
            <Button onClick={handleGenerateShortLink} disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Short Links</CardTitle>
          <CardDescription>
            Manage and track all your shortened URLs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shortLinks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No short links created yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Short Link</TableHead>
                    <TableHead>Original URL</TableHead>
                    <TableHead className="text-center">Clicks</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shortLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            /s/{link.short_code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(link.short_code)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={link.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 max-w-md truncate"
                        >
                          <span className="truncate">{link.original_url}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {link.click_count}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(link.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(link.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkShortener;
