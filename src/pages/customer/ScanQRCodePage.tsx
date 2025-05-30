
import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerQRCode from '@/components/customer/CustomerQRCode';
import PointCollection from '@/components/business/PointCollection';
import { QrCode, ArrowLeft } from 'lucide-react';

const ScanQRCodePage: React.FC = () => {
  const { user } = useAuth();
  const { userRole, currentBusiness } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = (data: any) => {
    if (data && data.text) {
      setScanResult(data.text);
      toast({
        title: 'QR Code Scanned',
        description: data.text,
      });
    }
  };

  const handleError = (err: any) => {
    setError('Camera error: ' + err?.message || 'Unknown error');
    toast({
      title: 'Camera Error',
      description: err?.message || 'Unknown error',
      variant: 'destructive',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access this page</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </div>

          {userRole === 'customer' ? (
            // Customer view - show their QR code
            <div className="space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <QrCode className="w-6 h-6" />
                    <span>Your Loyalty QR Code</span>
                  </CardTitle>
                  <p className="text-gray-600">
                    Show this QR code to businesses when making purchases to earn points
                  </p>
                </CardHeader>
                <CardContent>
                  <CustomerQRCode 
                    customerId={user.id}
                    customerName={user.email || 'Customer'}
                  />
                </CardContent>
              </Card>

              <div className="text-center text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-800 mb-2">How to use your QR code:</p>
                <ol className="text-left space-y-1 text-blue-700">
                  <li>1. Join a business's loyalty program first</li>
                  <li>2. Make a purchase at the business</li>
                  <li>3. Show this QR code to the cashier</li>
                  <li>4. They'll scan it and award you points!</li>
                </ol>
              </div>
            </div>
          ) : userRole === 'business' && currentBusiness ? (
            // Business view - point collection interface
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Point Collection</h1>
                <p className="text-gray-600">
                  Scan customer QR codes and award points for purchases
                </p>
              </div>

              <PointCollection 
                businessId={currentBusiness.id}
                businessName={currentBusiness.name}
                onScanSuccess={() => {
                  toast({
                    title: "Success!",
                    description: "Points awarded successfully",
                  });
                }}
              />
            </div>
          ) : (
            // Fallback for other cases
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 flex flex-col items-center mx-auto">
              <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
              <div className="w-full flex flex-col items-center mb-4">
                <QrScanner
                  delay={300}
                  style={{ width: '100%' }}
                  onError={handleError}
                  onScan={handleScan}
                />
              </div>
              {scanResult && (
                <div className="mb-4 text-green-600 font-semibold">Result: {scanResult}</div>
              )}
              {error && (
                <div className="mb-4 text-red-600 font-semibold">{error}</div>
              )}
              <Button onClick={() => navigate(-1)} variant="outline">Back</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanQRCodePage;
