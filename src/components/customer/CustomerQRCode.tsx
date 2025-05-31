
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { QrCode, Star } from 'lucide-react';

interface CustomerQRCodeProps {
  customerId: string;
  customerName: string;
}

const CustomerQRCode: React.FC<CustomerQRCodeProps> = ({ customerId, customerName }) => {
  // Standardized QR code data format for consistency
  const qrData = JSON.stringify({
    type: 'customer',
    customerId,
    customerName,
    timestamp: Date.now(),
    version: '1.0'
  });

  console.log('🎯 Generated customer QR data:', qrData);

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
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <p className="font-medium text-lg text-gray-800">{customerName}</p>
          </div>
          <p className="text-xs text-gray-500">Customer ID: {customerId.slice(0, 8)}...</p>
        </div>
        
        <div className="text-xs text-center bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 w-full">
          <p className="font-medium text-blue-800 mb-2">📱 How to use your QR code:</p>
          <ol className="text-left space-y-1 text-blue-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Join a business's loyalty program</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Show this QR code when making purchases</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Earn points automatically! 🎉</span>
            </li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 w-full">
          <p className="text-xs text-yellow-800 text-center">
            💡 <strong>Tip:</strong> Save this QR code to your photos for quick access
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerQRCode;
