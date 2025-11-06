export interface User {
  id: string;
  username: string;
  role: "admin" | "developer";
  created_at: string;
}

export interface AuthUser {
  username: string;
  role: "admin" | "developer";
  loggedIn: boolean;
  sessionStart?: number;
  lastActivity?: number;
}

// Hardcoded credentials as requested
const HARDCODED_USERS = [
  {
    id: "1",
    username: "pikachu",
    password: "Ad@123",
    role: "admin" as const,
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    username: "fkingdev",
    password: "Fd@123",
    role: "developer" as const,
    created_at: new Date().toISOString()
  }
];

export const auth = {
  SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
  
  clearAllCache(): void {
    // Clear all localStorage items related to auth and config
    const keysToRemove = [
      'auth_user',
      'adFunnelConfig',
      'supabase.auth.token',
      'supabase.auth.refreshToken'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove key:', key, error);
      }
    });
    
    // Clear session storage as well
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
    
    console.log('🧹 DEBUG: All cache cleared');
  },
  
  isSessionValid(): boolean {
    try {
      const stored = localStorage.getItem('auth_user');
      if (!stored) return false;
      
      const authUser: AuthUser = JSON.parse(stored);
      if (!authUser.loggedIn) return false;
      
      // Check session timeout
      const now = Date.now();
      const sessionStart = authUser.sessionStart || now;
      const lastActivity = authUser.lastActivity || now;
      
      // Check if session expired (24 hours)
      if (now - sessionStart > this.SESSION_TIMEOUT_MS) {
        console.log('⏰ DEBUG: Session expired - timeout');
        return false;
      }
      
      // Check if inactive for more than 4 hours
      if (now - lastActivity > 4 * 60 * 60 * 1000) {
        console.log('⏰ DEBUG: Session expired - inactivity');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ DEBUG: Session validation error:', error);
      return false;
    }
  },
  
  updateLastActivity(): void {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        const authUser: AuthUser = JSON.parse(stored);
        if (authUser.loggedIn) {
          authUser.lastActivity = Date.now();
          localStorage.setItem('auth_user', JSON.stringify(authUser));
        }
      }
    } catch (error) {
      console.error('❌ DEBUG: Failed to update last activity:', error);
    }
  },
  
  async login(username: string, password: string): Promise<User | null> {
    try {
      console.log('🔍 DEBUG: Attempting login for username:', username);
      console.log('🔍 DEBUG: Password provided:', password ? 'yes' : 'no');
      
      // Clear any existing session before login
      this.clearAllCache();
      
      // Find user in hardcoded credentials
      const user = HARDCODED_USERS.find(
        u => u.username === username && u.password === password
      );

      console.log('🔍 DEBUG: User found:', user ? 'yes' : 'no');
      console.log('🔍 DEBUG: Available users:', HARDCODED_USERS.map(u => ({ username: u.username, role: u.role })));

      if (!user) {
        console.log('❌ DEBUG: Login failed - invalid credentials');
        return null;
      }

      // Create user object without password
      const userData: User = {
        id: user.id,
        username: user.username,
        role: user.role,
        created_at: user.created_at
      };

      // Store session in localStorage with session tracking
      const authUser: AuthUser = {
        username: userData.username,
        role: userData.role,
        loggedIn: true,
        sessionStart: Date.now(),
        lastActivity: Date.now()
      };
      localStorage.setItem('auth_user', JSON.stringify(authUser));

      console.log('✅ DEBUG: Login successful!', userData);
      return userData;
    } catch (error) {
      console.error('❌ DEBUG: Login error:', error);
      return null;
    }
  },

  logout(): void {
    console.log('🚪 DEBUG: Logging out user');
    this.clearAllCache();
  },

  getCurrentUser(): AuthUser | null {
    const stored = localStorage.getItem('auth_user');
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const isValid = user?.loggedIn === true && this.isSessionValid();
    
    if (user?.loggedIn && !isValid) {
      console.log('🔒 DEBUG: Session invalid, clearing cache');
      this.clearAllCache();
    }
    
    return isValid;
  },

  hasRole(role: "admin" | "developer"): boolean {
    const user = this.getCurrentUser();
    return user?.loggedIn === true && user?.role === role;
  },

  getUserRole(): "admin" | "developer" | null {
    const user = this.getCurrentUser();
    return user?.loggedIn ? user.role : null;
  }
};