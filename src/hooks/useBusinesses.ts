
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Business } from '@/types';

export const useBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: async (): Promise<Business[]> => {
      console.log('Fetching businesses from database with loyalty offers');
      
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id, 
          name, 
          email, 
          logo, 
          cover_image, 
          address, 
          phone, 
          business_type, 
          description, 
          qr_code, 
          created_at,
          loyalty_offers:loyalty_offers(
            id,
            offer_name,
            reward_description,
            is_active
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching businesses:', error);
        throw error;
      }

      console.log('Fetched businesses with offers:', data);

      // Transform the database data to match our Business type
      return data.map(business => ({
        id: business.id,
        name: business.name,
        email: business.email,
        logo: business.logo || undefined,
        coverImage: business.cover_image || undefined,
        address: business.address || undefined,
        phone: business.phone || undefined,
        businessType: business.business_type,
        description: business.description || '',
        qrCode: business.qr_code || '',
        createdAt: new Date(business.created_at || ''),
        loyaltyOffers: business.loyalty_offers || []
      }));
    },
  });
};
