
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';
import { useAppStore } from '@/store/useAppStore';

export const useCustomerLoyalty = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { userRole } = useAppStore();

  const joinLoyaltyProgram = async (businessId: string, businessName: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join loyalty programs",
        variant: "destructive",
      });
      return false;
    }

    if (userRole !== 'customer') {
      toast({
        title: "Access Denied",
        description: "Only customers can join loyalty programs. Business accounts cannot participate in loyalty programs.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Check if user is already in the loyalty program
      const { data: existingPoints, error: checkError } = await supabase
        .from('user_points')
        .select('*')
        .eq('customer_id', user.id)
        .eq('business_id', businessId)
        .single();

      if (existingPoints) {
        toast({
          title: "Already Joined",
          description: `You're already a member of ${businessName}'s loyalty program!`,
        });
        return true;
      }

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // Create user_points record to join the loyalty program
      // The database trigger will now enforce that only customers can join
      const { error: joinError } = await supabase
        .from('user_points')
        .insert({
          customer_id: user.id,
          business_id: businessId,
          total_points: 0
        });

      if (joinError) {
        // If the trigger fires, we'll get a specific error message
        if (joinError.message.includes('Only customers can join loyalty programs')) {
          toast({
            title: "Access Denied",
            description: "Only customer accounts can join loyalty programs. Business accounts cannot participate.",
            variant: "destructive",
          });
          return false;
        }
        throw joinError;
      }

      toast({
        title: "Welcome! 🎉",
        description: `You've successfully joined ${businessName}'s loyalty program!`,
      });

      return true;
    } catch (error) {
      console.error('Error joining loyalty program:', error);
      toast({
        title: "Error",
        description: "Failed to join loyalty program. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCustomerPoints = async (businessId: string) => {
    if (!user || userRole !== 'customer') return null;

    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('customer_id', user.id)
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.total_points || 0;
    } catch (error) {
      console.error('Error fetching customer points:', error);
      return null;
    }
  };

  return {
    joinLoyaltyProgram,
    getCustomerPoints,
    loading
  };
};
