
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, MapPin, Gift, Building2, Compass } from 'lucide-react';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const DiscoverPage = () => {
  const { data: businesses, isLoading, error } = useBusinesses();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];
    return businesses.filter(business => 
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.businessType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [businesses, searchTerm]);

  const businessesByCategory = useMemo(() => {
    if (!filteredBusinesses) return {};
    
    const categories = filteredBusinesses.reduce((acc, business) => {
      const category = business.businessType;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(business);
      return acc;
    }, {} as Record<string, typeof filteredBusinesses>);
    
    return categories;
  }, [filteredBusinesses]);

  const handleBusinessClick = (businessId: string) => {
    navigate(`/business/${businessId}`);
  };

  const handleViewAllCategory = (category: string) => {
    navigate('/businesses', { state: { selectedCategory: category } });
  };

  if (error) {
    console.error('Error loading businesses:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <p className="text-center text-gray-600">There was an error loading businesses. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Discover</h1>
            <p className="text-gray-600">Find local businesses and their loyalty programs</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Quick Stats */}
          {!isLoading && businesses && (
            <div className="mt-4 text-sm text-gray-500">
              {businesses.length} businesses • {Object.keys(businessesByCategory).length} categories
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="flex space-x-4 overflow-hidden">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex-shrink-0 w-64">
                      <Card>
                        <CardContent className="p-4">
                          <Skeleton className="h-32 w-full mb-3 rounded" />
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-16" />
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(businessesByCategory).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(businessesByCategory).map(([category, categoryBusinesses]) => (
              <div key={category} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewAllCategory(category)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    View All
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>

                {/* Business Carousel */}
                <Carousel className="w-full">
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {categoryBusinesses.map((business) => (
                      <CarouselItem key={business.id} className="pl-2 md:pl-4 basis-64 md:basis-72">
                        <Card 
                          className="cursor-pointer hover:shadow-lg transition-all duration-300"
                          onClick={() => handleBusinessClick(business.id)}
                        >
                          {/* Business Cover/Logo */}
                          <div className="h-32 bg-gradient-to-br from-purple-500 to-blue-600 relative">
                            {business.coverImage ? (
                              <img 
                                src={business.coverImage} 
                                alt={`${business.name} cover`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600" />
                            )}
                            {/* Logo positioned over cover - fixed positioning */}
                            <div className="absolute bottom-0 left-3 z-10 transform translate-y-1/2">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg border">
                                {business.logo ? (
                                  <img src={business.logo} alt={business.name} className="w-6 h-6 object-cover rounded-md" />
                                ) : (
                                  <Building2 className="w-4 h-4 text-gray-600" />
                                )}
                              </div>
                            </div>
                          </div>

                          <CardContent className="p-4 pt-8">
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-semibold text-base truncate mb-1">
                                  {business.name}
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                  {business.businessType}
                                </Badge>
                              </div>

                              {business.description && (
                                <p className="text-gray-600 text-sm line-clamp-2 break-words">
                                  {business.description}
                                </p>
                              )}
                              
                              {business.address && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{business.address}</span>
                                </div>
                              )}

                              <div className="flex items-center text-sm text-green-600">
                                <Gift className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {business.loyaltyOffers?.length || 0} offers available
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex" />
                  <CarouselNext className="hidden md:flex" />
                </Carousel>
              </div>
            ))}
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Compass className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No businesses found</h3>
              <p className="text-gray-600 break-words">
                {searchTerm 
                  ? 'No businesses match your search criteria. Try adjusting your search.'
                  : 'There are no businesses in the directory yet. Check back later!'}
              </p>
              {!user && (
                <div className="mt-4">
                  <Button onClick={() => navigate('/register')} className="w-full">
                    Join to discover more
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
