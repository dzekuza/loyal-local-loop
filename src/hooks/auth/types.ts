
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

export interface CreateProfileData {
  id: string;
  name: string;
  user_role: UserRole;
}
