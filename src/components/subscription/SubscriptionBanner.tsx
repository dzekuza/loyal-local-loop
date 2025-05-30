
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Crown, Clock, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SubscriptionBannerProps {
  trialDaysLeft: number;
  onSubscribe: () => void;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ 
  trialDaysLeft, 
  onSubscribe 
}) => {
  const { t } = useTranslation();
  const isTrialExpired = trialDaysLeft <= 0;

  return (
    <Card className={`border-2 ${isTrialExpired ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isTrialExpired ? (
              <CreditCard className="w-6 h-6 text-red-600" />
            ) : (
              <Clock className="w-6 h-6 text-amber-600" />
            )}
            <div>
              <h3 className="font-semibold">
                {isTrialExpired ? t('subscription.trialExpired') : t('subscription.freeTrial')}
              </h3>
              <p className="text-sm text-gray-600">
                {isTrialExpired 
                  ? 'Subscribe to continue using advanced features'
                  : t('subscription.trialDaysLeft', { days: trialDaysLeft })
                }
              </p>
            </div>
          </div>
          
          <Button 
            onClick={onSubscribe}
            className="flex items-center space-x-2"
            variant={isTrialExpired ? "destructive" : "default"}
          >
            <Crown className="w-4 h-4" />
            <span>{t('subscription.subscribe')}</span>
          </Button>
        </div>
        
        <div className="mt-3 text-xs text-gray-600">
          <p>{t('subscription.price')} • {t('subscription.monthly')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionBanner;
