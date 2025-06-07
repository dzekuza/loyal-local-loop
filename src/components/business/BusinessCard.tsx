
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, Eye, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/types';
import { useTranslation } from 'react-i18next';

interface BusinessCardProps {
  business: Business;
  showActions?: boolean;
  onEdit?: (business: Business) => void;
  onDelete?: (businessId: string) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ 
  business, 
  showActions = true, 
  onEdit, 
  onDelete 
}) => {
  const { t } = useTranslation();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Count only active offers
  const activeOffersCount = business.loyaltyOffers?.filter(offer => offer.is_active)?.length || 0;

  return (
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
              {activeOffersCount} offers
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
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 gap-2">
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Calendar className="w-3 h-3" />
            <span>Created {formatDate(business.createdAt)}</span>
          </div>
          <span className="truncate">{business.email}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={`/business/${business.id}`}>
              <Eye className="w-4 h-4 mr-1" />
              {t('business.viewProfile')}
            </Link>
          </Button>
          
          {showActions && (
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(business)} className="flex-shrink-0">
                  {t('common.edit')}
                </Button>
              )}
              
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(business.id)}
                  className="text-red-600 hover:text-red-700 flex-shrink-0"
                >
                  {t('common.delete')}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessCard;
