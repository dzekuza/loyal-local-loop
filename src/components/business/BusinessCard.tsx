
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Business } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Users } from 'lucide-react';

interface BusinessCardProps {
  business: Business;
  showActions?: boolean;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, showActions = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/business/${business.id}`);
  };

  return (
    <Card 
      className="card-business hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <div className="business-logo w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {business.logo ? (
              <img 
                src={business.logo} 
                alt={business.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-purple-600 font-semibold text-lg">
                {business.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="business-name font-semibold text-gray-900 truncate">
              {business.name}
            </h3>
            <Badge variant="secondary" className="business-type mt-1">
              {business.businessType}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="business-description text-sm text-gray-600 mb-3 line-clamp-2">
          {business.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <MapPin size={12} />
            <span>Local Business</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={12} />
            <span>Loyalty Program</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessCard;
