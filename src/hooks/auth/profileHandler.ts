
import { User } from '@supabase/supabase-js';
import { useAppStore } from '@/store/useAppStore';
import { UserRole } from '@/types';
import { createUserProfile, fetchUserProfile, getFallbackUserData } from './profileUtils';
import { supabase } from '@/integrations/supabase/client';

export const createProfileHandler = (setStoreUser: (user: any, role: UserRole) => void, checkSubscription: () => Promise<void>) => {
  return async (user: User) => {
    try {
      console.log(`Fetching profile for user: ${user.id}`);
      
      // First, get the user role from metadata if available
      const userMetadataRole = user.user_metadata?.user_role as UserRole;
      console.log('User metadata role:', userMetadataRole);
      
      const { profile, error: fetchError } = await fetchUserProfile(user.id);

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        
        // If profile fetch fails, use user metadata or create profile
        if (fetchError.code === 'PGRST116') {
          console.log('Profile not found, creating new profile');
          const success = await createUserProfile(user);
          if (success) {
            // Retry fetching the profile after creation
            const { profile: newProfile, error: retryError } = await fetchUserProfile(user.id);
            
            if (newProfile && !retryError) {
              console.log('Setting user with newly created profile:', newProfile);
              setStoreUser(newProfile, newProfile.user_role as UserRole);
            } else {
              console.error('Failed to fetch newly created profile:', retryError);
              // Fallback to user metadata
              const fallbackData = getFallbackUserData(user);
              setStoreUser(fallbackData, fallbackData.user_role as UserRole);
            }
          } else {
            // Profile creation failed, use metadata
            const fallbackData = getFallbackUserData(user);
            setStoreUser(fallbackData, fallbackData.user_role as UserRole);
          }
        } else {
          // RLS or other error - use user metadata but don't force to customer
          const fallbackData = getFallbackUserData(user);
          console.log('Using user metadata role due to profile fetch error:', fallbackData.user_role);
          setStoreUser(fallbackData, fallbackData.user_role as UserRole);
        }
        return;
      }

      if (!profile) {
        console.log('Profile not found, creating new profile');
        const success = await createUserProfile(user);
        if (success) {
          const { profile: newProfile } = await fetchUserProfile(user.id);
          
          if (newProfile) {
            console.log('Setting user with newly created profile:', newProfile);
            setStoreUser(newProfile, newProfile.user_role as UserRole);
          } else {
            // Fallback to user metadata
            const fallbackData = getFallbackUserData(user);
            setStoreUser(fallbackData, fallbackData.user_role as UserRole);
          }
        } else {
          // Fallback to user metadata
          const fallbackData = getFallbackUserData(user);
          setStoreUser(fallbackData, fallbackData.user_role as UserRole);
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
      const fallbackData = getFallbackUserData(user);
      console.log('Using fallback user role due to error:', fallbackData.user_role);
      setStoreUser(fallbackData, fallbackData.user_role as UserRole);
    }
  };
};
