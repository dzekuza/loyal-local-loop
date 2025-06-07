
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/types';

interface BusinessPreviewCardProps {
  business: Business;
}

const BusinessPreviewCard: React.FC<BusinessPreviewCardProps> = ({ business }) => {
  // Count only active offers
  const activeOffersCount = business.loyaltyOffers?.filter(offer => offer.is_active)?.length || 0;

  console.log('🏢 Business card for:', business.name, 'active offers:', activeOffersCount, 'total offers:', business.loyaltyOffers?.length);

  return (
    <Link to={`/business/${business.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
        {/* Full Cover Image with Overlay */}
        <div className="relative h-40 overflow-hidden">
          {business.coverImage ? (
            <img 
              src={business.coverImage} 
              alt={`${business.name} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600" />
          )}
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Active Offers Badge */}
          {activeOffersCount > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1">
                {activeOffersCount} {activeOffersCount === 1 ? 'aktyvus pasiūlymas' : 'aktyvūs pasiūlymai'}
              </Badge>
            </div>
          )}
          
          {/* Business Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">
              {business.name}
            </h3>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
              {business.businessType}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {business.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2 break-words">
              {business.description}
            </p>
          )}
          
          {business.address && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{business.address}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default BusinessPreviewCard;
