
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoyaltyOffer } from '@/types';

export const useLoyaltyOffers = (businessId?: string) => {
  return useQuery({
    queryKey: ['loyalty-offers', businessId],
    queryFn: async (): Promise<LoyaltyOffer[]> => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('loyalty_offers')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loyalty offers:', error);
        throw error;
      }

      // Type cast the data to match our LoyaltyOffer interface
      return (data || []).map(item => ({
        ...item,
        offer_type: (item.offer_type as 'points_deal' | 'special_offer') || 'points_deal'
      }));
    },
    enabled: !!businessId,
  });
};
