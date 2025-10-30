'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { User as AppUser } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching app user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching app user:', error);
      return null;
    }
  };

  const refreshAppUser = async () => {
    if (user?.id) {
      const userData = await fetchAppUser(user.id);
      setAppUser(userData);
    }
  };

  useEffect(() => {
    // Set up a timeout fallback to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization timeout - forcing loading to false');
      setLoading(false);
    }, 5000);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeoutId);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchAppUser(session.user.id).then(setAppUser).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      clearTimeout(timeoutId);
      console.error('Error getting initial session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      try {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userData = await fetchAppUser(session.user.id);
          setAppUser(userData);
        } else {
          setAppUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setAppUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Creating user account with immediate sign-in...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name, // Pass name in metadata for trigger to use
          }
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        
        // Provide more user-friendly error messages
        if (error.message?.includes('fetch')) {
          throw new Error('Unable to connect to authentication service. Please check your internet connection and try again.');
        }
        
        throw error;
      }

      console.log('Account created successfully.');
      console.log('Signup data:', data);
      console.log('User created:', data.user ? 'Yes' : 'No');
      console.log('Session created:', data.session ? 'Yes (auto-signin enabled)' : 'No');
      
      // With email confirmation disabled, user should be automatically signed in
      // The auth state change listener will handle fetching the app user data
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle network errors more gracefully
      if (error.name === 'TypeError' && error.message?.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    appUser,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshAppUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}