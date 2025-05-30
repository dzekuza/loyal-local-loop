import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Store, Gift, Star, ArrowLeft, CreditCard, CheckCircle, QrCode } from 'lucide-react';
import { Business, LoyaltyOffer } from '@/types';
import AppleWalletButton from '@/components/wallet/AppleWalletButton';
import CustomerQRCode from '@/components/customer/CustomerQRCode';

const BusinessDetailPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAuthenticated, userRole } = useAppStore();
  const { toast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [offers, setOffers] = useState<LoyaltyOffer[]>([]);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'customer') {
      navigate('/login');
      return;
    }

    if (businessId) {
      fetchBusinessDetails();
      fetchOffers();
      fetchUserPoints();
    }
  }, [businessId, isAuthenticated, userRole]);

  const fetchBusinessDetails = async () => {
    if (!businessId) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;

      setBusiness({
        id: data.id,
        name: data.name,
        email: data.email,
        logo: data.logo,
        businessType: data.business_type,
        description: data.description,
        qrCode: data.qr_code,
        createdAt: new Date(data.created_at),
      });
    } catch (error) {
      console.error('Error fetching business:', error);
      toast({
        title: "Error",
        description: "Failed to load business details",
        variant: "destructive",
      });
    }
  };

  const fetchOffers = async () => {
    if (!businessId) return;

    try {
      const { data, error } = await supabase
        .from('loyalty_offers')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;

      setOffers(data?.map(offer => ({
        id: offer.id,
        businessId: offer.business_id,
        spendAmount: offer.spend_amount,
        pointsEarned: offer.points_earned,
        rewardThreshold: offer.reward_threshold,
        rewardDescription: offer.reward_description,
        isActive: offer.is_active,
        createdAt: new Date(offer.created_at),
      })) || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchUserPoints = async () => {
    if (!businessId || !user) return;

    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('business_id', businessId)
        .eq('customer_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setUserPoints(data?.total_points || null);
    } catch (error) {
      console.error('Error fetching user points:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLoyaltyCard = async () => {
    if (!businessId || !user || !business) return;

    setEnrolling(true);
    try {
      const { error } = await supabase
        .from('user_points')
        .insert({
          business_id: businessId,
          customer_id: user.id,
          total_points: 0
        });

      if (error) throw error;

      setUserPoints(0);
      toast({
        title: "🎉 Welcome to the loyalty program!",
        description: `You're now a member of ${business.name}'s loyalty program. Start earning points with every purchase!`,
      });
    } catch (error) {
      console.error('Error joining program:', error);
      toast({
        title: "Error",
        description: "Failed to join loyalty program. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading business details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Business not found</p>
            <Button onClick={() => navigate('/businesses')} className="mt-4">
              Back to Businesses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isEnrolled = userPoints !== null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/businesses')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Directory</span>
            </Button>
          </div>

          {/* Business Info */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
                  <p className="text-gray-600 mb-4">{business.businessType}</p>
                  <p className="text-gray-700 mb-6">{business.description}</p>
                  
                  {isEnrolled ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <span className="font-semibold text-green-800 text-lg">
                            You're a loyalty member!
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-4">
                          <Star className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">
                            Current Points: {userPoints}
                          </span>
                        </div>
                        <p className="text-green-700 text-sm mb-4">
                          Show your QR code when making purchases to earn points!
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <AppleWalletButton business={business} customerId={user.id} />
                          <Button 
                            onClick={() => navigate('/scan')}
                            variant="outline"
                            className="w-full"
                          >
                            <QrCode className="w-4 h-4 mr-2" />
                            Show QR Code
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <CreditCard className="w-6 h-6 text-purple-600" />
                        <span className="font-semibold text-purple-800 text-lg">
                          Join our loyalty program
                        </span>
                      </div>
                      <p className="text-purple-700 mb-4">
                        Get your loyalty card and start earning points with every purchase. 
                        Unlock exclusive rewards and special offers!
                      </p>
                      <Button 
                        onClick={getLoyaltyCard} 
                        disabled={enrolling}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
                        size="lg"
                      >
                        {enrolling ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Getting your card...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Get Loyalty Card
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer QR Code Section - Only show if enrolled */}
          {isEnrolled && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Your QR Code for {business.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CustomerQRCode 
                    customerId={user.id}
                    customerName={user.email || 'Customer'}
                  />
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">How to earn points:</h3>
                    <ol className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start space-x-2">
                        <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">1</span>
                        <span>Make a purchase at {business.name}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">2</span>
                        <span>Show this QR code to the cashier</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">3</span>
                        <span>They'll scan it and award you points automatically</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">4</span>
                        <span>Redeem points for rewards when you reach the threshold</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Offers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>Loyalty Offers & Rewards</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No active offers available yet.</p>
                  <p className="text-sm mt-2">Check back soon for exciting rewards!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {offers.map((offer) => (
                    <div key={offer.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-3 text-gray-900">{offer.rewardDescription}</h3>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="font-medium mr-2">💰 Earn:</span>
                              <span>Spend ${offer.spendAmount} → Get {offer.pointsEarned} points</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="font-medium mr-2">🎁 Reward:</span>
                              <span>Available at {offer.rewardThreshold} points</span>
                            </div>
                          </div>
                          {isEnrolled && userPoints !== null && (
                            <div className="mt-3">
                              {userPoints >= offer.rewardThreshold ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Reward Available!
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-600">
                                  {offer.rewardThreshold - userPoints} points needed
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <Badge variant="default" className="ml-4">Active</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailPage;
