
import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ProfileFixer from '@/components/ProfileFixer';
import BusinessCard from '@/components/business/BusinessCard';
import { useBusinesses } from '@/hooks/useBusinesses';

const BusinessDirectory = () => {
  const { isAuthenticated, userRole } = useAppStore();
  const { data: businesses, isLoading, error } = useBusinesses();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to view the business directory.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProfileFixer />
      </div>
    );
  }

  if (error) {
    console.error('Error loading businesses:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error Loading Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error loading the business directory. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Business Directory</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start space-x-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
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
      ) : businesses && businesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <BusinessCard 
              key={business.id} 
              business={business} 
              showActions={false} 
            />
          ))}
        </div>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>No Businesses Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no businesses in the directory yet. Check back later!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessDirectory;
