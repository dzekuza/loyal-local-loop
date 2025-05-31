
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useLoyaltyOffers } from '@/hooks/useLoyaltyOffers';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Star, Gift, Building2, Loader2, CheckCircle, QrCode, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BusinessQRModal from './BusinessQRModal';
import WalletOptionsModal from './WalletOptionsModal';

interface EnhancedLoyaltyCardProps {
  card: {
    id: string;
    business: {
      id: string;
      name: string;
      business_type: string;
      description: string;
      logo?: string;
      address?: string;
    };
    points: number;
    lastActivity: string;
  };
  customerId: string;
  onRedemption?: () => void;
}

const EnhancedLoyaltyCard: React.FC<EnhancedLoyaltyCardProps> = ({ 
  card, 
  customerId,
  onRedemption 
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: offers = [], isLoading: offersLoading } = useLoyaltyOffers(card.business.id);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleRedeem = async (offerId: string, pointsRequired: number) => {
    if (card.points < pointsRequired) {
      toast({
        title: t("loyalty.insufficientPoints"),
        description: t("loyalty.insufficientPointsMessage", { required: pointsRequired, current: card.points }),
        variant: "destructive",
      });
      return;
    }

    setRedeeming(offerId);
    try {
      // Deduct points from user
      const { error: pointsError } = await supabase
        .from('user_points')
        .update({ 
          total_points: card.points - pointsRequired,
          updated_at: new Date().toISOString()
        })
        .eq('customer_id', customerId)
        .eq('business_id', card.business.id);

      if (pointsError) throw pointsError;

      // Create redemption transaction
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          customer_id: customerId,
          business_id: card.business.id,
          points_earned: -pointsRequired,
          amount_spent: 0,
          transaction_date: new Date().toISOString()
        });

      if (transactionError) throw transactionError;

      toast({
        title: t("loyalty.rewardRedeemed"),
        description: t("loyalty.rewardRedeemedMessage"),
      });

      onRedemption?.();
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast({
        title: t("loyalty.redemptionFailed"),
        description: t("loyalty.redemptionFailedMessage"),
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  const getProgressToNextReward = () => {
    if (!offers.length) return null;
    
    const eligibleOffers = offers.filter(offer => offer.reward_threshold > card.points);
    if (!eligibleOffers.length) return null;
    
    const nextOffer = eligibleOffers.reduce((closest, offer) => 
      offer.reward_threshold < closest.reward_threshold ? offer : closest
    );
    
    const progress = (card.points / nextOffer.reward_threshold) * 100;
    const pointsNeeded = nextOffer.reward_threshold - card.points;
    
    return { offer: nextOffer, progress, pointsNeeded };
  };

  const redeemableOffers = offers.filter(offer => card.points >= offer.reward_threshold);
  const upcomingOffers = offers.filter(offer => card.points < offer.reward_threshold);
  const progressInfo = getProgressToNextReward();

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Card Header with Business Branding */}
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
              {card.business.logo ? (
                <img 
                  src={card.business.logo} 
                  alt={card.business.name} 
                  className="w-10 h-10 object-cover rounded-md" 
                />
              ) : (
                <Building2 className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate text-white">
                {card.business.name}
              </CardTitle>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {card.business.business_type}
              </Badge>
            </div>
            <CreditCard className="w-6 h-6 text-white/80" />
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Points Balance */}
          <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-3xl font-bold text-gray-800">{card.points}</span>
              <span className="text-sm text-gray-600">{t("loyalty.points")}</span>
            </div>
            <p className="text-xs text-gray-500">{t("loyalty.availableBalance")}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowQRModal(true)}
            >
              <QrCode className="w-4 h-4 mr-1" />
              QR Code
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowWalletModal(true)}
            >
              <Wallet className="w-4 h-4 mr-1" />
              Add to Wallet
            </Button>
          </div>

          {/* Progress to Next Reward */}
          {progressInfo && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t("loyalty.nextReward")}</span>
                <span className="font-medium">{progressInfo.pointsNeeded} {t("loyalty.pointsAway")}</span>
              </div>
              <Progress value={progressInfo.progress} className="h-2" />
              <p className="text-xs text-gray-500 text-center">
                {progressInfo.offer.reward_description}
              </p>
            </div>
          )}

          {/* Available Rewards */}
          {offersLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">{t("loyalty.loadingOffers")}</span>
            </div>
          ) : redeemableOffers.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-800 flex items-center space-x-1">
                <Gift className="w-4 h-4" />
                <span>{t("loyalty.availableRewards")}</span>
              </h4>
              {redeemableOffers.map((offer) => (
                <div key={offer.id} className="border rounded-lg p-3 bg-green-50 border-green-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">
                        {offer.reward_description}
                      </p>
                      <p className="text-xs text-gray-600">
                        {offer.reward_threshold} {t("loyalty.pointsRequired")}
                      </p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleRedeem(offer.id, offer.reward_threshold)}
                    disabled={redeeming === offer.id}
                  >
                    {redeeming === offer.id ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        {t("loyalty.redeeming")}
                      </>
                    ) : (
                      <>
                        <Gift className="w-3 h-3 mr-1" />
                        {t("loyalty.redeem")}
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : upcomingOffers.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-800 flex items-center space-x-1">
                <Gift className="w-4 h-4" />
                <span>Upcoming Rewards</span>
              </h4>
              {upcomingOffers.slice(0, 2).map((offer) => (
                <div key={offer.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">
                        {offer.reward_description}
                      </p>
                      <p className="text-xs text-gray-600">
                        {offer.reward_threshold} {t("loyalty.pointsRequired")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Gift className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{t("loyalty.noRewardsYet")}</p>
            </div>
          )}

          {/* Business Description */}
          {card.business.description && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500 line-clamp-2">
                {card.business.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <BusinessQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        customerId={customerId}
        businessId={card.business.id}
        businessName={card.business.name}
        businessLogo={card.business.logo}
      />

      {/* Wallet Options Modal */}
      <WalletOptionsModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        businessName={card.business.name}
        customerId={customerId}
        businessId={card.business.id}
      />
    </>
  );
};

export default EnhancedLoyaltyCard;
