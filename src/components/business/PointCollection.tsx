
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { Scan, DollarSign, Gift, CheckCircle, X } from 'lucide-react';

interface PointCollectionProps {
  businessId: string;
  businessName: string;
  onScanSuccess?: () => void;
}

interface CustomerData {
  customerId: string;
  customerName: string;
}

const PointCollection: React.FC<PointCollectionProps> = ({ 
  businessId, 
  businessName, 
  onScanSuccess 
}) => {
  const [scannedCustomer, setScannedCustomer] = useState<CustomerData | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { toast } = useToast();

  const handleQRScan = (data: any) => {
    try {
      if (data && data.text) {
        const qrData = JSON.parse(data.text);
        
        if (qrData.type === 'customer' && qrData.customerId) {
          setScannedCustomer({
            customerId: qrData.customerId,
            customerName: qrData.customerName || 'Unknown Customer'
          });
          setShowScanner(false);
          toast({
            title: "Customer Scanned",
            description: `Ready to award points to ${qrData.customerName}`,
          });
        } else {
          toast({
            title: "Invalid QR Code",
            description: "This is not a valid customer QR code",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('QR scan error:', error);
      toast({
        title: "QR Code Error",
        description: "Unable to read QR code data",
        variant: "destructive",
      });
    }
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
        </CardHeader>
        <CardContent className="space-y-4">
          {!scannedCustomer ? (
            <div className="text-center">
              <Button 
                onClick={() => setShowScanner(true)}
                className="w-full"
                size="lg"
              >
                <Scan className="w-5 h-5 mr-2" />
                Scan Customer QR Code
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                Ask customer to show their QR code
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Customer Scanned</span>
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
                  onClick={() => setScannedCustomer(null)}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 relative">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Scan Customer QR Code</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowScanner(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center">
                  <p className="text-gray-600 text-center">
                    Camera view would appear here<br />
                    <span className="text-sm">Point camera at customer's QR code</span>
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowScanner(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Simulate QR scan for demo
                    handleQRScan({
                      text: JSON.stringify({
                        type: 'customer',
                        customerId: 'demo-customer-123',
                        customerName: 'Demo Customer'
                      })
                    });
                  }}
                  className="flex-1"
                >
                  Demo Scan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PointCollection;
