
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Store, Gift, Star, ArrowLeft } from 'lucide-react';
import { Business, LoyaltyOffer } from '@/types';

const BusinessDetailPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAuthenticated, userRole } = useAppStore();
  const { toast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [offers, setOffers] = useState<LoyaltyOffer[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

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
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setUserPoints(data?.total_points || 0);
    } catch (error) {
      console.error('Error fetching user points:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinLoyaltyProgram = async () => {
    if (!businessId || !user) return;

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
        title: "Welcome!",
        description: "You've successfully joined the loyalty program!",
      });
    } catch (error) {
      console.error('Error joining program:', error);
      toast({
        title: "Error",
        description: "Failed to join loyalty program",
        variant: "destructive",
      });
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

  const hasJoinedProgram = userPoints !== null;

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
              <span>Back</span>
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
                  <p className="text-gray-700">{business.description}</p>
                  
                  {hasJoinedProgram ? (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">
                          You have {userPoints} loyalty points
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={joinLoyaltyProgram} className="mt-4">
                      Join Loyalty Program
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>Loyalty Offers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No active offers available yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {offers.map((offer) => (
                    <div key={offer.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium mb-2">{offer.rewardDescription}</h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Spend ${offer.spendAmount} → Earn {offer.pointsEarned} points</p>
                            <p>Reward available at {offer.rewardThreshold} points</p>
                          </div>
                        </div>
                        <Badge variant="default">Active</Badge>
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
