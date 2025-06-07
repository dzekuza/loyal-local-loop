
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ComingSoonBusinessCard from '@/components/business/ComingSoonBusinessCard';
import { useComingSoonBusinesses } from '@/hooks/useComingSoonBusinesses';

const ComingSoonBusinesses = () => {
  const { data: businesses, isLoading, error } = useComingSoonBusinesses();
  const navigate = useNavigate();

  if (error) {
    console.error('Error loading coming soon businesses:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error Loading Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error loading the coming soon businesses. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
      </div>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center space-x-2">
          <Clock className="w-8 h-8" />
          <span>Coming Soon</span>
        </h1>
        <p className="text-gray-600">
          These businesses will be joining our platform soon. Own one of these? Claim it now!
        </p>
      </div>

      {/* Content */}
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
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : businesses && businesses.length > 0 ? (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              {businesses.length} businesses coming soon
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <ComingSoonBusinessCard 
                key={business.id} 
                business={business} 
              />
            ))}
          </div>
        </>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-6 h-6" />
              <span>No Coming Soon Businesses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              There are no businesses in the coming soon list at the moment. Check back later!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComingSoonBusinesses;
