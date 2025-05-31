
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../ui/button';
import { QrCode, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BusinessQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  businessId: string;
  businessName: string;
  businessLogo?: string;
}

const BusinessQRModal: React.FC<BusinessQRModalProps> = ({
  isOpen,
  onClose,
  customerId,
  businessId,
  businessName,
  businessLogo
}) => {
  const { t } = useTranslation();

  // Generate business-specific QR code data
  const qrData = JSON.stringify({
    type: 'customer_business',
    customerId,
    businessId,
    businessName,
    timestamp: Date.now()
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <QrCode className="w-5 h-5" />
              <span>Your QR Code</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            {businessLogo && (
              <img 
                src={businessLogo} 
                alt={businessName}
                className="w-8 h-8 object-cover rounded"
              />
            )}
            <h3 className="font-semibold">{businessName}</h3>
          </div>
          
          <div className="bg-white p-4 rounded-lg border inline-block">
            <QRCodeSVG 
              value={qrData}
              size={200}
              level="M"
              includeMargin={true}
            />
          </div>
          
          <p className="text-sm text-gray-600">
            Show this QR code to earn points at {businessName}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessQRModal;
