
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import CustomerLoyaltyCard from '@/components/customer/CustomerLoyaltyCard';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Info } from 'lucide-react';
import { Business } from '@/types';
import { useTranslation } from 'react-i18next';

interface UserPoints {
  total_points: number;
}

const BusinessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRole } = useAppStore();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [business, setBusiness] = useState<Business | null>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/discover');
      return;
    }
    loadBusinessDetails();
  }, [id, user]);

  const loadBusinessDetails = async () => {
    try {
      // Load business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select(`
          *,
          loyalty_offers:loyalty_offers(
            id,
            offer_name,
            reward_description,
            is_active,
            business_id,
            spend_amount,
            points_earned,
            reward_threshold,
            created_at,
            updated_at
          )
        `)
        .eq('id', id)
        .single();

      if (businessError) throw businessError;
      
      // Transform the database data to match our Business type
      const transformedBusiness: Business = {
        id: businessData.id,
        name: businessData.name,
        email: businessData.email,
        logo: businessData.logo || undefined,
        coverImage: businessData.cover_image || undefined,
        address: businessData.address || undefined,
        phone: businessData.phone || undefined,
        businessType: businessData.business_type,
        description: businessData.description || '',
        qrCode: businessData.qr_code || '',
        createdAt: new Date(businessData.created_at || ''),
        loyaltyOffers: (businessData.loyalty_offers || []).map(offer => ({
          id: offer.id,
          business_id: offer.business_id || businessData.id,
          spend_amount: offer.spend_amount || 0,
          points_earned: offer.points_earned || 0,
          reward_threshold: offer.reward_threshold || 0,
          reward_description: offer.reward_description,
          offer_name: offer.offer_name || '',
          is_active: offer.is_active,
          created_at: offer.created_at || '',
          updated_at: offer.updated_at || ''
        }))
      };
      
      setBusiness(transformedBusiness);

      // Load user points only for authenticated customers
      if (user && userRole === 'customer') {
        const { data: pointsData, error: pointsError } = await supabase
          .from('user_points')
          .select('total_points')
          .eq('customer_id', user.id)
          .eq('business_id', id)
          .maybeSingle();

        if (pointsError && pointsError.code !== 'PGRST116') {
          console.error('Error loading user points:', pointsError);
        } else {
          setUserPoints(pointsData);
        }
      }
    } catch (error) {
      console.error('Error loading business details:', error);
      toast({
        title: t('common.error'),
        description: t('common.errorLoadingBusinesses'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('businessDetail.businessNotFound')}</h1>
          <Button onClick={() => navigate('/discover')}>
            {t('businessDetail.backToDiscover')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      {business.coverImage && (
        <div 
          className="h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${business.coverImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/discover')}
          className="mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('businessDetail.backToDiscover')}</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  {business.logo ? (
                    <img 
                      src={business.logo} 
                      alt={business.name} 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-2xl">{business.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {business.businessType}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('businessDetail.about')}</h3>
                  <p className="text-gray-600">{business.description}</p>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('businessDetail.contactInformation')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{business.email}</span>
                    </div>
                    {business.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{business.phone}</span>
                      </div>
                    )}
                    {business.address && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{business.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            {userRole === 'business' ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Info className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('businessDetail.businessAccount')}</h3>
                  <p className="text-gray-600 mb-4">
                    {t('businessDetail.viewingAsBusiness')}
                  </p>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    {t('businessDetail.goToDashboard')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <CustomerLoyaltyCard 
                business={business}
                userPoints={userPoints?.total_points}
                onJoinProgram={loadBusinessDetails}
                isMember={!!userPoints}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailPage;
