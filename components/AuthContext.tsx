import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  name?: string;
  profession?: string;
  company?: string;
  phone?: string;
  memberType?: string;
}

interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string, profession?: string, company?: string, phone?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user) {
        setUser({
          id: initialSession.user.id,
          email: initialSession.user.email || '',
          name: initialSession.user.user_metadata?.name,
          profession: initialSession.user.user_metadata?.profession,
          company: initialSession.user.user_metadata?.company,
          phone: initialSession.user.user_metadata?.phone,
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            name: currentSession.user.user_metadata?.name,
            profession: currentSession.user.user_metadata?.profession,
            company: currentSession.user.user_metadata?.company,
            phone: currentSession.user.user_metadata?.phone,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Sign in error:', error);
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.log('Sign in error:', error);
      return { error: 'Failed to sign in' };
    }
  };

  const signUp = async (email: string, password: string, name: string, profession?: string, company?: string, phone?: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b2be43be/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email,
          password,
          name,
          profession,
          company,
          phone
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.log('Signup error:', result);
        return { error: result.error || 'Failed to create account' };
      }

      return {};
    } catch (error) {
      console.log('Signup error:', error);
      return { error: 'Failed to create account' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const getAccessToken = () => {
    return session?.access_token || null;
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    getAccessToken,
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