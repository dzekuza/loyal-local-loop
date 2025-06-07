
import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Building2 } from 'lucide-react';
import { ComingSoonBusiness } from '@/types/comingSoon';
import BusinessClaimModal from './BusinessClaimModal';

interface ComingSoonBusinessCardProps {
  business: ComingSoonBusiness;
}

const ComingSoonBusinessCard: React.FC<ComingSoonBusinessCardProps> = ({ business }) => {
  const [showClaimModal, setShowClaimModal] = useState(false);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
        {/* Business Cover/Logo */}
        <div className="h-40 bg-gradient-to-br from-gray-400 to-gray-600 relative">
          {business.logo ? (
            <img 
              src={business.logo} 
              alt={`${business.business_name} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
              <Building2 className="w-12 h-12 text-white" />
            </div>
          )}
          
          {/* Coming Soon Badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1">
              Coming Soon
            </Badge>
          </div>
          
          {/* Business Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/40">
            <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">
              {business.business_name}
            </h3>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
              {business.business_type}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {business.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 break-words">
              {business.description}
            </p>
          )}
          
          <Button 
            onClick={() => setShowClaimModal(true)}
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            Own this business?
          </Button>
        </CardContent>
      </Card>

      <BusinessClaimModal
        business={business}
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
      />
    </>
  );
};

export default ComingSoonBusinessCard;
