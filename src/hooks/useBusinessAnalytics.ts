import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';

interface BusinessAnalytics {
  totalCustomers: number;
  activeOffers: number;
  totalPointsDistributed: number;
  recentActivity: any[];
}

export const useBusinessAnalytics = () => {
  const { currentBusiness } = useAppStore();
  const [analytics, setAnalytics] = useState<BusinessAnalytics>({
    totalCustomers: 0,
    activeOffers: 0,
    totalPointsDistributed: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBusiness) return;

    const fetchAnalytics = async () => {
      try {
        // Fetch total customers for this business
        const { data: customers, error: customersError } = await supabase
          .from('user_points')
          .select('customer_id')
          .eq('business_id', currentBusiness.id);

        if (customersError) throw customersError;

        // Fetch active offers
        const { data: offers, error: offersError } = await supabase
          .from('rewards')
          .select('*')
          .eq('business_id', currentBusiness.id)
          .eq('is_active', true);

        if (offersError) throw offersError;

        // Fetch total points distributed
        const { data: points, error: pointsError } = await supabase
          .from('user_points')
          .select('total_points')
          .eq('business_id', currentBusiness.id);

        if (pointsError) throw pointsError;

        const totalPoints = points?.reduce((sum, p) => sum + p.total_points, 0) || 0;
        const uniqueCustomers = new Set(customers?.map(c => c.customer_id)).size;

        setAnalytics({
          totalCustomers: uniqueCustomers,
          activeOffers: offers?.length || 0,
          totalPointsDistributed: totalPoints,
          recentActivity: customers?.slice(0, 10) || []
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [currentBusiness]);

  return { analytics, loading };
};
