
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  isTrialActive: boolean;
  trialDaysLeft: number;
  hasActiveSubscription: boolean;
  subscriptionStatus: string | null;
  subscriptionTier: string | null;
  isFreeUser: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    isTrialActive: false,
    trialDaysLeft: 0,
    hasActiveSubscription: false,
    subscriptionStatus: null,
    subscriptionTier: null,
    isFreeUser: true
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
      // Check subscription status via edge function
      const { data: subscriptionCheck } = await supabase.functions.invoke('check-subscription');
      
      // Also check profile for trial data
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
        const hasActiveSubscription = subscriptionCheck?.subscribed || profile.subscription_status === 'active';
        
        setSubscriptionData({
          isTrialActive,
          trialDaysLeft,
          hasActiveSubscription,
          subscriptionStatus: profile.subscription_status,
          subscriptionTier: subscriptionCheck?.subscription_tier || null,
          isFreeUser: !hasActiveSubscription && !isTrialActive
        });
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      // Default to free user on error
      setSubscriptionData({
        isTrialActive: false,
        trialDaysLeft: 0,
        hasActiveSubscription: false,
        subscriptionStatus: null,
        subscriptionTier: null,
        isFreeUser: true
      });
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

  const checkSubscription = async () => {
    try {
      const { data } = await supabase.functions.invoke('check-subscription');
      if (data) {
        loadSubscriptionData();
      }
      return data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return null;
    }
  };

  return {
    ...subscriptionData,
    loading,
    startFreeTrial,
    checkSubscription,
    refreshSubscription: loadSubscriptionData
  };
};
