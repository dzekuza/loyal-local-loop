
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../ui/button';
import { QrCode, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { generateCustomerCode } from '@/utils/customerCodes';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

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
  const { toast } = useToast();
  const [codeCopied, setCodeCopied] = useState(false);

  // Generate customer code for this business interaction
  const customerCode = generateCustomerCode(customerId);

  // Generate business-specific QR code data with customer information
  const qrData = JSON.stringify({
    type: 'customer',
    customerId,
    businessId,
    businessName,
    customerCode,
    timestamp: Date.now()
  });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(customerCode);
      setCodeCopied(true);
      toast({
        title: "Code Copied! 📋",
        description: "Your customer code has been copied to clipboard",
      });
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Your Loyalty Code</span>
          </DialogTitle>
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

          {/* Customer Code Display - PROMINENT */}
          <div className="w-full bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-300">
            <p className="text-lg font-bold text-green-800 text-center mb-2">
              📱 Your Customer Code
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="bg-white px-4 py-2 rounded-md border-2 border-gray-400 font-mono text-xl font-bold text-gray-800 tracking-widest shadow-md">
                {customerCode}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="flex items-center space-x-1"
              >
                {codeCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-green-700 text-center mt-2 font-medium">
              💡 Share this code if QR scanning doesn't work
            </p>
          </div>
          
          <p className="text-sm text-gray-600">
            Show this QR code or tell your customer code to earn points at {businessName}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessQRModal;
