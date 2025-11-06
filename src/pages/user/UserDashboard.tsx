import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseLogout, isSupabaseAuthenticated } from '@/lib/auth';
import { userDataAPI, type UserData, type Ad, type ShortLink, type Analytics } from '@/lib/userData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MyAdsSection from '@/components/user/MyAdsSection';
import CountdownSettings from '@/components/user/CountdownSettings';
import LinkShortener from '@/components/user/LinkShortener';
import MyAnalytics from '@/components/user/MyAnalytics';

const UserDashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const isAuthenticated = await isSupabaseAuthenticated();
        if (!isAuthenticated) {
          navigate('/user/login');
          return;
        }

        const data = await userDataAPI.getOrCreateUserData();
        setUserData(data);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabaseLogout();
      navigate('/user/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleUpdateAds = async (ads: Ad[]) => {
    try {
      await userDataAPI.updateAds(ads);
      setUserData(prev => prev ? { ...prev, ads } : null);
    } catch (err) {
      console.error('Error updating ads:', err);
      setError('Failed to update ads. Please try again.');
    }
  };

  const handleUpdateCountdown = async (countdown: number) => {
    try {
      await userDataAPI.updateCountdown(countdown);
      setUserData(prev => prev ? { ...prev, countdown } : null);
    } catch (err) {
      console.error('Error updating countdown:', err);
      setError('Failed to update countdown. Please try again.');
    }
  };

  const handleAddShortLink = async (link: ShortLink) => {
    try {
      await userDataAPI.addShortLink(link);
      const updatedData = await userDataAPI.getUserData();
      setUserData(updatedData);
    } catch (err) {
      console.error('Error adding short link:', err);
      setError('Failed to add short link. Please try again.');
    }
  };

  const handleUpdateAnalytics = async (analytics: Analytics) => {
    try {
      await userDataAPI.updateAnalytics(analytics);
      setUserData(prev => prev ? { ...prev, analytics } : null);
    } catch (err) {
      console.error('Error updating analytics:', err);
      setError('Failed to update analytics. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} className="mt-4 w-full">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No user data found.</p>
          <Button onClick={() => navigate('/user/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
              <p className="text-gray-600">Manage your ads, links, and analytics</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="ads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ads">🧩 My Ads</TabsTrigger>
            <TabsTrigger value="countdown">⏱ Countdown</TabsTrigger>
            <TabsTrigger value="links">🔗 Links</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="ads">
            <MyAdsSection
              ads={Array.isArray(userData.ads) ? (userData.ads as Ad[]) : []}
              onAdsUpdate={handleUpdateAds}
            />
          </TabsContent>

          <TabsContent value="countdown">
            <CountdownSettings
              currentCountdown={userData.countdown || 30}
              onCountdownUpdate={handleUpdateCountdown}
            />
          </TabsContent>

          <TabsContent value="links">
            <LinkShortener
              links={Array.isArray(userData.short_links) ? (userData.short_links as ShortLink[]) : []}
              onLinkAdded={handleAddShortLink}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <MyAnalytics
              analytics={(userData.analytics as Analytics) || ({
                totalClicks: 0,
                totalViews: 0,
                popularLinks: [],
                adPerformance: []
              } as Analytics)}
              onAnalyticsUpdate={handleUpdateAnalytics}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;