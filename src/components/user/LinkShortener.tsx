import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, Plus, Trash2 } from 'lucide-react';
import type { ShortLink } from '@/lib/userData';

interface LinkShortenerProps {
  links: ShortLink[];
  onLinkAdded: (link: ShortLink) => void;
}

const LinkShortener: React.FC<LinkShortenerProps> = ({ links, onLinkAdded }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customShortCode, setCustomShortCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateShortCode = (): string => {
    if (customShortCode.trim()) {
      return customShortCode.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    }
    return Math.random().toString(36).substring(2, 8);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!originalUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(originalUrl)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    if (customShortCode.trim() && !/^[a-zA-Z0-9-]+$/.test(customShortCode.trim())) {
      setError('Custom short code can only contain letters, numbers, and hyphens');
      return;
    }

    const shortCode = generateShortCode();
    
    // Check if short code already exists
    if (links.some(link => link.shortCode === shortCode)) {
      setError('This short code is already taken. Please try another one.');
      return;
    }

    setIsCreating(true);

    try {
      const newLink: ShortLink = {
        id: Date.now().toString(),
        originalUrl: originalUrl.trim(),
        shortCode,
        clickCount: 0,
        createdAt: new Date().toISOString()
      };

      onLinkAdded(newLink);
      
      // Reset form
      setOriginalUrl('');
      setCustomShortCode('');
    } catch (err) {
      setError('Failed to create short link. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async (shortCode: string) => {
    const shortUrl = `${window.location.origin}/s/${shortCode}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(shortCode);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Create Short Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="originalUrl">Original URL *</Label>
              <Input
                id="originalUrl"
                type="url"
                placeholder="https://example.com/your-long-url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customShortCode">Custom Short Code (optional)</Label>
              <Input
                id="customShortCode"
                type="text"
                placeholder="my-custom-code (leave blank for random)"
                value={customShortCode}
                onChange={(e) => setCustomShortCode(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Only letters, numbers, and hyphens allowed
              </p>
            </div>

            <Button
              type="submit"
              disabled={isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Short Link'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Short Links</CardTitle>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-2">No short links yet</div>
              <p className="text-gray-400">Create your first short link above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {link.shortCode}
                        </span>
                        <span className="text-xs text-gray-500">
                          {link.clickCount} clicks
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 break-all mb-1">
                        Original: {link.originalUrl}
                      </div>
                      <div className="text-xs text-gray-400">
                        Created: {formatDate(link.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(link.shortCode)}
                        className={copiedId === link.shortCode ? 'bg-green-50 border-green-300' : ''}
                      >
                        {copiedId === link.shortCode ? (
                          <>
                            <div className="h-4 w-4 mr-1">✓</div>
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      <a
                        href={`/s/${link.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Visit
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{links.length}</div>
              <div className="text-sm text-gray-600">Total Links</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {links.reduce((sum, link) => sum + link.clickCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Clicks</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {links.length > 0 ? Math.round(links.reduce((sum, link) => sum + link.clickCount, 0) / links.length) : 0}
              </div>
              <div className="text-sm text-gray-600">Avg Clicks/Link</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkShortener;