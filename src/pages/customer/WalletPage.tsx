
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import WalletHeader from '@/components/wallet/WalletHeader';
import EmptyWalletState from '@/components/wallet/EmptyWalletState';
import SubscriptionBanner from '@/components/subscription/SubscriptionBanner';
import SubscriptionManager from '@/components/subscription/SubscriptionManager';
import PWAWalletCard from '@/components/wallet/PWAWalletCard';
import GoogleWalletCard from '@/components/wallet/GoogleWalletCard';
import DownloadableCard from '@/components/wallet/DownloadableCard';
import WebWalletCard from '@/components/wallet/WebWalletCard';
import PassKitWalletCard from '@/components/wallet/PassKitWalletCard';

interface WalletCard {
  id: string;
  business: {
    id: string;
    name: string;
    business_type: string;
    description: string;
    logo?: string;
  };
  points: number;
  lastActivity: string;
}

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRole } = useAppStore();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isTrialActive, trialDaysLeft, hasActiveSubscription, checkSubscription } = useSubscription();
  const [walletCards, setWalletCards] = useState<WalletCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userRole !== 'customer') {
      navigate('/login');
      return;
    }
    loadWalletCards();
    
    // Check subscription on mount
    checkSubscription();
  }, [user, userRole]);

  const loadWalletCards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_points')
        .select(`
          total_points,
          updated_at,
          business:businesses (
            id,
            name,
            business_type,
            description,
            logo
          )
        `)
        .eq('customer_id', user.id)
        .gt('total_points', 0);

      if (error) throw error;

      const cards: WalletCard[] = data.map(item => ({
        id: item.business.id,
        business: item.business,
        points: item.total_points,
        lastActivity: item.updated_at
      }));

      setWalletCards(cards);
    } catch (error) {
      console.error('Error loading wallet cards:', error);
      toast({
        title: t('common.error'),
        description: "Failed to load wallet cards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription",
        description: "Please ensure Stripe is properly configured",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <WalletHeader 
          onBack={() => navigate('/businesses')}
          onAddCards={() => navigate('/businesses')}
        />

        {(!hasActiveSubscription && !isTrialActive) && (
          <div className="mb-6">
            <SubscriptionBanner 
              trialDaysLeft={trialDaysLeft}
              onSubscribe={handleSubscribe}
            />
          </div>
        )}

        <div className="mb-6">
          <SubscriptionManager 
            isSubscribed={hasActiveSubscription}
            onSubscriptionChange={checkSubscription}
          />
        </div>

        {walletCards.length === 0 ? (
          <EmptyWalletState onExploreBusinesses={() => navigate('/businesses')} />
        ) : (
          <Tabs defaultValue="web" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="web">{t('wallet.tabs.web')}</TabsTrigger>
              <TabsTrigger value="pwa">{t('wallet.tabs.pwa')}</TabsTrigger>
              <TabsTrigger value="google">{t('wallet.tabs.google')}</TabsTrigger>
              <TabsTrigger value="apple">{t('wallet.tabs.apple')}</TabsTrigger>
              <TabsTrigger value="download">{t('wallet.tabs.download')}</TabsTrigger>
            </TabsList>

            <TabsContent value="web" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {walletCards.map(card => (
                  <WebWalletCard 
                    key={card.id}
                    card={card}
                    customerId={user.id}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pwa" className="space-y-4">
              <PWAWalletCard 
                cards={walletCards}
                customerId={user.id}
                customerName={user.email || 'Customer'}
              />
            </TabsContent>

            <TabsContent value="google" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {walletCards.map(card => (
                  <GoogleWalletCard 
                    key={card.id}
                    card={card}
                    customerId={user.id}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="apple" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {walletCards.map(card => (
                  <PassKitWalletCard 
                    key={card.id}
                    card={card}
                    customerId={user.id}
                    customerName={user.email || 'Customer'}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="download" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {walletCards.map(card => (
                  <DownloadableCard 
                    key={card.id}
                    card={card}
                    customerId={user.id}
                    customerName={user.email || 'Customer'}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
