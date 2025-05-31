
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { QrCode } from 'lucide-react';

interface CustomerQRCodeProps {
  customerId: string;
  customerName: string;
}

const CustomerQRCode: React.FC<CustomerQRCodeProps> = ({ customerId, customerName }) => {
  // Generate QR code data with customer information in a standardized format
  const qrData = JSON.stringify({
    type: 'customer',
    customerId,
    customerName,
    timestamp: Date.now(),
    version: '1.0'
  });

  console.log('Generated customer QR data:', qrData);

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <QrCode className="w-5 h-5" />
          <span>Your Loyalty QR Code</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Show this to businesses to earn points</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 shadow-sm">
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
          <p className="font-medium text-lg">{customerName}</p>
          <p className="text-xs text-gray-500 mt-1">Customer ID: {customerId.slice(0, 8)}...</p>
        </div>
        <div className="text-xs text-gray-500 text-center bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="font-medium text-blue-800 mb-1">📱 How to use:</p>
          <ol className="text-left space-y-1 text-blue-700">
            <li>1. Join a business's loyalty program</li>
            <li>2. Show this QR code when making purchases</li>
            <li>3. Earn points automatically!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerQRCode;
