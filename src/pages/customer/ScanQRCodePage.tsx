
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerQRCode from '@/components/customer/CustomerQRCode';
import QRCodeScanner from '@/components/qr/QRCodeScanner';
import { QrCode, ArrowLeft, Award } from 'lucide-react';

const ScanQRCodePage: React.FC = () => {
  const { user } = useAuth();
  const { userRole, currentBusiness } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (result: string) => {
    console.log('QR Code scanned:', result);
    setScanResult(result);

    if (userRole === 'business' && currentBusiness) {
      await processBusinessScan(result);
    } else {
      toast({
        title: 'QR Code Scanned',
        description: result,
      });
    }
  };

  const processBusinessScan = async (customerData: string) => {
    if (!currentBusiness || !user) return;

    setIsProcessing(true);
    try {
      // Parse customer data
      let parsedData;
      try {
        parsedData = JSON.parse(customerData);
      } catch {
        // If not JSON, treat as plain customer ID
        parsedData = {
          type: 'customer',
          customerId: customerData,
          customerName: 'Customer'
        };
      }

      if (parsedData.type !== 'customer' || !parsedData.customerId) {
        throw new Error('Invalid customer QR code format');
      }
      
      const customerId = parsedData.customerId;
      const customerName = parsedData.customerName || 'Unknown Customer';
      
      // For demo, let's award 10 points for a $10 purchase
      const pointsToAward = 10;
      const amountSpent = 10.00;

      // Get active loyalty offer for calculation
      const { data: offers, error: offersError } = await supabase
        .from('loyalty_offers')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .eq('is_active', true)
        .limit(1);

      if (offersError) {
        throw new Error('Failed to fetch loyalty offers');
      }

      if (!offers || offers.length === 0) {
        throw new Error('No active loyalty offers found. Please create an offer first.');
      }

      const offer = offers[0];
      const calculatedPoints = Math.floor((amountSpent / offer.spend_amount) * offer.points_earned);

      // Ensure user_points record exists
      const { data: existingPoints, error: pointsCheckError } = await supabase
        .from('user_points')
        .select('*')
        .eq('customer_id', customerId)
        .eq('business_id', currentBusiness.id)
        .single();

      if (pointsCheckError && pointsCheckError.code === 'PGRST116') {
        // Create user_points record if it doesn't exist
        const { error: createPointsError } = await supabase
          .from('user_points')
          .insert({
            customer_id: customerId,
            business_id: currentBusiness.id,
            total_points: 0
          });

        if (createPointsError) {
          throw new Error('Failed to initialize customer points record');
        }
      }

      // Create point transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          customer_id: customerId,
          business_id: currentBusiness.id,
          amount_spent: amountSpent,
          points_earned: calculatedPoints,
          processed_by: user.id,
        })
        .select()
        .single();

      if (transactionError) {
        throw transactionError;
      }

      toast({
        title: "Points Awarded! 🎉",
        description: `Successfully awarded ${calculatedPoints} points to ${customerName}`,
      });

      setScanResult(null);
    } catch (error) {
      console.error('Error processing scan:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to award points. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
                  <Award className="w-6 h-6" />
                  <span>Award Points</span>
                </h1>
                <p className="text-gray-600">
                  Scan customer QR codes to award loyalty points
                </p>
              </div>

              <QRCodeScanner 
                onScan={handleScan}
                title="Scan Customer QR Code"
              />

              {scanResult && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Scanned:</p>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{scanResult}</p>
                      {isProcessing && (
                        <p className="text-sm text-purple-600 mt-2">Processing transaction...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            // Fallback for other cases
            <div className="text-center">
              <QRCodeScanner 
                onScan={handleScan}
                title="QR Code Scanner"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanQRCodePage;
