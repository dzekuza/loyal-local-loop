
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import CustomerProfileForm from '@/components/customer/CustomerProfileForm';
import CustomerCodeDisplay from '@/components/customer/CustomerCodeDisplay';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const CustomerProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAuthenticated, userRole, currentUser } = useAppStore();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'customer') {
      navigate('/login');
      return;
    }

    loadProfile();
  }, [isAuthenticated, userRole, user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data || currentUser);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: t('common.error'),
        description: t('profile.error'),
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
          <p className="text-gray-600 mb-4">{t('profile.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/businesses')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('profile.backToBusinesses')}
          </Button>
        </div>

        {/* Customer Code Display */}
        {user && profile && (
          <div className="mb-6">
            <CustomerCodeDisplay
              customerId={user.id}
              customerName={profile.name || user.email || 'Customer'}
              showInstructions={true}
            />
          </div>
        )}

        <CustomerProfileForm 
          profile={profile}
          onUpdate={setProfile}
        />
      </div>
    </div>
  );
};

export default CustomerProfilePage;
