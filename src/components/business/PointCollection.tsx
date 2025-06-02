import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { Scan, DollarSign, Gift, CheckCircle, X, Keyboard } from 'lucide-react';
import QRCodeScanner from '../qr/QRCodeScanner';
import ManualCodeEntry from './ManualCodeEntry';

interface PointCollectionProps {
  businessId: string;
  businessName: string;
  onScanSuccess?: () => void;
}

interface CustomerData {
  customerId: string;
  customerName: string;
}

type ScanMode = 'selection' | 'qr' | 'manual';

const PointCollection: React.FC<PointCollectionProps> = ({ 
  businessId, 
  businessName, 
  onScanSuccess 
}) => {
  const [scannedCustomer, setScannedCustomer] = useState<CustomerData | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('selection');
  const { toast } = useToast();

  const parseQRData = (data: string) => {
    console.log('🔍 PointCollection - Raw QR data received:', data);
    
    // Try to parse as JSON first
    try {
      const qrData = JSON.parse(data);
      console.log('📋 PointCollection - Parsed QR JSON:', qrData);
      
      // Handle standardized customer format
      if (qrData.type === 'customer' && qrData.customerId) {
        return {
          customerId: qrData.customerId,
          customerName: qrData.customerName || 'Customer'
        };
      }
      
      // Handle legacy customer_business format (backward compatibility)
      if (qrData.type === 'customer_business' && qrData.customerId) {
        console.log('⚠️ PointCollection - Legacy QR format detected, converting...');
        return {
          customerId: qrData.customerId,
          customerName: qrData.customerName || qrData['business Name'] || 'Customer'
        };
      }
      
      // Handle any other format that has customerId
      if (qrData.customerId) {
        console.log('🔄 PointCollection - Converting unknown QR format with customerId');
        return {
          customerId: qrData.customerId,
          customerName: qrData.customerName || qrData.name || 'Customer'
        };
      }
      
      console.warn('⚠️ PointCollection - QR data missing customerId:', qrData);
      return null;
      
    } catch (parseError) {
      console.log('📝 PointCollection - Not JSON, checking if it\'s a plain customer ID or timestamp...');
      
      // Handle plain timestamp (legacy format)
      if (/^\d+$/.test(data)) {
        console.warn('⚠️ PointCollection - Timestamp-only QR code detected:', data);
        return null;
      }
      
      // Handle plain UUID (treat as customer ID)
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data)) {
        console.log('🆔 PointCollection - Plain UUID detected, treating as customer ID');
        return {
          customerId: data,
          customerName: 'Customer'
        };
      }
      
      console.error('❌ PointCollection - Unable to parse QR data:', data);
      return null;
    }
  };

  const handleQRScan = async (data: string) => {
    const customerData = parseQRData(data);
    
    if (customerData) {
      console.log('✅ PointCollection - Customer data extracted:', customerData);
      
      // Check if customer is enrolled in this business's loyalty program
      try {
        const { data: enrollment, error } = await supabase
          .from('user_points')
          .select('customer_id, total_points')
          .eq('customer_id', customerData.customerId)
          .eq('business_id', businessId)
          .single();

        if (error && error.code === 'PGRST116') {
          toast({
            title: "Customer Not Enrolled",
            description: `${customerData.customerName} is not enrolled in ${businessName}'s loyalty program. Ask them to join first.`,
            variant: "destructive",
          });
          return;
        }

        if (error) {
          console.error('❌ PointCollection - Error checking enrollment:', error);
          toast({
            title: "Error",
            description: "Failed to verify customer enrollment. Please try again.",
            variant: "destructive",
          });
          return;
        }

        console.log('✅ PointCollection - Customer is enrolled:', enrollment);
        setScannedCustomer(customerData);
        setScanMode('selection');
        
        toast({
          title: "Customer Scanned Successfully! ✅",
          description: `${customerData.customerName} is enrolled and ready to earn points`,
        });
      } catch (error) {
        console.error('❌ PointCollection - Error verifying enrollment:', error);
        toast({
          title: "Error",
          description: "Failed to verify customer. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      console.error('❌ PointCollection - Failed to extract customer data from QR code');
      toast({
        title: "Invalid QR Code",
        description: "Please scan a valid customer loyalty QR code or ask the customer to regenerate their code.",
        variant: "destructive",
      });
    }
  };

  const handleManualCustomerFound = (customerId: string, customerName: string) => {
    console.log('📝 PointCollection - Manual customer found and verified:', { customerId, customerName, businessId });
    setScannedCustomer({
      customerId,
      customerName
    });
    setScanMode('selection');
  };

  const ensureUserPointsRecord = async (customerId: string, businessId: string) => {
    try {
      // Check if user_points record exists
      const { data: existingPoints, error: fetchError } = await supabase
        .from('user_points')
        .select('*')
        .eq('customer_id', customerId)
        .eq('business_id', businessId)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Record doesn't exist, create it
        const { error: insertError } = await supabase
          .from('user_points')
          .insert({
            customer_id: customerId,
            business_id: businessId,
            total_points: 0
          });

        if (insertError) {
          console.error('Error creating user_points record:', insertError);
          throw new Error(`Failed to initialize customer points: ${insertError.message}`);
        }
      } else if (fetchError) {
        console.error('Error checking user_points:', fetchError);
        throw new Error(`Failed to check customer points: ${fetchError.message}`);
      }
    } catch (error) {
      console.error('Error in ensureUserPointsRecord:', error);
      throw error;
    }
  };

  const handleAwardPoints = async () => {
    if (!scannedCustomer || !amount) {
      toast({
        title: "Missing Information",
        description: "Please scan a customer and enter an amount",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const spendAmount = parseFloat(amount);
      if (isNaN(spendAmount) || spendAmount <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }

      // Get the active loyalty offer for this business
      const { data: offers, error: offersError } = await supabase
        .from('loyalty_offers')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .limit(1);

      if (offersError) {
        console.error('Error fetching offers:', offersError);
        throw new Error('Failed to fetch loyalty offers');
      }

      if (!offers || offers.length === 0) {
        throw new Error('No active loyalty offers found for this business. Please create an offer first.');
      }

      const offer = offers[0];
      
      // Calculate points based on the offer
      const pointsEarned = Math.floor((spendAmount / offer.spend_amount) * offer.points_earned);

      if (pointsEarned === 0) {
        toast({
          title: "No Points Earned",
          description: `Minimum spend of $${offer.spend_amount} required to earn points`,
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      // Get current user for processed_by field
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to award points');
      }

      // Ensure user_points record exists
      await ensureUserPointsRecord(scannedCustomer.customerId, businessId);

      // Create point transaction
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          customer_id: scannedCustomer.customerId,
          business_id: businessId,
          amount_spent: spendAmount,
          points_earned: pointsEarned,
          processed_by: user.id
        });

      if (transactionError) {
        console.error('Transaction error:', transactionError);
        throw new Error(`Failed to record point transaction: ${transactionError.message}`);
      }

      toast({
        title: "Points Awarded! 🎉",
        description: `${scannedCustomer.customerName} earned ${pointsEarned} points for spending $${spendAmount}`,
      });

      // Reset form
      setScannedCustomer(null);
      setAmount('');
      setScanMode('selection');
      onScanSuccess?.();

    } catch (error) {
      console.error('Error awarding points:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to award points",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scan className="w-5 h-5" />
            <span>Award Points</span>
          </CardTitle>
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
            <strong>{businessName}</strong> - Only enrolled customers can earn points
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {scanMode === 'selection' && !scannedCustomer ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center mb-4">
                Choose how to identify the customer:
              </p>
              <Button 
                onClick={() => setScanMode('qr')}
                className="w-full"
                size="lg"
              >
                <Scan className="w-5 h-5 mr-2" />
                Scan QR Code
              </Button>
              <Button 
                onClick={() => setScanMode('manual')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Keyboard className="w-5 h-5 mr-2" />
                Enter Customer Code
              </Button>
            </div>
          ) : scanMode === 'qr' && !scannedCustomer ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Point the camera at the customer's QR code
                </p>
              </div>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">QR Scanner would be here</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setScanMode('selection')}
                className="w-full"
              >
                Back to Options
              </Button>
            </div>
          ) : scanMode === 'manual' && !scannedCustomer ? (
            <div>
              <ManualCodeEntry
                businessId={businessId}
                businessName={businessName}
                onCustomerFound={handleManualCustomerFound}
                onCancel={() => setScanMode('selection')}
              />
            </div>
          ) : scannedCustomer ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Customer Found</span>
                </div>
                <p className="text-green-700">{scannedCustomer.customerName}</p>
                <p className="text-xs text-green-600">ID: {scannedCustomer.customerId.slice(0, 8)}...</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Purchase Amount ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleAwardPoints}
                  disabled={!amount || processing}
                  className="flex-1"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Award Points
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setScannedCustomer(null);
                    setScanMode('selection');
                  }}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* QR Scanner Modal */}
      {scanMode === 'qr' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 relative">
            <QRCodeScanner 
              onScan={handleQRScan}
              onClose={() => setScanMode('selection')}
              title="Scan Customer QR Code"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PointCollection;
