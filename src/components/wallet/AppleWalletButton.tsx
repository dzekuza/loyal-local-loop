
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { Wallet, Download, ExternalLink } from 'lucide-react';
import { Business } from '../../types';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleWalletOptions = () => {
    toast({
      title: "Multiple Wallet Options Available! 🎉",
      description: "Visit your wallet to see all free alternatives to Apple Wallet.",
    });
    navigate('/wallet');
  };

  const generateWalletPass = async () => {
    setIsGenerating(true);
    
    try {
      // Create a more realistic wallet pass structure
      const passData = {
        formatVersion: 1,
        passTypeIdentifier: `pass.loyaltyplus.${business.id}`,
        serialNumber: `${customerId}-${business.id}-${Date.now()}`,
        teamIdentifier: "LOYALTYPLUS",
        webServiceURL: "https://loyaltyplus.app/passes/",
        authenticationToken: "vxwxd7J8AlNNFPS8k0a0FfUFtq0ewzFdc",
        organizationName: business.name,
        description: `${business.name} Loyalty Card`,
        logoText: business.name,
        foregroundColor: "rgb(255, 255, 255)",
        backgroundColor: "rgb(147, 51, 234)",
        storeCard: {
          primaryFields: [
            {
              key: "balance",
              label: "POINTS",
              value: "0"
            }
          ],
          secondaryFields: [
            {
              key: "name",
              label: "MEMBER",
              value: "Loyalty Member"
            }
          ],
          auxiliaryFields: [
            {
              key: "level",
              label: "LEVEL",
              value: "Member"
            }
          ],
          backFields: [
            {
              key: "terms",
              label: "Terms and Conditions",
              value: `Welcome to ${business.name} loyalty program. Earn points with every purchase and redeem for exciting rewards!`
            },
            {
              key: "customer-service",
              label: "Customer Service",
              value: business.email
            }
          ]
        },
        barcode: {
          message: JSON.stringify({
            customerId,
            businessId: business.id,
            type: "loyalty"
          }),
          format: "PKBarcodeFormatQR",
          messageEncoding: "iso-8859-1"
        },
        barcodes: [
          {
            message: JSON.stringify({
              customerId,
              businessId: business.id,
              type: "loyalty"
            }),
            format: "PKBarcodeFormatQR",
            messageEncoding: "iso-8859-1"
          }
        ]
      };

      // Simulate API delay for generating the pass
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a more realistic filename and content
      const passContent = JSON.stringify(passData, null, 2);
      const blob = new Blob([passContent], { 
        type: 'application/vnd.apple.pkpass' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${business.name.replace(/\s+/g, '-').toLowerCase()}-loyalty-card.pkpass`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Demo Pass Downloaded! 📱",
        description: "This is a demo file. For working Apple Wallet passes, you need a paid Apple Developer account ($99/year).",
      });
    } catch (error) {
      console.error('Wallet pass generation error:', error);
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
    <div className="space-y-2">
      <Button
        onClick={handleWalletOptions}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        size="lg"
      >
        <Wallet className="w-5 h-5 mr-2" />
        View Wallet Options (Free!)
      </Button>
      
      <Button
        onClick={generateWalletPass}
        disabled={isGenerating}
        variant="outline"
        className="w-full"
        size="sm"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            Generating Demo...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Apple Wallet (Demo)
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        💡 Free alternatives available in wallet page!
      </p>
    </div>
  );
};

export default AppleWalletButton;
