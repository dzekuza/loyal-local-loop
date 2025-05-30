
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Download, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface GoogleWalletCardProps {
  card: WalletCard;
  customerId: string;
}

const GoogleWalletCard: React.FC<GoogleWalletCardProps> = ({ card, customerId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateGoogleWalletPass = async () => {
    setIsGenerating(true);
    
    try {
      // Create Google Wallet pass object
      const passObject = {
        iss: "loyaltyapp@loyaltyplus.com",
        aud: "google",
        typ: "savetowallet",
        origins: [window.location.origin],
        payload: {
          loyaltyObjects: [{
            id: `${card.business.id}.${customerId}`,
            classId: `${card.business.id}.loyalty_class`,
            state: "active",
            heroImage: {
              sourceUri: {
                uri: card.business.logo || "https://via.placeholder.com/600x200"
              }
            },
            textModulesData: [{
              header: "Points Balance",
              body: `${card.points} points`,
              id: "points"
            }],
            linksModuleData: {
              uris: [{
                uri: `${window.location.origin}/business/${card.business.id}`,
                description: "Visit Business"
              }]
            },
            imageModulesData: [{
              mainImage: {
                sourceUri: {
                  uri: card.business.logo || "https://via.placeholder.com/100x100"
                }
              },
              id: "logo"
            }],
            barcode: {
              type: "QR_CODE",
              value: JSON.stringify({
                type: 'customer',
                customerId,
                businessId: card.business.id,
                timestamp: Date.now()
              }),
              alternateText: customerId.slice(0, 8)
            },
            locations: [{
              latitude: 37.7749,
              longitude: -122.4194
            }],
            accountId: customerId,
            accountName: "Loyalty Member",
            loyaltyPoints: {
              balance: {
                string: `${card.points} points`
              },
              label: "Points"
            }
          }],
          loyaltyClasses: [{
            id: `${card.business.id}.loyalty_class`,
            issuerName: card.business.name,
            programName: `${card.business.name} Loyalty`,
            programLogo: {
              sourceUri: {
                uri: card.business.logo || "https://via.placeholder.com/100x100"
              }
            },
            hexBackgroundColor: "#4285f4",
            heroImage: {
              sourceUri: {
                uri: card.business.logo || "https://via.placeholder.com/600x200"
              }
            }
          }]
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create Google Wallet save URL
      const jwt = btoa(JSON.stringify(passObject));
      const saveUrl = `https://pay.google.com/gp/v/save/${jwt}`;
      
      // Open Google Wallet save URL
      window.open(saveUrl, '_blank');

      toast({
        title: "Google Wallet Pass Ready! 📱",
        description: "Click the link to save your loyalty card to Google Wallet",
      });
    } catch (error) {
      console.error('Google Wallet pass generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate Google Wallet pass. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <CardTitle className="flex items-center justify-between">
          <span>{card.business.name}</span>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Google Wallet
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-green-600 mb-1">{card.points}</div>
          <div className="text-sm text-gray-500">Points Available</div>
        </div>
        
        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-600">{card.business.description}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Business Type</span>
            <span className="font-medium">{card.business.business_type}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last Activity</span>
            <span className="font-medium">{new Date(card.lastActivity).toLocaleDateString()}</span>
          </div>
        </div>
        
        <Button
          onClick={generateGoogleWalletPass}
          disabled={isGenerating}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Pass...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Save to Google Wallet
            </>
          )}
        </Button>
        
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <p>✓ Works on Android devices</p>
          <p>✓ Automatic updates</p>
          <p>✓ Location-based notifications</p>
          <p>✓ No developer account needed</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleWalletCard;
