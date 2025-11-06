import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, TrendingUp, Eye, MousePointer, RefreshCw, ExternalLink } from 'lucide-react';
import type { Analytics } from '@/lib/userData';

interface MyAnalyticsProps {
  analytics: Analytics;
  onAnalyticsUpdate: (analytics: Analytics) => void;
}

const MyAnalytics: React.FC<MyAnalyticsProps> = ({ analytics, onAnalyticsUpdate }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate data refresh - in a real app, this would fetch fresh data
      const refreshedAnalytics: Analytics = {
        ...analytics,
        totalClicks: analytics.totalClicks + Math.floor(Math.random() * 10),
        totalViews: analytics.totalViews + Math.floor(Math.random() * 20),
        popularLinks: analytics.popularLinks.map(link => ({
          ...link,
          clicks: link.clicks + Math.floor(Math.random() * 5)
        })),
        adPerformance: analytics.adPerformance.map(ad => ({
          ...ad,
          views: ad.views + Math.floor(Math.random() * 10),
          clicks: ad.clicks + Math.floor(Math.random() * 3),
          ctr: ad.views > 0 ? ((ad.clicks + Math.floor(Math.random() * 3)) / (ad.views + Math.floor(Math.random() * 10)) * 100) : 0
        }))
      };
      
      await onAnalyticsUpdate(refreshedAnalytics);
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return num.toFixed(1) + '%';
  };

  const getTimeframeLabel = (timeframe: string): string => {
    const labels = {
      '1d': 'Last 24 hours',
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days'
    };
    return labels[timeframe as keyof typeof labels] || 'Last 7 days';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">My Analytics</h2>
          <p className="text-gray-600">Track your ad and link performance</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Views</p>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(analytics.totalViews)}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12.5% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Clicks</p>
                <p className="text-2xl font-bold text-green-900">{formatNumber(analytics.totalClicks)}</p>
              </div>
              <MousePointer className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8.2% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">CTR</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatPercentage(analytics.totalViews > 0 ? (analytics.totalClicks / analytics.totalViews) * 100 : 0)}
                </p>
              </div>
              <BarChart className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+2.1% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Links</p>
                <p className="text-2xl font-bold text-orange-900">{analytics.popularLinks.length}</p>
              </div>
              <ExternalLink className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+15.3% from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Links */}
      {analytics.popularLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.popularLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{link.url}</p>
                    <p className="text-xs text-gray-500">{link.clicks} clicks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatNumber(link.clicks)}</p>
                    <p className="text-xs text-gray-500">clicks</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ad Performance */}
      {analytics.adPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ad Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.adPerformance.map((ad, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">Ad ID: {ad.adId}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPercentage(ad.ctr)} CTR
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{formatNumber(ad.views)}</p>
                      <p className="text-xs text-gray-500">Views</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{formatNumber(ad.clicks)}</p>
                      <p className="text-xs text-gray-500">Clicks</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{formatPercentage(ad.ctr)}</p>
                      <p className="text-xs text-gray-500">CTR</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {analytics.popularLinks.length === 0 && analytics.adPerformance.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No analytics data yet</div>
            <p className="text-gray-400 mb-4">
              Start creating ads and short links to see your performance metrics here
            </p>
            <div className="text-sm text-gray-500">
              <p>• Create your first advertisement in the "My Ads" tab</p>
              <p>• Generate short links in the "Links" tab</p>
              <p>• Analytics will appear here as you get views and clicks</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeframe Info */}
      <div className="text-center text-sm text-gray-500">
        Showing data for: {getTimeframeLabel(selectedTimeframe)}
      </div>
    </div>
  );
};

export default MyAnalytics;