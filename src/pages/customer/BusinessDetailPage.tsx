
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import AppleWalletButton from '../../components/wallet/AppleWalletButton';
import { ArrowLeft, MapPin, Clock, Gift, Euro, Award } from 'lucide-react';
import { Business, LoyaltyOffer } from '../../types';

const BusinessDetailPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [offer, setOffer] = useState<LoyaltyOffer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      loadBusinessData();
    }
  }, [businessId]);

  const loadBusinessData = async () => {
    try {
      // Load business data
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (businessError) throw businessError;

      const formattedBusiness: Business = {
        id: businessData.id,
        name: businessData.name,
        email: businessData.email,
        logo: businessData.logo,
        businessType: businessData.business_type,
        description: businessData.description,
        qrCode: businessData.qr_code,
        createdAt: new Date(businessData.created_at),
      };

      setBusiness(formattedBusiness);

      // Load loyalty offer
      const { data: offerData, error: offerError } = await supabase
        .from('loyalty_offers')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .single();

      if (offerData && !offerError) {
        const formattedOffer: LoyaltyOffer = {
          id: offerData.id,
          businessId: offerData.business_id,
          spendAmount: offerData.spend_amount,
          pointsEarned: offerData.points_earned,
          rewardThreshold: offerData.reward_threshold,
          rewardDescription: offerData.reward_description,
          rewardImage: offerData.reward_image,
          isActive: offerData.is_active,
          createdAt: new Date(offerData.created_at),
        };

        setOffer(formattedOffer);
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="business-detail-loading min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="business-detail-error min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Business not found</h2>
          <p className="text-gray-600 mb-4">The business you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/businesses')}>
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="business-detail-page min-h-screen bg-gray-50">
      {/* Header */}
      <div className="business-header bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/businesses')}
            className="btn-back text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Button>
          
          <div className="flex items-start space-x-4">
            <div className="business-logo w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              {business.logo ? (
                <img 
                  src={business.logo} 
                  alt={business.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {business.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
              <Badge variant="secondary" className="mb-3 bg-white/20 text-white">
                {business.businessType}
              </Badge>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>Local Business</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>Open Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Info */}
          <div className="business-info-section">
            <Card className="business-info-card mb-6">
              <CardHeader>
                <CardTitle>About {business.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {business.description}
                </p>
              </CardContent>
            </Card>

            {/* Loyalty Program */}
            {offer ? (
              <Card className="loyalty-program-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gift className="w-5 h-5" />
                    <span>Loyalty Program</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="earning-rules bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                      <Euro className="w-4 h-4" />
                      <span>Earning Rules</span>
                    </h4>
                    <p className="text-sm text-gray-700">
                      Spend <span className="font-bold">€{offer.spendAmount}</span> → 
                      Earn <span className="font-bold">{offer.pointsEarned} points</span>
                    </p>
                  </div>
                  
                  <div className="reward-rules bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span>Reward</span>
                    </h4>
                    <p className="text-sm text-gray-700">
                      Collect <span className="font-bold">{offer.rewardThreshold} points</span> → 
                      Get <span className="font-bold">{offer.rewardDescription}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="no-program-card">
                <CardContent className="text-center py-8">
                  <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Loyalty Program Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    This business is setting up their loyalty program. Check back soon!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Wallet Integration */}
          <div className="wallet-section">
            <Card className="wallet-card">
              <CardHeader>
                <CardTitle>Get Your Loyalty Card</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="wallet-preview bg-black text-white p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {business.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-semibold">{business.name}</span>
                    </div>
                    <Badge className="bg-white/20 text-white">
                      Loyalty Card
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-white/80 mb-2">Current Points</div>
                  <div className="text-2xl font-bold mb-4">0</div>
                  
                  <div className="text-xs text-white/60">
                    Card ID: {business.id.slice(-8).toUpperCase()}
                  </div>
                </div>

                <div className="wallet-benefits">
                  <h4 className="font-semibold text-gray-900 mb-3">Benefits of Adding to Wallet:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Quick access from your phone</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Automatic point tracking</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Notifications for rewards</span>
                    </li>
                  </ul>
                </div>

                <AppleWalletButton business={business} />
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    By adding this card, you agree to the business loyalty terms
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailPage;
