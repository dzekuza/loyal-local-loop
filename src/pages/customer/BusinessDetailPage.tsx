
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Phone, Mail, Star, Gift, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Business, LoyaltyOffer } from '@/types';
import CustomerLoyaltyCard from '@/components/customer/CustomerLoyaltyCard';
import { useTranslation } from 'react-i18next';

const BusinessDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Transform database fields to match Business interface
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        logo: data.logo,
        address: data.address,
        businessType: data.business_type,
        description: data.description,
        qrCode: data.qr_code,
        createdAt: new Date(data.created_at),
        phone: data.phone || undefined,
      } as Business;
    },
    enabled: !!id,
  });

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ['business-offers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_offers')
        .select('*')
        .eq('business_id', id)
        .eq('is_active', true);

      if (error) throw error;
      return data as LoyaltyOffer[];
    },
    enabled: !!id,
  });

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-600 relative">
          <div className="absolute top-4 left-4">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
          <div className="absolute -bottom-8 left-4">
            <Skeleton className="w-16 h-16 rounded-xl" />
          </div>
        </div>
        
        <div className="container mx-auto px-4 pt-12 pb-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-96" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Business Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The business you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/businesses">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Businesses
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {business.coverImage ? (
          <img 
            src={business.coverImage} 
            alt={`${business.name} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600" />
        )}
        
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Button asChild variant="secondary" size="icon" className="bg-white/90 backdrop-blur-sm">
            <Link to="/businesses">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>
        
        {/* Logo */}
        <div className="absolute -bottom-8 left-4 md:left-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
            {business.logo ? (
              <img 
                src={business.logo} 
                alt={business.name} 
                className="w-full h-full object-cover rounded-lg" 
              />
            ) : (
              <Users className="w-8 h-8 text-gray-600" />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="space-y-6">
          {/* Business Header Info */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">
                  {business.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {business.businessType}
                  </Badge>
                  {offers && offers.length > 0 && (
                    <Badge variant="default" className="text-sm bg-green-600">
                      <Gift className="w-3 h-3 mr-1" />
                      {offers.length} {t('business.activeOffers')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {business.description && (
              <p className="text-gray-600 leading-relaxed max-w-3xl break-words">
                {business.description}
              </p>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Offers */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Offers Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    <span>Active Offers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {offersLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : offers && offers.length > 0 ? (
                    <div className="space-y-4">
                      {offers.map((offer) => (
                        <div key={offer.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 break-words">
                                {offer.reward_description}
                              </h3>
                              <div className="flex items-center space-x-1 text-purple-600">
                                <Star className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {offer.reward_threshold} points needed
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No active offers at the moment</p>
                      <p className="text-sm text-gray-400">Check back later for new deals!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Business Info & Actions */}
            <div className="space-y-6">
              {/* Loyalty Program Card */}
              <CustomerLoyaltyCard business={business} />

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {business.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <a 
                        href={`mailto:${business.email}`}
                        className="text-blue-600 hover:underline break-all"
                      >
                        {business.email}
                      </a>
                    </div>
                  )}
                  
                  {business.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <a 
                        href={`tel:${business.phone}`}
                        className="text-blue-600 hover:underline break-all"
                      >
                        {business.phone}
                      </a>
                    </div>
                  )}
                  
                  {business.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 break-words">
                        {business.address}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailPage;
