
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Gift, ArrowRight, Building2, Plus, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
            logo,
            address
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
        description: "Failed to load your loyalty cards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (businessId: string) => {
    navigate(`/business/${businessId}`);
  };

  const handleAddCards = () => {
    navigate('/discover');
  };

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
              <h1 className="text-2xl md:text-3xl font-bold mb-2">My Cards</h1>
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
              <Card 
                key={card.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
                onClick={() => handleCardClick(card.id)}
              >
                {/* Card Header with Business Info */}
                <CardHeader className="pb-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                      {card.business.logo ? (
                        <img 
                          src={card.business.logo} 
                          alt={card.business.name} 
                          className="w-10 h-10 object-cover rounded-md" 
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {card.business.name}
                      </h3>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {card.business.business_type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {/* Card Content */}
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Points Display */}
                    <div className="text-center bg-gray-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {card.points}
                      </div>
                      <div className="text-sm text-gray-600">Points Available</div>
                    </div>

                    {/* Business Description */}
                    {card.business.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 break-words">
                        {card.business.description}
                      </p>
                    )}

                    {/* Address */}
                    {card.business.address && (
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{card.business.address}</span>
                      </div>
                    )}

                    {/* Last Activity */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last activity:</span>
                      <span>{formatDistanceToNow(new Date(card.lastActivity), { addSuffix: true })}</span>
                    </div>

                    {/* Action Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full flex items-center justify-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(card.id);
                      }}
                    >
                      <Gift className="w-4 h-4" />
                      <span>View Rewards</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCardsPage;
