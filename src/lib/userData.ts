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
  userId?: string;
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
  ads_uploaded: any;
  downloads: any;
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

      return data as UserData;
    } catch (error) {
      console.error('Error in getUserData:', error);
      return null;
    }
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
        user_id: user.id
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

      return data as UserData;
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
        .update({ ads_uploaded: ads })
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
        .update({ downloads: countdown })
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

  async getShortLinks(): Promise<ShortLink[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('short_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching short links:', error);
        throw error;
      }

      return (data || []).map(link => ({
        id: link.id,
        originalUrl: link.original_url,
        shortCode: link.short_code,
        clickCount: link.click_count,
        createdAt: link.created_at,
        userId: link.user_id
      })) as ShortLink[];
    } catch (error) {
      console.error('Error in getShortLinks:', error);
      throw error;
    }
  },

  async addShortLink(link: ShortLink): Promise<ShortLink> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      let shortCode = link.shortCode;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        // Check if short_code already exists
        const { data: existingLink, error: checkError } = await supabase
          .from('short_links')
          .select('id')
          .eq('short_code', shortCode)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error checking short code uniqueness:', checkError);
          throw checkError;
        }

        if (!existingLink) {
          break; // Code is unique
        }

        // Generate new code if duplicate
        shortCode = Math.random().toString(36).substring(2, Math.floor(Math.random() * 3) + 8); // 6-8 chars
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique short code. Please try again.');
      }

      // Insert into short_links table
      const { data: insertedLink, error: insertError } = await supabase
        .from('short_links')
        .insert({
          short_code: shortCode,
          original_url: link.originalUrl,
          user_id: user.id,
          click_count: 0
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting short link:', insertError);
        throw insertError;
      }

      return {
        id: insertedLink.id,
        originalUrl: insertedLink.original_url,
        shortCode: insertedLink.short_code,
        clickCount: insertedLink.click_count,
        createdAt: insertedLink.created_at,
        userId: insertedLink.user_id
      } as ShortLink;
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
        .update({ downloads: analytics })
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

      return data as UserData[];
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