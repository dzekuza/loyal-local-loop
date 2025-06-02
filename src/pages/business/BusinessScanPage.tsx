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

  const parseQRData = (data: string) => {
    console.log('🔍 Raw QR data received:', data);
    
    // Try to parse as JSON first
    try {
      const qrData = JSON.parse(data);
      console.log('📋 Parsed QR JSON:', qrData);
      
      // Handle standardized customer format
      if (qrData.type === 'customer' && qrData.customerId) {
        return {
          customerId: qrData.customerId,
          customerName: qrData.customerName || 'Customer'
        };
      }
      
      // Handle legacy customer_business format (backward compatibility)
      if (qrData.type === 'customer_business' && qrData.customerId) {
        console.log('⚠️ Legacy QR format detected, converting...');
        return {
          customerId: qrData.customerId,
          customerName: qrData.customerName || qrData['business Name'] || 'Customer'
        };
      }
      
      // Handle any other format that has customerId
      if (qrData.customerId) {
        console.log('🔄 Converting unknown QR format with customerId');
        return {
          customerId: qrData.customerId,
          customerName: qrData.customerName || qrData.name || 'Customer'
        };
      }
      
      console.warn('⚠️ QR data missing customerId:', qrData);
      return null;
      
    } catch (parseError) {
      console.log('📝 Not JSON, checking if it\'s a plain customer ID or timestamp...');
      
      // Handle plain timestamp (legacy format)
      if (/^\d+$/.test(data)) {
        console.warn('⚠️ Timestamp-only QR code detected:', data);
        toast({
          title: "Invalid QR Code Format",
          description: "This appears to be an old QR code format. Please ask the customer to regenerate their QR code.",
          variant: "destructive",
        });
        return null;
      }
      
      // Handle plain UUID (treat as customer ID)
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data)) {
        console.log('🆔 Plain UUID detected, treating as customer ID');
        return {
          customerId: data,
          customerName: 'Customer'
        };
      }
      
      console.error('❌ Unable to parse QR data:', data);
      return null;
    }
  };

  const handleQRScan = async (data: string) => {
    if (!currentBusiness) {
      toast({
        title: "Business Required",
        description: "Please set up your business profile first.",
        variant: "destructive",
      });
      return;
    }

    const customerData = parseQRData(data);
    
    if (customerData) {
      console.log('✅ Customer data extracted from QR:', customerData);
      
      // Check if customer is enrolled in this business's loyalty program
      try {
        const { data: enrollment, error } = await supabase
          .from('user_points')
          .select('customer_id, total_points')
          .eq('customer_id', customerData.customerId)
          .eq('business_id', currentBusiness.id)
          .single();

        if (error && error.code === 'PGRST116') {
          toast({
            title: "Customer Not Enrolled",
            description: `${customerData.customerName} is not enrolled in your loyalty program. Ask them to join first.`,
            variant: "destructive",
          });
          return;
        }

        if (error) {
          console.error('❌ Error checking enrollment:', error);
          toast({
            title: "Error",
            description: "Failed to verify customer enrollment. Please try again.",
            variant: "destructive",
          });
          return;
        }

        console.log('✅ Customer is enrolled:', enrollment);
        setScannedCustomer(customerData);
        
        toast({
          title: "Customer Scanned Successfully! ✅",
          description: `${customerData.customerName} is enrolled and ready to earn points`,
        });
      } catch (error) {
        console.error('❌ Error verifying customer enrollment:', error);
        toast({
          title: "Error",
          description: "Failed to verify customer. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      console.error('❌ Failed to extract customer data from QR code');
      toast({
        title: "Invalid QR Code",
        description: "Please scan a valid customer loyalty QR code or ask the customer to regenerate their code.",
        variant: "destructive",
      });
    }
  };

  const handleManualCustomerFound = (customerId: string, customerName: string) => {
    console.log('📝 Manual customer found and verified:', { customerId, customerName, businessId: currentBusiness?.id });
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
          <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
            <strong>{currentBusiness.name}</strong> - Only enrolled customers can earn points
          </div>
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
                businessId={currentBusiness.id}
                businessName={currentBusiness.name}
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
