
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Gift, Users, Zap } from 'lucide-react';
import { Business } from '@/types';
import { useTranslation } from 'react-i18next';

interface CustomerLoyaltyCardProps {
  business: Business;
  userPoints?: number;
  onJoinProgram?: () => void;
  isMember?: boolean;
}

const CustomerLoyaltyCard: React.FC<CustomerLoyaltyCardProps> = ({ 
  business, 
  userPoints = 0, 
  onJoinProgram,
  isMember = false 
}) => {
  const { t } = useTranslation();
  const activeOffers = business.loyaltyOffers?.filter(offer => offer.is_active) || [];

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-purple-600" />
            <span className="text-left">{t('loyalty.program')}</span>
          </div>
          {isMember && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Users className="w-3 h-3 mr-1" />
              {t('loyalty.member')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isMember ? (
          <div className="text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{t('loyalty.yourPoints')}</span>
              <span className="text-2xl font-bold text-purple-600">{userPoints}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((userPoints / (activeOffers[0]?.reward_threshold || 100)) * 100, 100)}%` 
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-left">
              {activeOffers.length > 0 && activeOffers[0].reward_threshold ? 
                `${Math.max(0, activeOffers[0].reward_threshold - userPoints)} ${t('loyalty.pointsUntilNextReward')}` :
                t('loyalty.keepEarning')
              }
            </p>
          </div>
        ) : (
          <div className="text-left">
            <p className="text-gray-600 mb-3">
              {t('businessDetail.notMemberYet')}
            </p>
            {onJoinProgram && (
              <Button onClick={onJoinProgram} className="w-full" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                {t('businessDetail.joinLoyaltyProgram')}
              </Button>
            )}
          </div>
        )}

        {activeOffers.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2 text-left">{t('loyalty.activeOffers')}</h4>
            <div className="space-y-2">
              {activeOffers.slice(0, 2).map((offer) => (
                <div key={offer.id} className="text-sm p-2 bg-gray-50 rounded text-left">
                  {offer.offer_name && (
                    <p className="font-medium text-purple-600">{offer.offer_name}</p>
                  )}
                  <p className="text-gray-700">{offer.reward_description}</p>
                  {offer.points_earned && offer.spend_amount && (
                    <p className="text-xs text-gray-500">
                      {t('loyalty.earnPointsFor', { points: offer.points_earned, amount: offer.spend_amount })}
                    </p>
                  )}
                </div>
              ))}
              {activeOffers.length > 2 && (
                <p className="text-xs text-gray-500 text-left">
                  +{activeOffers.length - 2} {t('businessDetail.moreOffersAvailable')}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerLoyaltyCard;
