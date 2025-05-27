import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Gift, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoyaltyOffer {
  id: string;
  spend_amount: number;
  points_earned: number;
  reward_threshold: number;
  reward_description: string;
  is_active: boolean;
  created_at: string;
}

const OffersList = () => {
  const { currentBusiness } = useAppStore();
  const { toast } = useToast();
  const [offers, setOffers] = useState<LoyaltyOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBusiness) {
      fetchOffers();
    }
  }, [currentBusiness]);

  const fetchOffers = async () => {
    if (!currentBusiness) return;

    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch offers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({ is_active: !currentStatus })
        .eq('id', offerId);

      if (error) throw error;

      await fetchOffers();
      toast({
        title: "Offer Updated",
        description: `Offer ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
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
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', offerId);

      if (error) throw error;

      await fetchOffers();
      toast({
        title: "Offer Deleted",
        description: "Offer deleted successfully",
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
          <div className="text-center">Loading offers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gift className="w-5 h-5" />
          <span>Your Loyalty Offers ({offers.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {offers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No offers created yet</p>
            <p className="text-sm">Create your first loyalty offer to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={offer.is_active ? "default" : "secondary"}>
                        {offer.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Created {new Date(offer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">
                        Spend €{offer.spend_amount} → Earn {offer.points_earned} points
                      </p>
                      <p className="text-sm text-gray-600">
                        Reward at {offer.reward_threshold} points: {offer.reward_description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                    >
                      {offer.is_active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
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
