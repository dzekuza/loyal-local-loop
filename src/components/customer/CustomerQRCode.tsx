
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { QrCode, Star, Copy, Check } from 'lucide-react';
import { generateCustomerCode } from '@/utils/customerCodes';
import { useToast } from '@/hooks/use-toast';

interface CustomerQRCodeProps {
  customerId: string;
  customerName: string;
}

const CustomerQRCode: React.FC<CustomerQRCodeProps> = ({ customerId, customerName }) => {
  const [codeCopied, setCodeCopied] = useState(false);
  const { toast } = useToast();

  // Generate unique customer code
  const customerCode = generateCustomerCode(customerId);

  // Standardized QR code data format for consistency across the app
  const qrData = JSON.stringify({
    type: 'customer',
    customerId,
    customerName,
    timestamp: Date.now(),
    version: '1.0'
  });

  console.log('🎯 Generated standardized customer QR data:', qrData);
  console.log('🔢 Generated customer code:', customerCode);

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
    <Card className="w-full max-w-sm mx-auto shadow-lg">
      <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardTitle className="flex items-center justify-center space-x-2">
          <QrCode className="w-5 h-5" />
          <span>Your Loyalty QR Code</span>
        </CardTitle>
        <p className="text-sm text-purple-100">Show this to businesses to earn points</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 pt-6">
        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 shadow-inner">
          <QRCodeSVG 
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>
        
        {/* Customer Code Display - PROMINENT */}
        <div className="w-full bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-300">
          <p className="text-lg font-bold text-green-800 text-center mb-2">
            📱 Your Customer Code
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-white px-6 py-3 rounded-md border-2 border-gray-400 font-mono text-2xl font-bold text-gray-800 tracking-widest shadow-md">
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
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <p className="font-medium text-lg text-gray-800">{customerName}</p>
          </div>
          <p className="text-xs text-gray-500">Customer ID: {customerId.slice(0, 8)}...</p>
        </div>
        
        <div className="text-xs text-center bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 w-full">
          <p className="font-medium text-blue-800 mb-2">📱 How to use your loyalty card:</p>
          <ol className="text-left space-y-1 text-blue-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Join a business's loyalty program</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Show your QR code OR share your customer code</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Earn points automatically! 🎉</span>
            </li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 w-full">
          <p className="text-xs text-yellow-800 text-center">
            💡 <strong>Tip:</strong> Save this QR code and code to your photos for quick access
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerQRCode;
