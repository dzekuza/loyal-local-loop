
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Gift, Calendar, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdvancedOfferFormProps {
  businessId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AdvancedOfferForm: React.FC<AdvancedOfferFormProps> = ({
  businessId,
  onSuccess,
  onCancel
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [offerType, setOfferType] = useState<'points_deal' | 'special_offer'>('points_deal');
  const [formData, setFormData] = useState({
    // Points Deal fields
    pointsPerEuro: '',
    rewardThreshold: '',
    rewardDescription: '',
    
    // Special Offer fields
    offerName: '',
    offerRule: '',
    validFrom: '',
    validTo: '',
    timeFrom: '',
    timeTo: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (offerType === 'points_deal') {
      if (!formData.pointsPerEuro || !formData.rewardThreshold || !formData.rewardDescription) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields for points deal",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!formData.offerName || !formData.offerRule) {
        toast({
          title: "Validation Error", 
          description: "Please fill in all required fields for special offer",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const offerData = {
        business_id: businessId,
        offer_type: offerType,
        is_active: true,
        ...(offerType === 'points_deal' ? {
          points_per_euro: parseFloat(formData.pointsPerEuro),
          reward_threshold: parseInt(formData.rewardThreshold),
          reward_description: formData.rewardDescription,
          points_earned: Math.round(parseFloat(formData.pointsPerEuro) * 10), // Example: 10 euros baseline
          spend_amount: 10, // Baseline amount
        } : {
          offer_name: formData.offerName,
          offer_rule: formData.offerRule,
          reward_description: formData.offerName,
          points_earned: 0,
          spend_amount: 0,
          reward_threshold: 0,
          valid_from: formData.validFrom ? new Date(formData.validFrom).toISOString() : null,
          valid_to: formData.validTo ? new Date(formData.validTo).toISOString() : null,
          time_from: formData.timeFrom || null,
          time_to: formData.timeTo || null,
        })
      };

      const { error } = await supabase
        .from('loyalty_offers')
        .insert(offerData);

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: `Your ${offerType === 'points_deal' ? 'points deal' : 'special offer'} has been created successfully!`,
      });

      setFormData({
        pointsPerEuro: '',
        rewardThreshold: '',
        rewardDescription: '',
        offerName: '',
        offerRule: '',
        validFrom: '',
        validTo: '',
        timeFrom: '',
        timeTo: '',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: "Error",
        description: "Failed to create offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gift className="w-5 h-5 text-purple-600" />
          <span>Create New Offer</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Offer Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Offer Type <span className="text-red-500">*</span></Label>
            <RadioGroup value={offerType} onValueChange={(value) => setOfferType(value as 'points_deal' | 'special_offer')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="points_deal" id="points_deal" />
                <Label htmlFor="points_deal" className="cursor-pointer">Points Deal - Customers earn points for each euro spent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="special_offer" id="special_offer" />
                <Label htmlFor="special_offer" className="cursor-pointer">Special Offer - Time-limited discount or promotion</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Points Deal Form */}
          {offerType === 'points_deal' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">Points Deal Configuration</h3>
              
              <div className="space-y-2">
                <Label htmlFor="pointsPerEuro" className="text-sm font-medium">
                  Points per Euro <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pointsPerEuro"
                  type="number"
                  step="0.1"
                  value={formData.pointsPerEuro}
                  onChange={(e) => handleInputChange('pointsPerEuro', e.target.value)}
                  placeholder="1.5"
                  className="w-full"
                  min="0.1"
                  max="10"
                  required
                />
                <p className="text-xs text-gray-500">
                  How many points customers earn for each euro spent
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rewardThreshold" className="text-sm font-medium">
                  Points Needed for Reward <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="rewardThreshold"
                  type="number"
                  value={formData.rewardThreshold}
                  onChange={(e) => handleInputChange('rewardThreshold', e.target.value)}
                  placeholder="100"
                  className="w-full"
                  min="1"
                  max="10000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rewardDescription" className="text-sm font-medium">
                  Reward Description <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="rewardDescription"
                  type="text"
                  value={formData.rewardDescription}
                  onChange={(e) => handleInputChange('rewardDescription', e.target.value)}
                  placeholder="Free coffee or 10% discount"
                  className="w-full"
                  maxLength={100}
                  required
                />
              </div>
            </div>
          )}

          {/* Special Offer Form */}
          {offerType === 'special_offer' && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900">Special Offer Configuration</h3>
              
              <div className="space-y-2">
                <Label htmlFor="offerName" className="text-sm font-medium">
                  Offer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="offerName"
                  type="text"
                  value={formData.offerName}
                  onChange={(e) => handleInputChange('offerName', e.target.value)}
                  placeholder="Summer Sale 50% Off"
                  className="w-full"
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offerRule" className="text-sm font-medium">
                  Offer Rule <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="offerRule"
                  value={formData.offerRule}
                  onChange={(e) => handleInputChange('offerRule', e.target.value)}
                  placeholder="Show this QR code to get 50 EUR discount on purchases over 100 EUR"
                  className="w-full min-h-[80px]"
                  maxLength={300}
                  required
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom" className="text-sm font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Valid From
                  </Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => handleInputChange('validFrom', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validTo" className="text-sm font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Valid Until
                  </Label>
                  <Input
                    id="validTo"
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => handleInputChange('validTo', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeFrom" className="text-sm font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Available From (Optional)
                  </Label>
                  <Input
                    id="timeFrom"
                    type="time"
                    value={formData.timeFrom}
                    onChange={(e) => handleInputChange('timeFrom', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeTo" className="text-sm font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Available Until (Optional)
                  </Label>
                  <Input
                    id="timeTo"
                    type="time"
                    value={formData.timeTo}
                    onChange={(e) => handleInputChange('timeTo', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                `Create ${offerType === 'points_deal' ? 'Points Deal' : 'Special Offer'}`
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdvancedOfferForm;
