
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Building2, Calendar, Eye } from 'lucide-react';
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

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {business.logo ? (
              <img src={business.logo} alt={business.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Building2 className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {business.name}
            </CardTitle>
            <Badge variant="secondary" className="mt-1">
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
