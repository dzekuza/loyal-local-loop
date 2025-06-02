import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import QRCodeScanner from '@/components/qr/QRCodeScanner';
import ManualCodeEntry from '@/components/business/ManualCodeEntry';
import { ArrowLeft, User, DollarSign, Gift, CheckCircle, AlertTriangle, Scan, Keyboard } from 'lucide-react';

interface CustomerData {
  customerId: string;
  customerName: string;
}

type ScanMode = 'qr' | 'manual';

const BusinessScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentBusiness } = useAppStore();
  const { toast } = useToast();
  
  const [scanMode, setScanMode] = useState<ScanMode>('qr');
  const [scannedCustomer, setScannedCustomer] = useState<CustomerData | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [pointsToEarn, setPointsToEarn] = useState(0);
  const [currentOffer, setCurrentOffer] = useState<any>(null);

  const calculatePoints = async (spendAmount: number) => {
    if (!currentBusiness) return 0;

    try {
      console.log('💰 Calculating points for amount:', spendAmount);
      
      const { data: offers, error } = await supabase
        .from('loyalty_offers')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .eq('is_active', true)
        .limit(1);

      if (error) {
        console.error('❌ Error fetching offers:', error);
        return 0;
      }

      if (!offers || offers.length === 0) {
        console.warn('⚠️ No active offers found');
        return 0;
      }

      const offer = offers[0];
      setCurrentOffer(offer);
      const points = Math.floor((spendAmount / offer.spend_amount) * offer.points_earned);
      console.log('🎯 Points calculated:', points, 'for offer:', offer);
      return points;
    } catch (error) {
      console.error('❌ Error calculating points:', error);
      return 0;
    }
  };

  const handleAmountChange = async (value: string) => {
    setAmount(value);
    const numValue = parseFloat(value) || 0;
    if (numValue > 0) {
      const points = await calculatePoints(numValue);
      setPointsToEarn(points);
    } else {
      setPointsToEarn(0);
    }
  };

  const handleQRScan = (data: string) => {
    try {
      console.log('📱 QR data received:', data);
      
      let qrData;
      try {
        qrData = JSON.parse(data);
      } catch {
        // Handle plain text customer ID
        qrData = {
          type: 'customer',
          customerId: data,
          customerName: 'Customer'
        };
      }
      
      console.log('🔍 Parsed QR data:', qrData);
      
      if (qrData.type === 'customer' && qrData.customerId) {
        setScannedCustomer({
          customerId: qrData.customerId,
          customerName: qrData.customerName || 'Unknown Customer'
        });
        
        toast({
          title: "Customer Scanned Successfully! ✅",
          description: `Ready to award points to ${qrData.customerName || 'customer'}`,
        });
      } else {
        console.warn('⚠️ Invalid QR data format:', qrData);
        toast({
          title: "Invalid QR Code",
          description: "Please scan a valid customer loyalty QR code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ QR scan error:', error);
      toast({
        title: "Scan Error",
        description: "Unable to read QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManualCustomerFound = (customerId: string, customerName: string) => {
    setScannedCustomer({
      customerId,
      customerName
    });
    setScanMode('qr'); // Return to main view after finding customer
  };

  const ensureUserPointsRecord = async (customerId: string, businessId: string) => {
    try {
      console.log('🔍 Checking user_points record for customer:', customerId);
      
      const { data: existingPoints, error: pointsCheckError } = await supabase
        .from('user_points')
        .select('*')
        .eq('customer_id', customerId)
        .eq('business_id', businessId)
        .single();

      if (pointsCheckError && pointsCheckError.code === 'PGRST116') {
        console.log('➕ Creating new user_points record');
        const { error: createPointsError } = await supabase
          .from('user_points')
          .insert({
            customer_id: customerId,
            business_id: businessId,
            total_points: 0
          });

        if (createPointsError) {
          console.error('❌ Error creating user_points:', createPointsError);
          throw new Error('Failed to initialize customer points record');
        }
        console.log('✅ User points record created');
      } else if (pointsCheckError) {
        console.error('❌ Error checking user_points:', pointsCheckError);
        throw pointsCheckError;
      } else {
        console.log('✅ User points record exists:', existingPoints);
      }
    } catch (error) {
      console.error('❌ Error in ensureUserPointsRecord:', error);
      throw error;
    }
  };

  const handleAwardPoints = async () => {
    if (!scannedCustomer || !amount || !currentBusiness || !user) {
      toast({
        title: "Missing Information",
        description: "Please ensure customer is scanned and amount is entered",
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

      if (pointsToEarn === 0) {
        const minSpend = currentOffer?.spend_amount || 1;
        throw new Error(`Minimum spend of €${minSpend} required to earn points`);
      }

      console.log('💳 Processing transaction:', {
        customer: scannedCustomer,
        amount: spendAmount,
        points: pointsToEarn,
        business: currentBusiness.id
      });

      // Ensure user_points record exists
      await ensureUserPointsRecord(scannedCustomer.customerId, currentBusiness.id);

      // Create point transaction (trigger will update user_points automatically)
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          customer_id: scannedCustomer.customerId,
          business_id: currentBusiness.id,
          amount_spent: spendAmount,
          points_earned: pointsToEarn,
          processed_by: user.id
        });

      if (transactionError) {
        console.error('❌ Transaction error:', transactionError);
        throw transactionError;
      }

      console.log('✅ Transaction successful');

      toast({
        title: "Points Awarded Successfully! 🎉",
        description: `${scannedCustomer.customerName} earned ${pointsToEarn} points for spending €${spendAmount}`,
      });

      // Reset for next customer
      setScannedCustomer(null);
      setAmount('');
      setPointsToEarn(0);
      setCurrentOffer(null);

    } catch (error) {
      console.error('❌ Error awarding points:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to award points",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const quickAmounts = ['5', '10', '20', '50'];

  if (!currentBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Please set up your business profile first</p>
          <Button onClick={() => navigate('/business-profile')}>
            Set Up Profile
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Award Customer Points</h1>
          <p className="text-gray-600">Scan QR code or enter customer code to award points</p>
        </div>

        {!scannedCustomer ? (
          <div className="space-y-6">
            {/* Mode Selection */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  <Button
                    variant={scanMode === 'qr' ? 'default' : 'ghost'}
                    className={`flex-1 rounded-none ${scanMode === 'qr' ? 'bg-blue-600 text-white' : ''}`}
                    onClick={() => setScanMode('qr')}
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    Scan QR Code
                  </Button>
                  <Button
                    variant={scanMode === 'manual' ? 'default' : 'ghost'}
                    className={`flex-1 rounded-none ${scanMode === 'manual' ? 'bg-blue-600 text-white' : ''}`}
                    onClick={() => setScanMode('manual')}
                  >
                    <Keyboard className="w-4 h-4 mr-2" />
                    Enter Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scanner or Manual Entry */}
            {scanMode === 'qr' ? (
              <QRCodeScanner 
                onScan={handleQRScan}
                title="Scan Customer QR Code"
              />
            ) : (
              <ManualCodeEntry
                onCustomerFound={handleManualCustomerFound}
                onCancel={() => setScanMode('qr')}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Customer Found</p>
                    <p className="text-green-700">{scannedCustomer.customerName}</p>
                    <p className="text-xs text-green-600">ID: {scannedCustomer.customerId.slice(0, 8)}...</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amount Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Purchase Amount</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (€)</Label>
                  <div className="relative mt-1">
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="0.00"
                      className="text-lg"
                    />
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <Label className="text-sm text-gray-600">Quick amounts:</Label>
                  <div className="flex space-x-2 mt-1">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAmountChange(quickAmount)}
                        className="flex-1"
                      >
                        €{quickAmount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Points Preview */}
                {amount && (
                  <div className={`p-3 rounded-lg border ${pointsToEarn > 0 ? 'bg-purple-50 border-purple-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={pointsToEarn > 0 ? 'text-purple-700' : 'text-yellow-700'}>
                        Points to earn:
                      </span>
                      <span className={`font-bold text-lg ${pointsToEarn > 0 ? 'text-purple-800' : 'text-yellow-800'}`}>
                        {pointsToEarn} points
                      </span>
                    </div>
                    {pointsToEarn === 0 && currentOffer && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Minimum spend: €{currentOffer.spend_amount} for {currentOffer.points_earned} points
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={handleAwardPoints}
                disabled={!amount || pointsToEarn === 0 || processing}
                className={`flex-1 ${pointsToEarn > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                size="lg"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5 mr-2" />
                    Award {pointsToEarn} Points
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setScannedCustomer(null)}
                disabled={processing}
                size="lg"
              >
                Scan New Customer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessScanPage;
