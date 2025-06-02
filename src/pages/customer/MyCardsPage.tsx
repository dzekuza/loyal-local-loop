
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Plus, AlertTriangle, Building } from 'lucide-react';
import EnhancedLoyaltyCard from '@/components/loyalty/EnhancedLoyaltyCard';
import CustomerCodeDisplay from '@/components/customer/CustomerCodeDisplay';

interface WalletCard {
  id: string;
  business: {
    id: string;
    name: string;
    business_type: string;
    description: string;
    logo?: string;
    address?: string;
  };
  points: number;
  lastActivity: string;
}

const MyCardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRole } = useAppStore();
  const { toast } = useToast();
  const [walletCards, setWalletCards] = useState<WalletCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerProfile, setCustomerProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (userRole === 'business') {
      navigate('/dashboard');
      return;
    }
    
    if (userRole === 'customer') {
      loadWalletCards();
      loadCustomerProfile();
    }
    
    setLoading(false);
  }, [user, userRole]);

  const loadCustomerProfile = async () => {
    if (!user || userRole !== 'customer') return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCustomerProfile(data);
    } catch (error) {
      console.error('Error loading customer profile:', error);
    }
  };

  const loadWalletCards = async () => {
    if (!user || userRole !== 'customer') return;

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
            logo,
            address
          )
        `)
        .eq('customer_id', user.id);

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
        description: "Failed to load your loyalty cards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCards = () => {
    navigate('/discover');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  // Show message for business users
  if (user && userRole === 'business') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Building className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Business Account</h3>
              <p className="text-gray-600 mb-6">
                You're logged in as a business. This page is for customers to view their loyalty cards.
                Go to your business dashboard to manage your loyalty programs.
              </p>
              <Button onClick={handleGoToDashboard} className="w-full">
                <Building className="w-4 h-4 mr-2" />
                Go to Business Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show message for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-6">
                Please log in as a customer to view your loyalty cards.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">My Loyalty Cards</h1>
              <p className="text-gray-600">
                {walletCards.length > 0 
                  ? `You have ${walletCards.length} loyalty card${walletCards.length === 1 ? '' : 's'}`
                  : 'Your loyalty cards will appear here'
                }
              </p>
            </div>
            <Button 
              onClick={handleAddCards}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Cards</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Customer Code Display - Only show for customers */}
        {user && userRole === 'customer' && customerProfile && (
          <div className="mb-6">
            <CustomerCodeDisplay
              customerId={user.id}
              customerName={customerProfile.name || user.email || 'Customer'}
              showInstructions={walletCards.length === 0}
              className="max-w-md mx-auto"
            />
          </div>
        )}

        {walletCards.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No loyalty cards yet</h3>
              <p className="text-gray-600 mb-6">
                Start collecting loyalty points by visiting local businesses and joining their programs.
              </p>
              <Button onClick={handleAddCards} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Discover Businesses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {walletCards.map((card) => (
              <EnhancedLoyaltyCard
                key={card.id}
                card={card}
                customerId={user.id}
                onRedemption={loadWalletCards}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCardsPage;
