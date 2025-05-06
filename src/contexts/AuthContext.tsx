
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  checkUserIsAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isAdmin: false,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => ({}),
  checkUserIsAdmin: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Get user on mount
  useEffect(() => {
    console.info('AuthProvider initialized');
    
    const getSession = async () => {
      setLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.info('Auth state changed: INITIAL_SESSION');
        console.info(`Got existing session: ${session ? 'yes' : 'no'}`);
        
        if (error) {
          throw error;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const isUserAdmin = await checkUserIsAdmin();
          setIsAdmin(isUserAdmin);
        }
      } catch (error) {
        console.error('Error retrieving session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.info(`Auth state changed: ${event}`);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const isUserAdmin = await checkUserIsAdmin();
        setIsAdmin(isUserAdmin);
      } else {
        setIsAdmin(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Check if user has admin role
  const checkUserIsAdmin = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return !!data?.is_admin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      return { data, error };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error && data.user) {
        const isUserAdmin = await checkUserIsAdmin();
        setIsAdmin(isUserAdmin);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setIsAdmin(false);
      return { error };
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isAdmin,
        signUp,
        signIn,
        signOut,
        checkUserIsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
