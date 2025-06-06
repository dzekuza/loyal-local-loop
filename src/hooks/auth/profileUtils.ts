
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';
import { CreateProfileData } from './types';

export const createUserProfile = async (user: User): Promise<boolean> => {
  try {
    console.log('Creating profile for user:', user.id);
    
    const userData = user.user_metadata || {};
    const profileData: CreateProfileData = {
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

export const fetchUserProfile = async (userId: string) => {
  console.log(`Fetching profile for user: ${userId}`);
  
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  console.log('Profile fetch result:', { profile, error: fetchError });
  
  return { profile, error: fetchError };
};

export const getFallbackUserData = (user: User) => {
  const userMetadataRole = user.user_metadata?.user_role as UserRole;
  const fallbackRole = userMetadataRole || 'customer';
  
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email,
    user_role: fallbackRole
  };
};
