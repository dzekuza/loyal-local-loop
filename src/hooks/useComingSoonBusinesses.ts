
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ComingSoonBusiness } from '@/types/comingSoon';

export const useComingSoonBusinesses = () => {
  return useQuery({
    queryKey: ['coming-soon-businesses'],
    queryFn: async (): Promise<ComingSoonBusiness[]> => {
      console.log('Fetching coming soon businesses from database');
      
      const { data, error } = await supabase
        .from('coming_soon_businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coming soon businesses:', error);
        throw error;
      }

      console.log('Fetched coming soon businesses:', data);
      return data || [];
    },
  });
};
