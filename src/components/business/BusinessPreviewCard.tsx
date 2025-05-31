
import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Building2, MapPin, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/types';
import { useTranslation } from 'react-i18next';

interface BusinessPreviewCardProps {
  business: Business;
}

const BusinessPreviewCard: React.FC<BusinessPreviewCardProps> = ({ business }) => {
  const { t } = useTranslation();
  const offersCount = business.loyaltyOffers?.length || 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-br from-purple-500 to-blue-600 relative overflow-hidden">
        {business.coverImage ? (
          <img 
            src={business.coverImage} 
            alt={`${business.name} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600" />
        )}
        {/* Logo positioned over cover */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg border">
            {business.logo ? (
              <img src={business.logo} alt={business.name} className="w-10 h-10 object-cover rounded-md" />
            ) : (
              <Building2 className="w-6 h-6 text-gray-600" />
            )}
          </div>
        </div>
      </div>

      <CardHeader className="pt-8 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate mb-1">
              {business.name}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {business.businessType}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {business.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 break-words">
            {business.description}
          </p>
        )}
        
        {business.address && (
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{business.address}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-green-600">
            <Gift className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">
              {offersCount} {t('business.activeOffers')}
            </span>
          </div>
        </div>
        
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to={`/business/${business.id}`}>
            {t('business.viewProfile')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default BusinessPreviewCard;
