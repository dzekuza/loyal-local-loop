import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Gift } from 'lucide-react';

interface OfferFormProps {
  onOfferCreated?: () => void;
}

const OfferForm: React.FC<OfferFormProps> = ({ onOfferCreated }) => {
  const { user } = useAuth();
  const { currentBusiness } = useAppStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    spendAmount: '',
    pointsEarned: '',
    rewardThreshold: '',
    rewardDescription: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !currentBusiness) {
      toast({
        title: "Error",
        description: "You must be logged in as a business owner",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const offerData = {
        business_id: currentBusiness.id,
        spend_amount: parseInt(formData.spendAmount),
        points_earned: parseInt(formData.pointsEarned),
        reward_threshold: parseInt(formData.rewardThreshold),
        reward_description: formData.rewardDescription,
        is_active: true,
      };

      const { error } = await supabase
        .from('rewards')
        .insert(offerData);

      if (error) throw error;

      toast({
        title: "Loyalty Offer Created!",
        description: "Your loyalty program is now active.",
      });

      // Reset form
      setFormData({
        spendAmount: '',
        pointsEarned: '',
        rewardThreshold: '',
        rewardDescription: '',
      });

      // Trigger refresh of offers list if callback provided
      if (onOfferCreated) {
        onOfferCreated();
      }

      // Refresh the page to update offers list and analytics
      window.location.reload();

    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: "Error",
        description: "Failed to create loyalty offer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="offer-form-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gift className="w-5 h-5" />
          <span>Create Loyalty Offer</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <Label htmlFor="spendAmount">Spend Amount (€)</Label>
              <Input
                id="spendAmount"
                type="number"
                placeholder="10"
                value={formData.spendAmount}
                onChange={(e) => setFormData({ ...formData, spendAmount: e.target.value })}
                required
                className="input-spend-amount"
              />
            </div>

            <div className="form-group">
              <Label htmlFor="pointsEarned">Points Earned</Label>
              <Input
                id="pointsEarned"
                type="number"
                placeholder="10"
                value={formData.pointsEarned}
                onChange={(e) => setFormData({ ...formData, pointsEarned: e.target.value })}
                required
                className="input-points-earned"
              />
            </div>
          </div>

          <div className="form-group">
            <Label htmlFor="rewardThreshold">Reward Threshold (Points)</Label>
            <Input
              id="rewardThreshold"
              type="number"
              placeholder="100"
              value={formData.rewardThreshold}
              onChange={(e) => setFormData({ ...formData, rewardThreshold: e.target.value })}
              required
              className="input-reward-threshold"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="rewardDescription">Reward Description</Label>
            <Textarea
              id="rewardDescription"
              placeholder="Free coffee or 10% discount"
              value={formData.rewardDescription}
              onChange={(e) => setFormData({ ...formData, rewardDescription: e.target.value })}
              required
              className="textarea-reward-description"
            />
          </div>

          <div className="offer-preview bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Preview:</h4>
            <p className="text-sm text-gray-700">
              {formData.spendAmount && formData.pointsEarned ? (
                <>
                  Spend <span className="font-bold">€{formData.spendAmount}</span> → 
                  Earn <span className="font-bold">{formData.pointsEarned} points</span>
                </>
              ) : (
                'Enter spending amount and points to see preview'
              )}
            </p>
            {formData.rewardThreshold && formData.rewardDescription && (
              <p className="text-sm text-gray-700 mt-1">
                Collect <span className="font-bold">{formData.rewardThreshold} points</span> → 
                Get <span className="font-bold">{formData.rewardDescription}</span>
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="btn-create-offer w-full" 
            disabled={loading}
          >
            {loading ? 'Creating Offer...' : 'Create Loyalty Offer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OfferForm;
