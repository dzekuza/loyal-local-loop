
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { Wallet, Download } from 'lucide-react';
import { Business } from '../../types';

interface AppleWalletButtonProps {
  business: Business;
  customerId?: string;
}

const AppleWalletButton: React.FC<AppleWalletButtonProps> = ({ 
  business, 
  customerId = 'guest' 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateWalletPass = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate wallet pass generation
      // In production, this would call your backend API
      const passData = {
        businessId: business.id,
        businessName: business.name,
        customerId,
        passTypeIdentifier: `pass.loyaltyplus.${business.id}`,
        serialNumber: `${customerId}-${business.id}-${Date.now()}`,
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would download the actual .pkpass file
      const blob = new Blob([JSON.stringify(passData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${business.name}-loyalty-card.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Wallet Pass Generated",
        description: "Your loyalty card has been generated. In production, this would add to Apple Wallet.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate wallet pass. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateWalletPass}
      disabled={isGenerating}
      className="btn-apple-wallet w-full bg-black hover:bg-gray-800 text-white"
      size="lg"
    >
      {isGenerating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Generating Pass...
        </>
      ) : (
        <>
          <Wallet className="w-5 h-5 mr-2" />
          Add to Apple Wallet
        </>
      )}
    </Button>
  );
};

export default AppleWalletButton;
