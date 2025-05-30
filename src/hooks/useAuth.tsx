
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useAppStore } from '@/store/useAppStore';
import { UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser: setStoreUser, logout } = useAppStore();

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Listen for auth changes FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', { event, session: !!session, user: !!session?.user });
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('User authenticated, fetching profile');
        await fetchUserProfile(session.user.id);
      } else {
        console.log('User not authenticated, clearing store');
        logout();
      }
      setLoading(false);
    });

    // Get initial session SECOND
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', { session: !!session, user: !!session?.user });
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Profile fetch result:', { profile, error });

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (profile) {
        console.log('Setting user in store:', { profile, role: profile.user_role });
        setStoreUser(profile, profile.user_role as UserRole);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    console.log('Sign up attempt:', { email, userData });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    
    console.log("Auth signUp result:", { data, error });

    // If sign up succeeded, insert profile row
    if (data.user && !error) {
      const { data: profileData, error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          name: userData.name,
          user_role: userData.user_role,
        }
      ]);
      console.log("Profile insert result:", { profileData, profileError });
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
