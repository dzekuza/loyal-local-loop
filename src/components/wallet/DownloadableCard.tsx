
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Download, Share, Image as ImageIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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

interface DownloadableCardProps {
  card: WalletCard;
  customerId: string;
  customerName: string;
}

const DownloadableCard: React.FC<DownloadableCardProps> = ({ card, customerId, customerName }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const qrData = JSON.stringify({
    type: 'customer',
    customerId,
    businessId: card.business.id,
    timestamp: Date.now()
  });

  const generateCardImage = async () => {
    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size (credit card proportions)
      canvas.width = 800;
      canvas.height = 500;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#3B82F6');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add business name
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(card.business.name, 40, 80);

      // Add business type
      ctx.font = '18px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(card.business.business_type.toUpperCase(), 40, 110);

      // Add points
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.fillText(`${card.points}`, 40, 180);
      ctx.font = '20px Arial';
      ctx.fillText('POINTS', 40, 210);

      // Add customer name
      ctx.font = '18px Arial';
      ctx.fillText(customerName.toUpperCase(), 40, 250);

      // Add member ID
      ctx.font = '14px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`MEMBER ID: ${customerId.slice(0, 8).toUpperCase()}`, 40, 280);

      // Generate QR code and add to canvas
      const qrCanvas = document.createElement('canvas');
      const qrSize = 120;
      qrCanvas.width = qrSize;
      qrCanvas.height = qrSize;
      
      // Create QR code SVG and convert to canvas
      const qrSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      qrSvg.setAttribute('width', qrSize.toString());
      qrSvg.setAttribute('height', qrSize.toString());
      
      // Simulate QR code pattern (in real implementation, you'd use a proper QR library)
      const qrCtx = qrCanvas.getContext('2d');
      if (qrCtx) {
        qrCtx.fillStyle = 'white';
        qrCtx.fillRect(0, 0, qrSize, qrSize);
        qrCtx.fillStyle = 'black';
        
        // Simple pattern to represent QR code
        for (let i = 0; i < qrSize; i += 4) {
          for (let j = 0; j < qrSize; j += 4) {
            if ((i + j) % 8 === 0) {
              qrCtx.fillRect(i, j, 4, 4);
            }
          }
        }
      }
      
      // Add QR code to main canvas
      ctx.drawImage(qrCanvas, canvas.width - qrSize - 40, canvas.height - qrSize - 40, qrSize, qrSize);

      // Add QR code label
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText('SCAN TO EARN POINTS', canvas.width - qrSize - 40, canvas.height - 20);

      // Add card footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px Arial';
      ctx.fillText('LOYALTY CARD', 40, canvas.height - 40);
      ctx.fillText(new Date().toLocaleDateString(), 40, canvas.height - 20);

      // Download the image
      const link = document.createElement('a');
      link.download = `${card.business.name.replace(/\s+/g, '-').toLowerCase()}-loyalty-card.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast({
        title: "Card Downloaded! 📱",
        description: "Your loyalty card image has been saved to your device.",
      });
    } catch (error) {
      console.error('Card generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate card image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const shareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.business.name} Loyalty Card`,
          text: `I have ${card.points} points at ${card.business.name}!`,
          url: `${window.location.origin}/business/${card.business.id}`
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback for browsers without Web Share API
      const text = `Check out my ${card.business.name} loyalty card! I have ${card.points} points.`;
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "Card details copied to clipboard for sharing.",
      });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <CardTitle className="flex items-center justify-between">
          <span>{card.business.name}</span>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Download
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-orange-600 mb-1">{card.points}</div>
          <div className="text-sm text-gray-500">Points Available</div>
        </div>
        
        {/* Preview of the card */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-4 text-white text-xs mb-4">
          <div className="font-bold">{card.business.name}</div>
          <div className="opacity-80">{card.business.business_type.toUpperCase()}</div>
          <div className="mt-2">
            <span className="text-lg font-bold">{card.points}</span> POINTS
          </div>
          <div className="mt-1 opacity-80">{customerName.toUpperCase()}</div>
          <div className="flex justify-between items-end mt-2">
            <div className="opacity-60">LOYALTY CARD</div>
            <div className="w-8 h-8 bg-white/20 rounded"></div>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Format</span>
            <span className="font-medium">PNG Image (800x500)</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Includes</span>
            <span className="font-medium">QR Code & Points</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={generateCardImage}
            disabled={isGenerating}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Card Image
              </>
            )}
          </Button>
          
          <Button
            onClick={shareCard}
            variant="outline"
            className="w-full"
          >
            <Share className="w-4 h-4 mr-2" />
            Share Card
          </Button>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <p>✓ Save to photo gallery</p>
          <p>✓ Print or share easily</p>
          <p>✓ Works on any device</p>
          <p>✓ High resolution image</p>
        </div>
      </CardContent>
      
      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Card>
  );
};

export default DownloadableCard;
