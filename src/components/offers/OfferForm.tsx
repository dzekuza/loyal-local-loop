
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { LoyaltyOffer } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../../hooks/use-toast';
import { Gift, Euro, Award } from 'lucide-react';

interface OfferFormProps {
  offer?: LoyaltyOffer;
  onSuccess?: () => void;
}

const OfferForm: React.FC<OfferFormProps> = ({ offer, onSuccess }) => {
  const { currentBusiness, addLoyaltyOffer, updateLoyaltyOffer } = useAppStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    spendAmount: offer?.spendAmount || 10,
    pointsEarned: offer?.pointsEarned || 10,
    rewardThreshold: offer?.rewardThreshold || 100,
    rewardDescription: offer?.rewardDescription || '',
    rewardImage: offer?.rewardImage || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentBusiness) {
      toast({
        title: "Error",
        description: "No business selected",
        variant: "destructive",
      });
      return;
    }

    const offerData: LoyaltyOffer = {
      id: offer?.id || `offer_${Date.now()}`,
      businessId: currentBusiness.id,
      ...formData,
      isActive: true,
      createdAt: offer?.createdAt || new Date(),
    };

    if (offer) {
      updateLoyaltyOffer(offerData);
      toast({
        title: "Offer Updated",
        description: "Your loyalty offer has been updated successfully.",
      });
    } else {
      addLoyaltyOffer(offerData);
      toast({
        title: "Offer Created",
        description: "Your loyalty offer has been created successfully.",
      });
    }

    onSuccess?.();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="offer-form-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gift className="w-5 h-5" />
          <span>{offer ? 'Edit Loyalty Offer' : 'Create Loyalty Offer'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group-spend">
              <Label htmlFor="spendAmount" className="flex items-center space-x-2">
                <Euro className="w-4 h-4" />
                <span>Spend Amount (€)</span>
              </Label>
              <Input
                id="spendAmount"
                type="number"
                min="1"
                value={formData.spendAmount}
                onChange={(e) => handleInputChange('spendAmount', parseInt(e.target.value))}
                className="input-spend-amount"
                required
              />
            </div>

            <div className="form-group-points">
              <Label htmlFor="pointsEarned" className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Points Earned</span>
              </Label>
              <Input
                id="pointsEarned"
                type="number"
                min="1"
                value={formData.pointsEarned}
                onChange={(e) => handleInputChange('pointsEarned', parseInt(e.target.value))}
                className="input-points-earned"
                required
              />
            </div>
          </div>

          <div className="form-group-threshold">
            <Label htmlFor="rewardThreshold">Points Required for Reward</Label>
            <Input
              id="rewardThreshold"
              type="number"
              min="1"
              value={formData.rewardThreshold}
              onChange={(e) => handleInputChange('rewardThreshold', parseInt(e.target.value))}
              className="input-reward-threshold"
              required
            />
          </div>

          <div className="form-group-description">
            <Label htmlFor="rewardDescription">Reward Description</Label>
            <Textarea
              id="rewardDescription"
              placeholder="e.g., Free coffee, 20% discount, etc."
              value={formData.rewardDescription}
              onChange={(e) => handleInputChange('rewardDescription', e.target.value)}
              className="textarea-reward-description"
              required
            />
          </div>

          <div className="offer-preview bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-2">Offer Preview:</h4>
            <p className="text-sm text-gray-700">
              Spend <span className="font-bold">€{formData.spendAmount}</span> → 
              Earn <span className="font-bold">{formData.pointsEarned} points</span>
            </p>
            <p className="text-sm text-gray-700">
              Collect <span className="font-bold">{formData.rewardThreshold} points</span> → 
              Get <span className="font-bold">{formData.rewardDescription}</span>
            </p>
          </div>

          <Button 
            type="submit" 
            className="btn-submit-offer w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {offer ? 'Update Offer' : 'Create Offer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OfferForm;
