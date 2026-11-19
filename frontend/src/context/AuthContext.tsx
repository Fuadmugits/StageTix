'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

import { checkCrewStatus, SUPER_ADMIN_EMAIL } from '@/lib/crewAccess';

export { SUPER_ADMIN_EMAIL };

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isApprovedCrew: boolean;
  crewStatus: 'SUPER_ADMIN' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'NONE';
  signInWithGoogle: () => Promise<void>;
  sendEmailVerification: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<void>;
  refreshCrewStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [crewInfo, setCrewInfo] = useState(() => checkCrewStatus(user?.email));

  const refreshCrewStatus = () => {
    setCrewInfo(checkCrewStatus(user?.email));
  };

  useEffect(() => {
    setCrewInfo(checkCrewStatus(user?.email));
  }, [user?.email]);

  const isSuperAdmin = crewInfo.isSuperAdmin;
  const isApprovedCrew = crewInfo.isApproved;
  // Akses admin/kru diizinkan jika Super Admin atau kru yang telah diapprove
  const isAdmin = isSuperAdmin || isApprovedCrew;
  const crewStatus = crewInfo.status;

  const mergeCustomProfile = (authUser: User): User => {
    if (typeof window === 'undefined') return authUser;
    try {
      if (authUser.email) {
        const emailKey = `stagetix_profile_${authUser.email.toLowerCase()}`;
        const savedProfile = localStorage.getItem(emailKey);
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          return {
            ...authUser,
            user_metadata: {
              ...authUser.user_metadata,
              ...parsed,
            },
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return authUser;
  };

  useEffect(() => {
    // 1. Get initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(mergeCustomProfile(session.user));
      }
      setLoading(false);
    });

    // 2. Listen to authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setSession(session);
          setUser(mergeCustomProfile(session.user));
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Function: Sign In with Google OAuth (Real Supabase OAuth)
  const signInWithGoogle = async () => {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : 'http://localhost:3000/auth/callback';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google Sign In Error:', error.message);
      throw error;
    }
  };

  // Function: Send Email OTP / Verification Magic Link
  const sendEmailVerification = async (email: string) => {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : 'http://localhost:3000/auth/callback';

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('Email Verification Error:', error.message);
      throw error;
    }
  };

  // Function: Sign Out
  const signOut = async () => {
    setUser(null);
    setSession(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('stagetix_google_demo_user');
      localStorage.removeItem('stagetix_custom_profile');
      // Profile per email tetap tersimpan per akun masing-masing
    }
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore if offline
    }
  };

  // Function: Update Profile (Avatar & Full Name)
  const updateProfile = async ({ full_name, avatar_url }: { full_name?: string; avatar_url?: string }) => {
    let updatedSupabaseUser: User | null = null;

    // 1. Try updating in Supabase Auth if connected
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...(full_name !== undefined ? { full_name } : {}),
          ...(avatar_url !== undefined ? { avatar_url, picture: avatar_url } : {}),
        }
      });
      if (error) {
        console.warn('Supabase profile update warning:', error.message);
      }
      if (data?.user) {
        updatedSupabaseUser = data.user;
      }
    } catch (e) {
      console.warn('Supabase offline or update failed:', e);
    }

    // 2. Local state update & localStorage persistence per email
    setUser(prev => {
      const baseUser = updatedSupabaseUser || prev || user;
      if (!baseUser) return null;
      const updatedUser: User = {
        ...baseUser,
        user_metadata: {
          ...baseUser.user_metadata,
          ...(full_name !== undefined ? { full_name } : {}),
          ...(avatar_url !== undefined ? { avatar_url, picture: avatar_url } : {}),
        }
      };
      if (typeof window !== 'undefined' && baseUser.email) {
        const emailKey = `stagetix_profile_${baseUser.email.toLowerCase()}`;
        localStorage.setItem(emailKey, JSON.stringify(updatedUser.user_metadata));
        // Remove old legacy shared key
        localStorage.removeItem('stagetix_custom_profile');
      }
      return updatedUser;
    });
  };

  // Rehydrate custom profile overrides if saved in local storage (strictly by email)
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.email) {
      const emailKey = `stagetix_profile_${user.email.toLowerCase()}`;
      const savedProfile = localStorage.getItem(emailKey);
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed.avatar_url || parsed.full_name) {
            setUser(prev => {
              if (!prev) return null;
              return {
                ...prev,
                user_metadata: {
                  ...prev.user_metadata,
                  ...parsed,
                }
              };
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [user?.email, user?.id]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isAdmin, 
      isSuperAdmin, 
      isApprovedCrew, 
      crewStatus, 
      signInWithGoogle, 
      sendEmailVerification, 
      signOut, 
      updateProfile,
      refreshCrewStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
