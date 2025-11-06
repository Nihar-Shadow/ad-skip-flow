import { useEffect } from 'react';
import { auth } from '@/lib/auth';

/**
 * Hook to automatically clean up invalid sessions and handle session timeouts
 * This should be used in the main App component or at the root level
 */
export const useSessionCleanup = () => {
  useEffect(() => {
    const cleanupSession = () => {
      console.log('🧹 DEBUG: Running session cleanup');
      
      // Check if session is valid
      if (!auth.isSessionValid() && auth.getCurrentUser()) {
        console.log('🧹 DEBUG: Found invalid session, clearing cache');
        auth.clearAllCache();
        
        // Force reload if on a protected page
        const protectedPaths = ['/admin', '/developer'];
        const currentPath = window.location.pathname;
        
        if (protectedPaths.some(path => currentPath.startsWith(path))) {
          console.log('🧹 DEBUG: On protected page, forcing reload');
          window.location.href = '/login';
        }
      }
    };

    // Run cleanup on mount
    cleanupSession();
    
    // Set up periodic cleanup every 30 seconds
    const interval = setInterval(cleanupSession, 30000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);
};

/**
 * Hook to update last activity on user interaction
 * This should be used in components that handle user interactions
 */
export const useActivityTracker = () => {
  useEffect(() => {
    const updateActivity = () => {
      if (auth.isAuthenticated()) {
        auth.updateLastActivity();
      }
    };

    // Update activity on common user interactions
    const events = ['click', 'keydown', 'scroll', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);
};