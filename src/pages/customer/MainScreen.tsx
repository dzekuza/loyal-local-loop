
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Utensils, ShoppingBag, Truck, Heart, PawPrint } from 'lucide-react';
import CategoryCard from '@/components/ui/CategoryCard';
import EnhancedBusinessCard from '@/components/business/EnhancedBusinessCard';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useTranslation } from 'react-i18next';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const MainScreen = () => {
  const { data: businesses, isLoading } = useBusinesses();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const categories = [
    {
      title: 'Pasiūlymai',
      icon: Gift,
      backgroundColor: 'bg-gradient-to-br from-red-500 to-pink-500',
      filter: 'offers'
    },
    {
      title: 'Restoranai',
      icon: Utensils,
      backgroundColor: 'bg-gradient-to-br from-orange-500 to-red-500',
      filter: 'restaurant'
    },
    {
      title: 'Maisto prekės',
      icon: ShoppingBag,
      backgroundColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
      filter: 'grocery'
    },
    {
      title: 'Wolt Market',
      icon: Truck,
      backgroundColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      filter: 'delivery'
    },
    {
      title: 'Sveikatinimo prekės',
      icon: Heart,
      backgroundColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
      filter: 'health'
    },
    {
      title: 'Prekės augintiniams',
      icon: PawPrint,
      backgroundColor: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      filter: 'pets'
    }
  ];

  const businessSections = useMemo(() => {
    if (!businesses) return {};
    
    return {
      popular: businesses.slice(0, 10),
      newBusinesses: businesses.filter(b => {
        const createdDate = new Date(b.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate > thirtyDaysAgo;
      }).slice(0, 10),
      mostOffers: businesses
        .filter(b => (b.loyaltyOffers?.length || 0) > 0)
        .sort((a, b) => (b.loyaltyOffers?.length || 0) - (a.loyaltyOffers?.length || 0))
        .slice(0, 10)
    };
  }, [businesses]);

  const handleCategoryClick = (filter: string) => {
    if (filter === 'offers') {
      navigate('/discover');
    } else {
      navigate('/businesses', { state: { selectedCategory: filter } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-8">
            {/* Categories skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-200 rounded-2xl h-24"></div>
              ))}
            </div>
            
            {/* Business cards skeleton */}
            <div className="space-y-6">
              {[1, 2, 3].map(section => (
                <div key={section} className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="flex space-x-4">
                    {[1, 2, 3].map(card => (
                      <div key={card} className="w-72 h-48 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Categories Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Kategorijos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.filter}
                title={category.title}
                icon={category.icon}
                backgroundColor={category.backgroundColor}
                onClick={() => handleCategoryClick(category.filter)}
              />
            ))}
          </div>
        </div>

        {/* Popular Businesses */}
        {businessSections.popular && businessSections.popular.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Populiarūs šalia tavęs</h2>
            </div>
            <Carousel className="w-full">
              <CarouselContent className="-ml-4">
                {businessSections.popular.map((business) => (
                  <CarouselItem key={business.id} className="pl-4 basis-auto">
                    <EnhancedBusinessCard business={business} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        )}

        {/* New Businesses */}
        {businessSections.newBusinesses && businessSections.newBusinesses.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nauji verslai</h2>
            </div>
            <Carousel className="w-full">
              <CarouselContent className="-ml-4">
                {businessSections.newBusinesses.map((business) => (
                  <CarouselItem key={business.id} className="pl-4 basis-auto">
                    <EnhancedBusinessCard business={business} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        )}

        {/* Most Offers */}
        {businessSections.mostOffers && businessSections.mostOffers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Daugiausiai pasiūlymų</h2>
            </div>
            <Carousel className="w-full">
              <CarouselContent className="-ml-4">
                {businessSections.mostOffers.map((business) => (
                  <CarouselItem key={business.id} className="pl-4 basis-auto">
                    <EnhancedBusinessCard business={business} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainScreen;
