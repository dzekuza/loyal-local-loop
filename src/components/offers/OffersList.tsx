import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Gift, Trash2, AlertCircle, Clock, Calendar, Star, Percent, Euro, ShoppingBag } from 'lucide-react';

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
  offer_type?: 'points_deal' | 'special_offer' | 'stamp_card' | 'percentage_discount' | 'fixed_discount' | 'buy_x_get_y' | 'time_based' | 'first_customer' | 'birthday_anniversary' | 'referral' | 'tiered_spending' | 'product_specific';
  offer_name?: string;
  offer_rule?: string;
  points_per_euro?: number;
  valid_from?: string;
  valid_to?: string;
  time_from?: string;
  time_to?: string;
  offer_config?: any;
  usage_limits?: any;
  eligibility_rules?: any;
  scheduling?: any;
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
      const typedOffers = (data || []).map(offer => ({
        ...offer,
        offer_type: (offer.offer_type as 'points_deal' | 'special_offer' | 'stamp_card' | 'percentage_discount' | 'fixed_discount' | 'buy_x_get_y' | 'time_based' | 'first_customer' | 'birthday_anniversary' | 'referral' | 'tiered_spending' | 'product_specific') || 'points_deal'
      }));
      setOffers(typedOffers);
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

  const getOfferTypeIcon = (offerType: string) => {
    switch (offerType) {
      case 'points_deal':
        return <Star className="w-4 h-4" />;
      case 'stamp_card':
        return <Gift className="w-4 h-4" />;
      case 'percentage_discount':
        return <Percent className="w-4 h-4" />;
      case 'fixed_discount':
        return <Euro className="w-4 h-4" />;
      case 'buy_x_get_y':
        return <ShoppingBag className="w-4 h-4" />;
      case 'special_offer':
        return <Clock className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getOfferTypeName = (offerType: string) => {
    switch (offerType) {
      case 'points_deal':
        return 'Points Deal';
      case 'stamp_card':
        return 'Stamp Card';
      case 'percentage_discount':
        return 'Percentage Discount';
      case 'fixed_discount':
        return 'Fixed Discount';
      case 'buy_x_get_y':
        return 'Buy X Get Y';
      case 'special_offer':
        return 'Special Offer';
      case 'time_based':
        return 'Happy Hour';
      case 'first_customer':
        return 'First Customer';
      case 'birthday_anniversary':
        return 'Birthday/Anniversary';
      case 'referral':
        return 'Referral';
      case 'tiered_spending':
        return 'Tiered Spending';
      case 'product_specific':
        return 'Product Specific';
      default:
        return 'Unknown';
    }
  };

  const getOfferTypeColor = (offerType: string) => {
    switch (offerType) {
      case 'points_deal':
        return 'bg-blue-100 text-blue-800';
      case 'stamp_card':
        return 'bg-purple-100 text-purple-800';
      case 'percentage_discount':
        return 'bg-green-100 text-green-800';
      case 'fixed_discount':
        return 'bg-orange-100 text-orange-800';
      case 'buy_x_get_y':
        return 'bg-red-100 text-red-800';
      case 'special_offer':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOfferDetails = (offer: LoyaltyOffer) => {
    const config = offer.offer_config || {};
    
    switch (offer.offer_type) {
      case 'points_deal':
        return (
          <>
            <p className="break-words">
              {offer.points_per_euro 
                ? `${offer.points_per_euro} points per EUR spent`
                : `Spend €${offer.spend_amount} → Earn ${offer.points_earned} points`
              }
            </p>
            <p>Reward at {offer.reward_threshold} points</p>
          </>
        );

      case 'stamp_card':
        return (
          <>
            <p className="break-words">
              {config.visits_required} visits required
            </p>
            {config.stamp_value && (
              <p>Minimum €{config.stamp_value} per visit</p>
            )}
          </>
        );

      case 'percentage_discount':
        return (
          <>
            <p className="break-words">
              {config.discount_percentage}% discount
            </p>
            {config.minimum_spend > 0 && (
              <p>Minimum spend: €{config.minimum_spend}</p>
            )}
            {config.maximum_discount > 0 && (
              <p>Max discount: €{config.maximum_discount}</p>
            )}
          </>
        );

      case 'fixed_discount':
        return (
          <>
            <p className="break-words">
              €{config.discount_amount} off
            </p>
            {config.minimum_spend > 0 && (
              <p>Minimum spend: €{config.minimum_spend}</p>
            )}
          </>
        );

      case 'buy_x_get_y':
        return (
          <>
            <p className="break-words">
              Buy {config.buy_quantity}, get {config.get_quantity} free
            </p>
            {config.item_category && (
              <p>Category: {config.item_category}</p>
            )}
          </>
        );

      case 'special_offer':
        return (
          <>
            {offer.offer_rule && (
              <p className="break-words"><strong>Rule:</strong> {offer.offer_rule}</p>
            )}
            {(offer.valid_from || offer.valid_to) && (
              <p className="flex items-start">
                <Calendar className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span className="break-words">
                  {offer.valid_from && `From ${formatDate(offer.valid_from)}`}
                  {offer.valid_from && offer.valid_to && ' '}
                  {offer.valid_to && `Until ${formatDate(offer.valid_to)}`}
                </span>
              </p>
            )}
            {(offer.time_from || offer.time_to) && (
              <p className="flex items-start">
                <Clock className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span className="break-words">
                  {offer.time_from && `From ${formatTime(offer.time_from)}`}
                  {offer.time_from && offer.time_to && ' '}
                  {offer.time_to && `Until ${formatTime(offer.time_to)}`}
                </span>
              </p>
            )}
          </>
        );

      default:
        return (
          <p className="break-words">
            {offer.points_per_euro 
              ? `${offer.points_per_euro} points per EUR spent`
              : `Spend €${offer.spend_amount} → Earn ${offer.points_earned} points`
            }
          </p>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
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
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5" />
            <span>Your Loyalty Offers</span>
          </div>
          <Button onClick={fetchOffers} variant="ghost" size="sm">
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {offers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No offers created yet. Create your first offer above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="border rounded-lg p-3 sm:p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Content Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <h3 className="font-medium text-sm sm:text-base break-words">
                        {offer.offer_type === 'special_offer' && offer.offer_name 
                          ? offer.offer_name 
                          : offer.reward_description}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={offer.is_active ? "default" : "secondary"} className="text-xs">
                          {offer.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getOfferTypeColor(offer.offer_type || 'points_deal')}`}
                        >
                          <span className="mr-1">{getOfferTypeIcon(offer.offer_type || 'points_deal')}</span>
                          {getOfferTypeName(offer.offer_type || 'points_deal')}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      {renderOfferDetails(offer)}
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex flex-row lg:flex-col items-center gap-3 lg:gap-2 pt-2 lg:pt-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 lg:hidden">
                        {offer.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Switch
                        checked={offer.is_active}
                        onCheckedChange={(checked) => toggleOfferStatus(offer.id, checked)}
                        className="scale-90 sm:scale-100"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteOffer(offer.id)}
                      className="text-red-600 hover:text-red-800 p-2 h-8 w-8"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
