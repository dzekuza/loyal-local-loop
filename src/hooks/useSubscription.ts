
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  isTrialActive: boolean;
  trialDaysLeft: number;
  hasActiveSubscription: boolean;
  subscriptionStatus: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    isTrialActive: false,
    trialDaysLeft: 0,
    hasActiveSubscription: false,
    subscriptionStatus: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;

    try {
      // Check if user has subscription data
      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_start_date, subscription_status, subscription_end_date')
        .eq('id', user.id)
        .single();

      if (profile) {
        const now = new Date();
        const trialStart = profile.trial_start_date ? new Date(profile.trial_start_date) : null;
        const trialEnd = trialStart ? new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000) : null;
        
        const isTrialActive = trialEnd ? now < trialEnd : false;
        const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))) : 0;
        
        setSubscriptionData({
          isTrialActive,
          trialDaysLeft,
          hasActiveSubscription: profile.subscription_status === 'active',
          subscriptionStatus: profile.subscription_status
        });
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startFreeTrial = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          trial_start_date: new Date().toISOString()
        })
        .eq('id', user.id);

      if (!error) {
        loadSubscriptionData();
      }
    } catch (error) {
      console.error('Error starting free trial:', error);
    }
  };

  return {
    ...subscriptionData,
    loading,
    startFreeTrial,
    refreshSubscription: loadSubscriptionData
  };
};
