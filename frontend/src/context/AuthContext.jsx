
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  getCurrentSession,
  getUserProfile,
  subscribeToAuthChanges,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const [authInitialized, setAuthInitialized] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // 1. Initialize and monitor the Supabase session.
  useEffect(() => {
    let mounted = true;

    const unsubscribe = subscribeToAuthChanges(
  (_event, nextSession) => {
    if (!mounted) return;

    setSession(nextSession);
  }
);

    async function initializeSession() {
      try {
        const currentSession = await getCurrentSession();

        if (mounted) {
          setSession(currentSession);
        }
      } catch (error) {
        console.error('Session initialization error:', error);

        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setAuthInitialized(true);
        }
      }
    }

    initializeSession();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // 2. Fetch the profile separately when the user changes.
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const userId = session?.user?.id;

      if (!userId) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      setProfile(null);

      try {
        const userProfile = await getUserProfile(userId);

        if (!cancelled) {
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Unable to load user profile:', error);

        if (!cancelled) {
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    if (authInitialized) {
      loadProfile();
    }

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, authInitialized]);

  
const refreshProfile = async () => {
  const userId = session?.user?.id;

  if (!userId) return null;

  try {
    const updatedProfile = await getUserProfile(userId);
    setProfile(updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Unable to refresh profile:', error);
    throw error;
  }
};


const loading = !authInitialized || profileLoading;

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isAuthenticated: Boolean(
      session?.user && profile && profile.account_status === 'active'
    ),
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
