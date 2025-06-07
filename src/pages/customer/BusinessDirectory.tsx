
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import BusinessCard from '@/components/business/BusinessCard';
import BusinessSearchBar from '@/components/business/BusinessSearchBar';
import BusinessCategoryFilter from '@/components/business/BusinessCategoryFilter';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useTranslation } from 'react-i18next';

const BusinessDirectory = () => {
  const { data: businesses, isLoading, error } = useBusinesses();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showSpecialDeals, setShowSpecialDeals] = useState(false);

  const categories = useMemo(() => {
    if (!businesses) return [];
    const uniqueCategories = [...new Set(businesses.map(b => b.businessType))];
    return uniqueCategories.sort();
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];
    
    return businesses.filter(business => {
      const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           business.businessType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || business.businessType === selectedCategory;
      
      const hasSpecialDeals = showSpecialDeals ? (business.loyaltyOffers?.length || 0) > 0 : true;
      
      return matchesSearch && matchesCategory && hasSpecialDeals;
    });
  }, [businesses, searchTerm, selectedCategory, showSpecialDeals]);

  // Debug values for interpolation
  const count = filteredBusinesses?.length || 0;
  const total = businesses?.length || 0;
  
  console.log('Translation values:', { count, total });

  if (error) {
    console.error('Error loading businesses:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{t('business.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('business.errorMessage')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('nav.businesses')}</h1>
        <p className="text-gray-600 break-words">{t('business.subtitle')}</p>
      </div>

      <div className="mb-6">
        <BusinessSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showSpecialDeals={showSpecialDeals}
          onSpecialDealsToggle={() => setShowSpecialDeals(!showSpecialDeals)}
        />
      </div>

      {categories.length > 0 && (
        <div className="mb-6">
          <BusinessCategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start space-x-3">
                  <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBusinesses && filteredBusinesses.length > 0 ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <p className="text-gray-600 break-words">
              {businesses && filteredBusinesses ? 
                `Showing ${count} of ${total} businesses` :
                t('search.showingResults', { count, total })
              }
            </p>
            {showSpecialDeals && (
              <Badge variant="secondary" className="self-start sm:self-auto">
                {t('business.withSpecialDeals')}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <BusinessCard 
                key={business.id} 
                business={business} 
                showActions={false} 
              />
            ))}
          </div>
        </>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{t('search.noResults')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="break-words">
              {searchTerm || selectedCategory !== 'All' || showSpecialDeals
                ? t('business.noMatchingBusinesses')
                : t('business.noBusinessesYet')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessDirectory;
