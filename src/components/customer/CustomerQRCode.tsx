
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { QrCode } from 'lucide-react';
import CustomerCodeDisplay from './CustomerCodeDisplay';

interface CustomerQRCodeProps {
  customerId: string;
  customerName: string;
}

const CustomerQRCode: React.FC<CustomerQRCodeProps> = ({ customerId, customerName }) => {
  // Standardized QR code data format for consistency across the app
  const qrData = JSON.stringify({
    type: 'customer',
    customerId,
    customerName,
    timestamp: Date.now(),
    version: '1.0'
  });

  console.log('🎯 Generated standardized customer QR data:', qrData);

  return (
    <div className="space-y-6">
      {/* Customer Code Display */}
      <CustomerCodeDisplay
        customerId={customerId}
        customerName={customerName}
        showInstructions={true}
      />

      {/* QR Code Card */}
      <Card className="w-full max-w-sm mx-auto shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-blue-600 text-white">
          <CardTitle className="flex items-center justify-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>QR Code Alternative</span>
          </CardTitle>
          <p className="text-sm text-purple-100">Alternative way to share your info</p>
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
          
          <div className="text-xs text-center bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 w-full">
            <p className="text-blue-800">
              💡 <strong>Tip:</strong> Your customer code above is easier to use than scanning QR codes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerQRCode;
