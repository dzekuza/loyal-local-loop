
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { QrCode, Download, Copy } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface QRGeneratorProps {
  businessId: string;
  businessName: string;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ businessId, businessName }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Generate QR code URL that points to business profile page
    const businessProfileUrl = `${window.location.origin}/business/${businessId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(businessProfileUrl)}`;
    setQrCodeUrl(qrUrl);
    console.log('🏢 Generated business profile QR URL:', businessProfileUrl);
  }, [businessId]);

  const handleCopyQR = async () => {
    const businessProfileUrl = `${window.location.origin}/business/${businessId}`;
    await navigator.clipboard.writeText(businessProfileUrl);
    toast({
      title: "Business Profile URL Copied",
      description: "Your business profile URL has been copied to clipboard.",
    });
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${businessName}-profile-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="qr-generator-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="w-5 h-5" />
          <span>Your Business QR Code</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="qr-code-container bg-white p-4 rounded-lg border-2 border-dashed border-gray-200 inline-block">
          {qrCodeUrl && (
            <img 
              src={qrCodeUrl} 
              alt="Business Profile QR Code"
              className="qr-code-image w-48 h-48 mx-auto"
            />
          )}
        </div>
        
        <p className="text-sm text-gray-600">
          Customers scan this code to view your business profile and join your loyalty program
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyQR}
            className="btn-copy-qr"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Profile URL
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadQR}
            className="btn-download-qr bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRGenerator;
