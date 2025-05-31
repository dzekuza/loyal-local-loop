
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
import { ArrowLeft, User, DollarSign, Gift, CheckCircle } from 'lucide-react';

interface CustomerData {
  customerId: string;
  customerName: string;
}

const BusinessScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentBusiness } = useAppStore();
  const { toast } = useToast();
  
  const [scannedCustomer, setScannedCustomer] = useState<CustomerData | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [pointsToEarn, setPointsToEarn] = useState(0);

  const calculatePoints = async (spendAmount: number) => {
    if (!currentBusiness) return 0;

    try {
      const { data: offers, error } = await supabase
        .from('loyalty_offers')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .eq('is_active', true)
        .limit(1);

      if (error || !offers || offers.length === 0) return 0;

      const offer = offers[0];
      return Math.floor((spendAmount / offer.spend_amount) * offer.points_earned);
    } catch (error) {
      console.error('Error calculating points:', error);
      return 0;
    }
  };

  const handleAmountChange = async (value: string) => {
    setAmount(value);
    const numValue = parseFloat(value) || 0;
    const points = await calculatePoints(numValue);
    setPointsToEarn(points);
  };

  const handleQRScan = (data: string) => {
    try {
      console.log('QR data received:', data);
      
      let qrData;
      try {
        qrData = JSON.parse(data);
      } catch {
        qrData = {
          type: 'customer',
          customerId: data,
          customerName: 'Customer'
        };
      }
      
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
        toast({
          title: "Invalid QR Code",
          description: "Please scan a valid customer loyalty QR code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('QR scan error:', error);
      toast({
        title: "Scan Error",
        description: "Unable to read QR code. Please try again.",
        variant: "destructive",
      });
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
        throw new Error('Amount too low to earn points. Check your loyalty offer settings.');
      }

      // Ensure user_points record exists
      const { data: existingPoints, error: pointsCheckError } = await supabase
        .from('user_points')
        .select('*')
        .eq('customer_id', scannedCustomer.customerId)
        .eq('business_id', currentBusiness.id)
        .single();

      if (pointsCheckError && pointsCheckError.code === 'PGRST116') {
        const { error: createPointsError } = await supabase
          .from('user_points')
          .insert({
            customer_id: scannedCustomer.customerId,
            business_id: currentBusiness.id,
            total_points: 0
          });

        if (createPointsError) {
          throw new Error('Failed to initialize customer points record');
        }
      }

      // Create point transaction
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
        throw transactionError;
      }

      toast({
        title: "Points Awarded Successfully! 🎉",
        description: `${scannedCustomer.customerName} earned ${pointsToEarn} points for spending €${spendAmount}`,
      });

      // Reset for next customer
      setScannedCustomer(null);
      setAmount('');
      setPointsToEarn(0);

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

  const quickAmounts = ['5', '10', '20', '50'];

  if (!currentBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please set up your business profile first</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan Customer QR Code</h1>
          <p className="text-gray-600">Scan customer loyalty QR codes to award points</p>
        </div>

        {!scannedCustomer ? (
          <QRCodeScanner 
            onScan={handleQRScan}
            title="Scan Customer QR Code"
          />
        ) : (
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Customer Scanned</p>
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
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700">Points to earn:</span>
                      <span className="font-bold text-purple-800 text-lg">{pointsToEarn} points</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={handleAwardPoints}
                disabled={!amount || pointsToEarn === 0 || processing}
                className="flex-1 bg-green-600 hover:bg-green-700"
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
