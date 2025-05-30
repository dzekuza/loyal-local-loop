
import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Gift, Trash2, AlertCircle } from 'lucide-react';

interface LoyaltyOffer {
  id: string;
  business_id: string;
  reward_description: string;
  spend_amount: number;
  points_earned: number;
  reward_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const OffersList = () => {
  const { currentBusiness } = useAppStore();
  const { toast } = useToast();
  const [offers, setOffers] = useState<LoyaltyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentBusiness) {
      fetchOffers();
    }
  }, [currentBusiness]);

  const fetchOffers = async () => {
    if (!currentBusiness) return;

    console.log('Fetching offers for business:', currentBusiness.id);
    setLoading(true);
    setError(null);

    try {
      // Fetch all offers for this business (RLS policies will handle authorization)
      const { data, error } = await supabase
        .from('loyalty_offers')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .order('created_at', { ascending: false });

      console.log('Offers fetch result:', { data, error, businessId: currentBusiness.id });

      if (error) {
        console.error('Error fetching offers:', error);
        setError(`Failed to load offers: ${error.message}`);
        toast({
          title: "Database Error",
          description: `Failed to load offers: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Successfully fetched offers:', data);
      setOffers(data || []);
    } catch (error) {
      console.error('Unexpected error fetching offers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Unexpected error: ${errorMessage}`);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading offers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleOfferStatus = async (offerId: string, isActive: boolean) => {
    try {
      console.log('Toggling offer status:', { offerId, isActive });
      
      const { error } = await supabase
        .from('loyalty_offers')
        .update({ is_active: isActive })
        .eq('id', offerId);

      if (error) {
        console.error('Error updating offer:', error);
        throw error;
      }

      setOffers(offers.map(offer => 
        offer.id === offerId ? { ...offer, is_active: isActive } : offer
      ));

      toast({
        title: "Offer Updated",
        description: `Offer ${isActive ? 'activated' : 'deactivated'} successfully!`,
      });
    } catch (error) {
      console.error('Error updating offer:', error);
      toast({
        title: "Error",
        description: "Failed to update offer",
        variant: "destructive",
      });
    }
  };

  const deleteOffer = async (offerId: string) => {
    try {
      console.log('Deleting offer:', offerId);
      
      const { error } = await supabase
        .from('loyalty_offers')
        .delete()
        .eq('id', offerId);

      if (error) {
        console.error('Error deleting offer:', error);
        throw error;
      }

      setOffers(offers.filter(offer => offer.id !== offerId));

      toast({
        title: "Offer Deleted",
        description: "Offer deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p>Loading offers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Offers</h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button onClick={fetchOffers} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gift className="w-5 h-5" />
          <span>Your Loyalty Offers</span>
          <Button onClick={fetchOffers} variant="ghost" size="sm" className="ml-auto">
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {offers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No offers created yet. Create your first offer above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{offer.reward_description}</h3>
                      <Badge variant={offer.is_active ? "default" : "secondary"}>
                        {offer.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Spend ${offer.spend_amount} → Earn {offer.points_earned} points</p>
                      <p>Reward at {offer.reward_threshold} points</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={offer.is_active}
                      onCheckedChange={(checked) => toggleOfferStatus(offer.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteOffer(offer.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OffersList;
