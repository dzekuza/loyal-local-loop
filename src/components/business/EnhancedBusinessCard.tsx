
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/types';

interface EnhancedBusinessCardProps {
  business: Business;
}

const EnhancedBusinessCard: React.FC<EnhancedBusinessCardProps> = ({ business }) => {
  // Count only active offers
  const activeOffersCount = business.loyaltyOffers?.filter(offer => offer.is_active)?.length || 0;

  return (
    <Link to={`/business/${business.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group w-72 flex-shrink-0">
        {/* Cover Image with Overlay */}
        <div className="relative h-32 overflow-hidden">
          {business.coverImage ? (
            <img 
              src={business.coverImage} 
              alt={`${business.name} cover`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600" />
          )}
          
          {/* Active Offers Badge */}
          {activeOffersCount > 0 && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2 py-1">
                {activeOffersCount} aktyvūs pasiūlymai
              </Badge>
            </div>
          )}
          
          {/* Business Logo - positioned at bottom right of cover */}
          <div className="absolute bottom-3 right-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-10 h-10 object-cover rounded-lg" />
              ) : (
                <Building2 className="w-6 h-6 text-gray-600" />
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {business.name}
            </h3>
            
            {business.description && (
              <p className="text-gray-600 text-sm line-clamp-2">
                {business.description}
              </p>
            )}
            
            <Badge variant="secondary" className="text-xs">
              {business.businessType}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EnhancedBusinessCard;
