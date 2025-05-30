
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Download, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

interface PassKitWalletCardProps {
  card: WalletCard;
  customerId: string;
  customerName: string;
}

const PassKitWalletCard: React.FC<PassKitWalletCardProps> = ({ 
  card, 
  customerId, 
  customerName 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const generateAppleWalletPass = async () => {
    setIsGenerating(true);
    
    try {
      // PassKit.com API integration
      const passData = {
        templateId: 'your-template-id', // You'll need to get this from PassKit.com
        passData: {
          loyaltyCard: {
            primaryFields: [
              {
                key: "balance",
                label: t('wallet.points'),
                value: card.points.toString()
              }
            ],
            secondaryFields: [
              {
                key: "name",
                label: "MEMBER",
                value: customerName
              }
            ],
            auxiliaryFields: [
              {
                key: "business",
                label: "BUSINESS",
                value: card.business.name
              }
            ],
            backFields: [
              {
                key: "terms",
                label: "Terms and Conditions",
                value: `Welcome to ${card.business.name} loyalty program. ${card.business.description}`
              }
            ]
          },
          barcode: {
            message: JSON.stringify({
              customerId,
              businessId: card.business.id,
              type: "loyalty"
            }),
            format: "PKBarcodeFormatQR"
          }
        }
      };

      // For demo purposes, we'll simulate the PassKit API call
      // In production, you'd make an actual API call to PassKit.com
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create download link for the pass
      const passUrl = `https://pub1.pskt.io/c/demo-pass-${card.business.id}-${customerId}`;
      
      // Open the pass URL which would trigger Apple Wallet on iOS devices
      window.open(passUrl, '_blank');

      toast({
        title: t('appleWallet.success'),
        description: t('appleWallet.description'),
      });
    } catch (error) {
      console.error('PassKit error:', error);
      toast({
        title: t('appleWallet.error'),
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const gradientClass = getGradientForBusiness(card.business.business_type);

  return (
    <Card className={`overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${gradientClass}`}>
      <CardHeader className="text-white pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{card.business.name}</span>
          <Wallet className="w-6 h-6" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="bg-white space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{card.points}</div>
          <div className="text-sm text-gray-500">{t('wallet.points')}</div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>{t('wallet.lastActivity')}: {new Date(card.lastActivity).toLocaleDateString()}</p>
        </div>
        
        <Button
          onClick={generateAppleWalletPass}
          disabled={isGenerating}
          className="w-full bg-black hover:bg-gray-800 text-white"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('appleWallet.generating')}
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              {t('appleWallet.addToWallet')}
            </>
          )}
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          {t('appleWallet.description')}
        </p>
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

export default PassKitWalletCard;
