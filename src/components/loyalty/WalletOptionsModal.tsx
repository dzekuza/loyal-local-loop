
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Wallet, X, Smartphone, Globe, Apple } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WalletOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  customerId: string;
  businessId: string;
}

const WalletOptionsModal: React.FC<WalletOptionsModalProps> = ({
  isOpen,
  onClose,
  businessName,
  customerId,
  businessId
}) => {
  const { t } = useTranslation();

  const handleWebWallet = () => {
    // Open current page in new window for web wallet view
    window.open(`/my-cards?business=${businessId}`, '_blank');
  };

  const handlePWAInstall = () => {
    // Trigger PWA install prompt if available
    if ('serviceWorker' in navigator) {
      // PWA install logic
      console.log('PWA install requested');
    }
  };

  const handleGoogleWallet = () => {
    // Generate Google Wallet pass URL
    const passData = {
      businessName,
      customerId,
      businessId
    };
    console.log('Google Wallet integration:', passData);
  };

  const handleAppleWallet = () => {
    // Generate Apple Wallet pass
    const passData = {
      businessName,
      customerId,
      businessId
    };
    console.log('Apple Wallet integration:', passData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Add to Wallet</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Choose how you'd like to save your {businessName} loyalty card:
          </p>
          
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleWebWallet}
          >
            <Globe className="w-4 h-4 mr-3" />
            Web Wallet
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handlePWAInstall}
          >
            <Smartphone className="w-4 h-4 mr-3" />
            Install as App (PWA)
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleGoogleWallet}
          >
            <Wallet className="w-4 h-4 mr-3" />
            Google Wallet
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleAppleWallet}
          >
            <Apple className="w-4 h-4 mr-3" />
            Apple Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletOptionsModal;
