
import React, { useState, useEffect, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useAppStore } from '@/store/useAppStore';
import { AuthContextType } from './types';
import { createProfileHandler } from './profileHandler';
import { createUserProfile } from './profileUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser: setStoreUser, logout } = useAppStore();

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      console.log('Checking subscription status');
      await supabase.functions.invoke('check-subscription');
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleUserProfile = createProfileHandler(setStoreUser, checkSubscription);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Configure Supabase client for better session persistence
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', { session: !!session, user: !!session?.user });
      setUser(session?.user ?? null);
      if (session?.user) {
        handleUserProfile(session.user);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', { event, session: !!session, user: !!session?.user });
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('User authenticated, fetching/creating profile');
        // Use setTimeout to prevent potential deadlocks
        setTimeout(() => {
          handleUserProfile(session.user);
        }, 0);
      } else {
        console.log('User not authenticated, clearing store');
        logout();
      }
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    console.log('Sign up attempt:', { email, userData });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    
    console.log("Auth signUp result:", { data, error });

    if (data.user && !error) {
      try {
        const profileData = {
          id: data.user.id,
          name: userData.name,
          user_role: userData.user_role,
        };
        
        console.log("Creating profile during signup:", profileData);
        
        const { data: profileResult, error: profileError } = await supabase
          .from('profiles')
          .insert([profileData])
          .select()
          .single();
          
        if (profileError) {
          console.error("Profile creation error during signup:", profileError);
        } else {
          console.log("Profile created successfully during signup:", profileResult);
        }
      } catch (profileCreationError) {
        console.error("Unexpected error during profile creation:", profileCreationError);
      }
    }

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Sign in attempt:', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('Sign in result:', { data, error });
    return { data, error };
  };

  const signOut = async () => {
    console.log('Sign out attempt');
    await supabase.auth.signOut();
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        checkSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
