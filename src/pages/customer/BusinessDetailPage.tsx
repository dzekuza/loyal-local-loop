import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Store, Gift, MapPin, Star, Users } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  email: string;
  logo: string | null;
  business_type: string;
  description: string | null;
  qr_code: string;
  created_at: string;
}

interface LoyaltyOffer {
  id: string;
  spend_amount: number;
  points_earned: number;
  reward_threshold: number;
  reward_description: string;
  is_active: boolean;
}

interface UserPoints {
  total_points: number;
}

const BusinessDetailPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [offers, setOffers] = useState<LoyaltyOffer[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      fetchBusinessData();
    }
  }, [businessId, user]);

  const fetchBusinessData = async () => {
    try {
      // Fetch business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (businessError) throw businessError;
      setBusiness(businessData);

      // Fetch active offers
      const { data: offersData, error: offersError } = await supabase
        .from('rewards')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (offersError) throw offersError;
      setOffers(offersData || []);

      // Fetch user points if logged in
      if (user) {
        const { data: pointsData, error: pointsError } = await supabase
          .from('user_points')
          .select('total_points')
          .eq('business_id', businessId)
          .eq('customer_id', user.id)
          .single();

        if (pointsError && pointsError.code !== 'PGRST116') {
          throw pointsError;
        }
        
        setUserPoints(pointsData);
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      toast({
        title: "Error",
        description: "Failed to load business information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const simulatePurchase = async (offer: LoyaltyOffer) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to earn points",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentPoints = userPoints?.total_points || 0;
      const newPoints = currentPoints + offer.points_earned;

      // Upsert user points
      const { error } = await supabase
        .from('user_points')
        .upsert({
          customer_id: user.id,
          business_id: businessId!,
          total_points: newPoints,
          last_activity: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setUserPoints({ total_points: newPoints });

      toast({
        title: "Points Earned! 🎉",
        description: `You earned ${offer.points_earned} points! Total: ${newPoints}`,
      });

      // Check if user reached reward threshold
      if (newPoints >= offer.reward_threshold && currentPoints < offer.reward_threshold) {
        toast({
          title: "Reward Unlocked! 🏆",
          description: `You've unlocked: ${offer.reward_description}`,
        });
      }
    } catch (error) {
      console.error('Error updating points:', error);
      toast({
        title: "Error",
        description: "Failed to update points",
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
          <Card>
            <CardContent className="p-12 text-center">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Business not found</h3>
              <p className="text-gray-600">The business you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Business Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <div className="business-logo w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                {business.logo ? (
                  <img 
                    src={business.logo} 
                    alt={business.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-purple-600 font-bold text-2xl">
                    {business.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
                    <div className="flex items-center space-x-4 mb-3">
                      <Badge variant="secondary">{business.business_type}</Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>Local Business</span>
                      </div>
                    </div>
                  </div>
                  {user && userPoints && (
                    <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Your Points</p>
                          <p className="text-2xl font-bold text-purple-600">{userPoints.total_points}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{business.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>Loyalty Program Available</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>Verified Business</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Offers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="w-5 h-5" />
              <span>Loyalty Offers ({offers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {offers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active offers available</p>
                <p className="text-sm">Check back soon for new rewards!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {offers.map((offer) => (
                  <Card key={offer.id} className="border-purple-200">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                          <p className="font-semibold text-gray-900 mb-1">
                            Spend €{offer.spend_amount} → Earn {offer.points_earned} points
                          </p>
                          <p className="text-sm text-gray-600">
                            Reward at {offer.reward_threshold} points: {offer.reward_description}
                          </p>
                        </div>
                        <Button 
                          onClick={() => simulatePurchase(offer)}
                          className="w-full"
                          disabled={!user}
                        >
                          {user ? `Simulate Purchase (€${offer.spend_amount})` : 'Login to Earn Points'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessDetailPage;
