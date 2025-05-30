
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../hooks/useAuth';
import CustomerLoyaltyCard from '../../components/customer/CustomerLoyaltyCard';
import CustomerQRCode from '../../components/customer/CustomerQRCode';
import { ArrowLeft, MapPin, Clock, Phone, Globe, Star } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  email: string;
  business_type: string;
  description: string;
  created_at: string;
}

interface LoyaltyOffer {
  id: string;
  business_id: string;
  spend_amount: number;
  points_earned: number;
  reward_threshold: number;
  reward_description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserPoints {
  total_points: number;
}

const BusinessDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [offers, setOffers] = useState<LoyaltyOffer[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBusinessData();
    }
  }, [id, user]);

  const loadBusinessData = async () => {
    try {
      // Load business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (businessError) {
        console.error('Error loading business:', businessError);
        toast({
          title: "Error",
          description: "Failed to load business details",
          variant: "destructive",
        });
        return;
      }

      setBusiness(businessData);

      // Load loyalty offers
      const { data: offersData, error: offersError } = await supabase
        .from('loyalty_offers')
        .select('*')
        .eq('business_id', id)
        .eq('is_active', true)
        .order('reward_threshold', { ascending: true });

      if (offersError) {
        console.error('Error loading offers:', offersError);
      } else {
        setOffers(offersData || []);
      }

      // Load user points if authenticated
      if (user) {
        const { data: pointsData, error: pointsError } = await supabase
          .from('user_points')
          .select('total_points')
          .eq('customer_id', user.id)
          .eq('business_id', id)
          .maybeSingle();

        if (pointsError && pointsError.code !== 'PGRST116') {
          console.error('Error loading user points:', pointsError);
        } else {
          setUserPoints(pointsData);
        }
      }
    } catch (error) {
      console.error('Error loading business data:', error);
      toast({
        title: "Error",
        description: "Failed to load business information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Business not found</p>
          <Button onClick={() => navigate('/businesses')}>
            Back to Businesses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/businesses')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Businesses
          </Button>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {business.name}
                </h1>
                <Badge variant="secondary" className="mb-3">
                  {business.business_type}
                </Badge>
                <p className="text-gray-600">{business.description}</p>
              </div>
              <div className="text-right">
                {userPoints && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {userPoints.total_points}
                    </div>
                    <div className="text-sm text-gray-500">Your Points</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loyalty Card */}
          <div>
            <CustomerLoyaltyCard 
              business={business}
              onJoinSuccess={loadBusinessData}
            />
          </div>

          {/* QR Code */}
          {user && userPoints && (
            <div>
              <CustomerQRCode 
                customerId={user.id}
                customerName={user.email || 'Customer'}
              />
            </div>
          )}
        </div>

        {/* Loyalty Offers */}
        {offers.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Available Rewards</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold mb-2">Spend ${offer.spend_amount}</h3>
                      <p className="text-gray-600 text-sm mb-3">Earn {offer.points_earned} points</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-600">
                          {offer.reward_threshold} points needed
                        </span>
                        <Badge 
                          variant={userPoints && userPoints.total_points >= offer.reward_threshold ? "default" : "secondary"}
                        >
                          {userPoints && userPoints.total_points >= offer.reward_threshold ? "Available" : "Locked"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Reward: {offer.reward_description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDetailPage;
