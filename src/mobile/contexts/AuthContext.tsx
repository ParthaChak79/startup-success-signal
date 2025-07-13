import React, {createContext, useContext, useEffect, useState} from 'react';
import {User, Session} from '@supabase/supabase-js';
import {supabase} from '../integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{error: any | null}>;
  signUp: (email: string, password: string) => Promise<{error: any | null}>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const {data: {subscription}} = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      },
    );

    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const {error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return {error};
    } catch (error) {
      return {error};
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const {error} = await supabase.auth.signUp({
        email,
        password,
      });
      return {error};
    } catch (error) {
      return {error};
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};