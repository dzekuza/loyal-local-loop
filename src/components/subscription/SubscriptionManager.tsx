
import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Crown, CreditCard, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionManagerProps {
  isSubscribed: boolean;
  subscriptionTier?: string | null;
  onSubscriptionChange?: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  isSubscribed,
  subscriptionTier,
  onSubscriptionChange
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: t('common.error'),
        description: "Failed to start subscription process",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: t('common.error'),
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    }
  };

  if (isSubscribed) {
    return (
      <Card className="border-green-300 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Crown className="w-5 h-5" />
            <span>Premium Active</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700 mb-4">
            {subscriptionTier ? `${subscriptionTier} Plan` : 'Premium Plan'} • {t('subscription.monthly')}
          </p>
          <Button 
            onClick={handleManageSubscription}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Subscription</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-300 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-purple-800">
          <CreditCard className="w-5 h-5" />
          <span>Upgrade to Premium</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <p className="text-sm">• {t('subscription.features.unlimited')}</p>
          <p className="text-sm">• {t('subscription.features.analytics')}</p>
          <p className="text-sm">• {t('subscription.features.support')}</p>
          <p className="text-sm">• {t('subscription.features.integrations')}</p>
        </div>
        <Button 
          onClick={handleSubscribe}
          className="w-full flex items-center space-x-2"
        >
          <Crown className="w-4 h-4" />
          <span>{t('subscription.subscribe')} - {t('subscription.price')}</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager;
