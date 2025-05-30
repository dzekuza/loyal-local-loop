
import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Star, MapPin, Clock } from 'lucide-react';

interface WalletCard {
  id: string;
  business: {
    id: string;
    name: string;
    business_type: string;
    description: string;
    logo?: string;
  };
  points: number;
  lastActivity: string;
}

interface WebWalletCardProps {
  card: WalletCard;
  customerId: string;
}

const WebWalletCard: React.FC<WebWalletCardProps> = ({ card, customerId }) => {
  const qrData = JSON.stringify({
    type: 'customer',
    customerId,
    businessId: card.business.id,
    timestamp: Date.now()
  });

  const gradientClass = getGradientForBusiness(card.business.business_type);

  return (
    <Card className={`overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${gradientClass}`}>
      <CardHeader className="text-white pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{card.business.name}</h3>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {card.business.business_type}
            </Badge>
          </div>
          {card.business.logo && (
            <div className="w-12 h-12 bg-white rounded-lg p-2 ml-4">
              <img 
                src={card.business.logo} 
                alt={card.business.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{card.points}</div>
            <div className="text-sm text-gray-500">Points</div>
          </div>
          
          <div className="bg-white p-2 rounded-lg border">
            <QRCodeSVG 
              value={qrData}
              size={80}
              level="M"
              includeMargin={false}
            />
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Last activity: {new Date(card.lastActivity).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-3">{card.business.description}</p>
          <Button variant="outline" size="sm" className="w-full">
            View Business Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const getGradientForBusiness = (businessType: string): string => {
  const gradients = {
    'Restaurant': 'bg-gradient-to-br from-orange-500 to-red-500',
    'Retail': 'bg-gradient-to-br from-blue-500 to-indigo-500',
    'Cafe': 'bg-gradient-to-br from-amber-500 to-orange-500',
    'Fitness': 'bg-gradient-to-br from-green-500 to-teal-500',
    'Beauty': 'bg-gradient-to-br from-pink-500 to-purple-500',
    'Entertainment': 'bg-gradient-to-br from-purple-500 to-indigo-500',
    'Service': 'bg-gradient-to-br from-gray-500 to-slate-500',
  };
  
  return gradients[businessType as keyof typeof gradients] || 'bg-gradient-to-br from-purple-500 to-blue-500';
};

export default WebWalletCard;
