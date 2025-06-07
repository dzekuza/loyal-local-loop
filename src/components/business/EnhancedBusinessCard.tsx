
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
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
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group w-72 flex-shrink-0 border-0">
        {/* Full Cover Image with Overlay Content */}
        <div className="relative h-48 overflow-hidden">
          {business.coverImage ? (
            <img 
              src={business.coverImage} 
              alt={`${business.name} cover`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600" />
          )}
          
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Active Offers Badge - Top Left */}
          {activeOffersCount > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1">
                {activeOffersCount} aktyvūs pasiūlymai
              </Badge>
            </div>
          )}
          
          {/* Business Content Overlay - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <h3 className="font-bold text-xl text-white mb-2 line-clamp-1">
              {business.name}
            </h3>
            
            {business.description && (
              <p className="text-white/90 text-sm line-clamp-2 mb-2">
                {business.description}
              </p>
            )}
            
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
              {business.businessType}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default EnhancedBusinessCard;
