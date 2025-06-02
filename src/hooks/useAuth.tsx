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
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser: setStoreUser, logout } = useAppStore();

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

  const handleUserProfile = async (user: User) => {
    try {
      console.log(`Fetching profile for user: ${user.id}`);
      
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('Profile fetch result:', { profile, error: fetchError });

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        
        // Only try to create profile if it's a "not found" error, not an RLS error
        if (fetchError.code === 'PGRST116') {
          console.log('Profile not found, creating new profile');
          const success = await createUserProfile(user);
          if (success) {
            // Retry fetching the profile after creation
            const { data: newProfile, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            
            if (newProfile && !retryError) {
              console.log('Setting user with newly created profile:', newProfile);
              setStoreUser(newProfile, newProfile.user_role as UserRole);
            } else {
              console.error('Failed to fetch newly created profile:', retryError);
              // Set basic user info without profile data
              setStoreUser({ id: user.id, email: user.email }, 'customer');
            }
          } else {
            // Profile creation failed, set basic user info
            setStoreUser({ id: user.id, email: user.email }, 'customer');
          }
        } else {
          // Other error (like RLS), don't default to customer - use user metadata if available
          const userRole = user.user_metadata?.user_role as UserRole || 'customer';
          console.log('Using user metadata role due to profile fetch error:', userRole);
          setStoreUser({ 
            id: user.id, 
            email: user.email,
            name: user.user_metadata?.name || user.email
          }, userRole);
        }
        return;
      }

      if (!profile) {
        console.log('Profile not found, creating new profile');
        const success = await createUserProfile(user);
        if (success) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          
          if (newProfile) {
            console.log('Setting user with newly created profile:', newProfile);
            setStoreUser(newProfile, newProfile.user_role as UserRole);
          } else {
            // Fallback to user metadata
            const userRole = user.user_metadata?.user_role as UserRole || 'customer';
            setStoreUser({ id: user.id, email: user.email }, userRole);
          }
        } else {
          // Fallback to user metadata
          const userRole = user.user_metadata?.user_role as UserRole || 'customer';
          setStoreUser({ id: user.id, email: user.email }, userRole);
        }
      } else {
        console.log('Setting user with existing profile:', profile);
        setStoreUser(profile, profile.user_role as UserRole);
      }

      // Check subscription after profile is loaded
      checkSubscription();
    } catch (error) {
      console.error('Error in handleUserProfile:', error);
      // Fallback to user metadata when there's an unexpected error
      const userRole = user.user_metadata?.user_role as UserRole || 'customer';
      console.log('Using fallback user role due to error:', userRole);
      setStoreUser({ 
        id: user.id, 
        email: user.email,
        name: user.user_metadata?.name || user.email
      }, userRole);
    }
  };

  const createUserProfile = async (user: User): Promise<boolean> => {
    try {
      console.log('Creating profile for user:', user.id);
      
      const userData = user.user_metadata || {};
      const profileData = {
        id: user.id,
        name: userData.name || userData.full_name || user.email || 'Unknown User',
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
      console.error('Error in createUserProfile:', error);
      return false;
    }
  };

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      console.log('Checking subscription status');
      await supabase.functions.invoke('check-subscription');
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
