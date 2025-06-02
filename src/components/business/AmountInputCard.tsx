
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DollarSign, Gift } from 'lucide-react';

interface AmountInputCardProps {
  amount: string;
  onAmountChange: (value: string) => void;
  pointsToEarn: number;
  currentOffer: any;
  onAwardPoints: () => void;
  processing: boolean;
}

const AmountInputCard: React.FC<AmountInputCardProps> = ({
  amount,
  onAmountChange,
  pointsToEarn,
  currentOffer,
  onAwardPoints,
  processing
}) => {
  const quickAmounts = ['5', '10', '20', '50'];

  return (
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
              onChange={(e) => onAmountChange(e.target.value)}
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
                onClick={() => onAmountChange(quickAmount)}
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

        <Button
          onClick={onAwardPoints}
          disabled={!amount || pointsToEarn === 0 || processing}
          className={`w-full ${pointsToEarn > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
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
      </CardContent>
    </Card>
  );
};

export default AmountInputCard;
