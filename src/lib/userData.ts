import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";

export type UserData = Database["public"]["Tables"]["users_data"]["Row"];
export type UserDataInsert = Database["public"]["Tables"]["users_data"]["Insert"];
export type UserDataUpdate = Database["public"]["Tables"]["users_data"]["Update"];

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  createdAt: string;
  [key: string]: any;
}

export interface ShortLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  clickCount: number;
  createdAt: string;
  [key: string]: Json | undefined;
}

export interface Analytics {
  totalClicks: number;
  totalViews: number;
  popularLinks: Array<{
    url: string;
    clicks: number;
  }>;
  adPerformance: Array<{
    adId: string;
    views: number;
    clicks: number;
    ctr: number;
  }>;
  // Index signature to make Analytics compatible with Json type
  [key: string]: any;
}

interface UserDataActual {
  id: string;
  user_id: string;
  ads: any;
  countdown: number;
  short_links: any;
  analytics: any;
  created_at: string;
  updated_at: string;
}

export const userDataAPI = {
  async getUserData(): Promise<UserData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      return data ? this.transformUserData(data as UserDataActual) : null;
    } catch (error) {
      console.error('Error in getUserData:', error);
      return null;
    }
  },

  transformUserData(data: UserDataActual): UserData {
    return {
      ...data,
      ads: typeof data.ads === 'string' ? JSON.parse(data.ads) : (Array.isArray(data.ads) ? data.ads : []),
      short_links: typeof data.short_links === 'string' ? JSON.parse(data.short_links) : (Array.isArray(data.short_links) ? data.short_links : []),
      analytics: typeof data.analytics === 'string' ? JSON.parse(data.analytics) : (data.analytics || {
        totalClicks: 0,
        totalViews: 0,
        popularLinks: [],
        adPerformance: []
      })
    };
  },

  async getOrCreateUserData(): Promise<UserData> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Try to get existing data
      let userData = await this.getUserData();
      if (userData) return userData;

      // Create new user data if it doesn't exist
      const newUserData: UserDataInsert = {
        user_id: user.id,
        ads: [],
        countdown: 30,
        short_links: [],
        analytics: {
          totalClicks: 0,
          totalViews: 0,
          popularLinks: [],
          adPerformance: []
        }
      };

      const { data, error } = await supabase
        .from('users_data')
        .insert(newUserData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user data:', error);
        throw error;
      }

      return this.transformUserData(data as UserDataActual);
    } catch (error) {
      console.error('Error in getOrCreateUserData:', error);
      throw error;
    }
  },

  async updateAds(ads: Ad[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('users_data')
        .update({ ads })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating ads:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateAds:', error);
      throw error;
    }
  },

  async updateCountdown(countdown: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('users_data')
        .update({ countdown })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating countdown:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateCountdown:', error);
      throw error;
    }
  },

  async addShortLink(link: ShortLink): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get current short links
      const { data: currentData, error: fetchError } = await supabase
        .from('users_data')
        .select('short_links')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current short links:', fetchError);
        throw fetchError;
      }

      const currentLinksRaw = currentData?.short_links;
      const currentLinks: ShortLink[] = Array.isArray(currentLinksRaw)
        ? (currentLinksRaw as ShortLink[])
        : [];
      const updatedLinks: ShortLink[] = [...currentLinks, link];

      const { error } = await supabase
        .from('users_data')
        .update({ short_links: updatedLinks })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error adding short link:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in addShortLink:', error);
      throw error;
    }
  },

  async updateAnalytics(analytics: Analytics): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('users_data')
        .update({ analytics })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating analytics:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateAnalytics:', error);
      throw error;
    }
  },

  async deleteUserData(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('users_data')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting user data:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteUserData:', error);
      throw error;
    }
  },

  // Admin/Developer functions (get all users data)
  async getAllUsersData(): Promise<UserData[]> {
    try {
      const { data, error } = await supabase
        .from('users_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all users data:', error);
        throw error;
      }

      return data ? data.map(item => this.transformUserData(item as UserDataActual)) : [];
    } catch (error) {
      console.error('Error in getAllUsersData:', error);
      throw error;
    }
  },

  async updateUserDataByUserId(userId: string, updates: Partial<UserDataUpdate>): Promise<void> {
    try {
      const { error } = await supabase
        .from('users_data')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user data by user ID:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateUserDataByUserId:', error);
      throw error;
    }
  }
};