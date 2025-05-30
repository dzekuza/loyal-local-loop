
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
        console.log('User authenticated, fetching profile with retry logic');
        // Use setTimeout to avoid blocking the auth callback
        setTimeout(() => {
          fetchUserProfileWithRetry(session.user.id);
        }, 0);
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
        fetchUserProfileWithRetry(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfileWithRetry = async (userId: string, retryCount = 0) => {
    try {
      console.log(`Fetching user profile for: ${userId} (attempt ${retryCount + 1})`);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Profile fetch result:', { profile, error });

      if (error) {
        if (error.code === 'PGRST116' && retryCount < 2) {
          // Profile not found, try to create it from auth metadata
          console.log('Profile not found, attempting to create from auth metadata');
          const success = await createMissingProfile(userId);
          if (success && retryCount < 1) {
            // Retry fetching after creating
            return fetchUserProfileWithRetry(userId, retryCount + 1);
          }
        } else {
          console.error('Error fetching user profile:', error);
        }
        
        // Fallback: set basic auth state without profile
        console.log('Using fallback: setting user without complete profile');
        setStoreUser({ id: userId }, 'customer');
        return;
      }

      if (profile) {
        console.log('Setting user in store:', { profile, role: profile.user_role });
        setStoreUser(profile, profile.user_role as UserRole);
      }
    } catch (error) {
      console.error('Error in fetchUserProfileWithRetry:', error);
      // Fallback: set basic auth state
      setStoreUser({ id: userId }, 'customer');
    }
  };

  const createMissingProfile = async (userId: string) => {
    try {
      console.log('Creating missing profile for user:', userId);
      
      // Get user metadata from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found in auth');
        return false;
      }

      const userData = user.user_metadata || {};
      const profileData = {
        id: userId,
        name: userData.name || user.email || 'Unknown User',
        user_role: userData.user_role || 'customer',
      };

      console.log('Creating profile with data:', profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return false;
      }

      console.log('Successfully created profile:', data);
      return true;
    } catch (error) {
      console.error('Error in createMissingProfile:', error);
      return false;
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

    // Enhanced profile creation with better error handling
    if (data.user && !error) {
      try {
        const profileData = {
          id: data.user.id,
          name: userData.name,
          user_role: userData.user_role,
        };
        
        console.log("Creating profile with data:", profileData);
        
        const { data: profileData_result, error: profileError } = await supabase
          .from('profiles')
          .insert([profileData])
          .select()
          .single();
          
        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't fail the signup, but log the error
        } else {
          console.log("Profile created successfully:", profileData_result);
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
