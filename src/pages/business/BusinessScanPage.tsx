
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QRCodeScanner from '@/components/qr/QRCodeScanner';
import ManualCodeEntry from '@/components/business/ManualCodeEntry';
import CustomerInfoCard from '@/components/business/CustomerInfoCard';
import AmountInputCard from '@/components/business/AmountInputCard';
import ScanModeSelector from '@/components/business/ScanModeSelector';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

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
            <ScanModeSelector scanMode={scanMode} onModeChange={setScanMode} />

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
            <CustomerInfoCard 
              customer={scannedCustomer}
              onScanNew={() => setScannedCustomer(null)}
              processing={processing}
            />

            {/* Amount Input */}
            <AmountInputCard
              amount={amount}
              onAmountChange={handleAmountChange}
              pointsToEarn={pointsToEarn}
              currentOffer={currentOffer}
              onAwardPoints={handleAwardPoints}
              processing={processing}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessScanPage;
