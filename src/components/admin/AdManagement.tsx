import { useState, useEffect } from "react";
import { loadConfig, saveConfig, Ad } from "@/lib/adFunnelConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

const AdManagement = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Ad>>({});
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = () => {
    const config = loadConfig();
    const allAds = config.pages.flatMap((page) => page.ads);
    setAds(allAds);
  };

  const handleSave = () => {
    if (!formData.title || !formData.imageURL || !formData.linkURL || !formData.assignedPage) {
      toast.error("Please fill all fields");
      return;
    }

    const config = loadConfig();

    if (editingId) {
      // Update existing ad
      config.pages = config.pages.map((page) => ({
        ...page,
        ads: page.ads.map((ad) =>
          ad.id === editingId
            ? { ...ad, ...formData, assignedPage: formData.assignedPage! }
            : ad
        ),
      }));

      // Move ad to correct page if assignedPage changed
      const updatedAd = { ...ads.find((a) => a.id === editingId)!, ...formData };
      config.pages = config.pages.map((page) => ({
        ...page,
        ads: page.ads.filter((ad) => ad.id !== editingId),
      }));
      config.pages[formData.assignedPage! - 1].ads.push(updatedAd as Ad);

      toast.success("Ad updated successfully");
    } else {
      // Add new ad
      const newAd: Ad = {
        id: `ad${Date.now()}`,
        title: formData.title!,
        imageURL: formData.imageURL!,
        linkURL: formData.linkURL!,
        assignedPage: formData.assignedPage!,
      };
      config.pages[formData.assignedPage! - 1].ads.push(newAd);
      toast.success("Ad created successfully");
    }

    saveConfig(config);
    loadAds();
    resetForm();
  };

  const handleEdit = (ad: Ad) => {
    setEditingId(ad.id);
    setFormData(ad);
    setIsAdding(false);
  };

  const handleDelete = (adId: string) => {
    const config = loadConfig();
    config.pages = config.pages.map((page) => ({
      ...page,
      ads: page.ads.filter((ad) => ad.id !== adId),
    }));
    saveConfig(config);
    loadAds();
    toast.success("Ad deleted successfully");
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({});
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advertisement Management</CardTitle>
          <CardDescription>
            Create and manage advertisements for each funnel page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add/Edit Form */}
          {(isAdding || editingId) && (
            <div className="bg-muted/50 rounded-lg p-6 space-y-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">
                  {editingId ? "Edit Advertisement" : "New Advertisement"}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Ad Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter ad title"
                  />
                </div>

                <div>
                  <Label htmlFor="imageURL">Image URL</Label>
                  <Input
                    id="imageURL"
                    value={formData.imageURL || ""}
                    onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="linkURL">Target URL</Label>
                  <Input
                    id="linkURL"
                    value={formData.linkURL || ""}
                    onChange={(e) => setFormData({ ...formData, linkURL: e.target.value })}
                    placeholder="https://example.com/offer"
                  />
                </div>

                <div>
                  <Label htmlFor="page">Assigned Page</Label>
                  <Select
                    value={formData.assignedPage?.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, assignedPage: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Page 1</SelectItem>
                      <SelectItem value="2">Page 2</SelectItem>
                      <SelectItem value="3">Page 3</SelectItem>
                      <SelectItem value="4">Page 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full gradient-primary text-white">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Update Ad" : "Create Ad"}
              </Button>
            </div>
          )}

          {/* Add Button */}
          {!isAdding && !editingId && (
            <Button
              onClick={() => setIsAdding(true)}
              className="w-full gradient-primary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Advertisement
            </Button>
          )}

          {/* Ads List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Current Advertisements</h3>
            {ads.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No advertisements yet. Create your first ad!
              </p>
            ) : (
              <div className="grid gap-4">
                {ads.map((ad) => (
                  <Card key={ad.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={ad.imageURL}
                          alt={ad.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground truncate">
                            {ad.title}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {ad.linkURL}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            Page {ad.assignedPage}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(ad)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ad.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdManagement;
