
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { QrCode } from 'lucide-react';

interface CustomerQRCodeProps {
  customerId: string;
  customerName: string;
}

const CustomerQRCode: React.FC<CustomerQRCodeProps> = ({ customerId, customerName }) => {
  // Generate QR code data with customer information in the format businesses expect
  const qrData = JSON.stringify({
    type: 'customer',
    customerId,
    customerName,
    timestamp: Date.now()
  });

  console.log('Generated customer QR data:', qrData);

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <QrCode className="w-5 h-5" />
          <span>Your QR Code</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Show this to businesses to earn points</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-lg border">
          <QRCodeSVG 
            value={qrData}
            size={200}
            level="M"
            includeMargin={true}
          />
        </div>
        <div className="text-center">
          <p className="font-medium">{customerName}</p>
          <p className="text-xs text-gray-500">Customer ID: {customerId.slice(0, 8)}...</p>
        </div>
        <div className="text-xs text-gray-500 text-center bg-blue-50 p-2 rounded">
          <p>💡 Make sure to join a business's loyalty program first, then show this QR code when making purchases to earn points!</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerQRCode;
