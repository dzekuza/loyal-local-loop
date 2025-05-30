
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Wallet, Download, Share, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PWAWalletCard from '@/components/wallet/PWAWalletCard';
import GoogleWalletCard from '@/components/wallet/GoogleWalletCard';
import DownloadableCard from '@/components/wallet/DownloadableCard';
import WebWalletCard from '@/components/wallet/WebWalletCard';

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
  const [walletCards, setWalletCards] = useState<WalletCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userRole !== 'customer') {
      navigate('/login');
      return;
    }
    loadWalletCards();
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
        title: "Error",
        description: "Failed to load wallet cards",
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
          <p className="text-gray-600">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/businesses')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Businesses</span>
          </Button>
          
          <Button onClick={() => navigate('/businesses')} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Cards</span>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
            <Wallet className="w-8 h-8" />
            <span>My Wallet</span>
          </h1>
          <p className="text-gray-600">
            Manage your loyalty cards in multiple formats - all free!
          </p>
        </div>

        {walletCards.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Loyalty Cards Yet</h3>
              <p className="text-gray-600 mb-4">
                Join business loyalty programs to start earning points
              </p>
              <Button onClick={() => navigate('/businesses')}>
                Explore Businesses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="web" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="web">Web Cards</TabsTrigger>
              <TabsTrigger value="pwa">PWA Wallet</TabsTrigger>
              <TabsTrigger value="google">Google Wallet</TabsTrigger>
              <TabsTrigger value="download">Download</TabsTrigger>
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
