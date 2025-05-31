
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EnhancedOfferFormProps {
  businessId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EnhancedOfferForm: React.FC<EnhancedOfferFormProps> = ({
  businessId,
  onSuccess,
  onCancel
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    offerName: '',
    shortDescription: '',
    pointsNeeded: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.offerName.trim() || !formData.pointsNeeded) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('loyalty_offers')
        .insert({
          business_id: businessId,
          reward_description: formData.offerName.trim(),
          reward_threshold: parseInt(formData.pointsNeeded),
          spend_amount: 0,
          points_earned: 0,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: "Your offer has been created successfully!",
      });

      setFormData({
        offerName: '',
        shortDescription: '',
        pointsNeeded: '',
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
          <span>{t('offers.create')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Offer Name - Required */}
          <div className="space-y-2">
            <Label htmlFor="offerName" className="text-sm font-medium">
              {t('offers.name')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="offerName"
              type="text"
              value={formData.offerName}
              onChange={(e) => handleInputChange('offerName', e.target.value)}
              placeholder="e.g., Free Coffee, 20% Discount, Buy One Get One"
              className="w-full"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500">
              This will be the main headline for your offer
            </p>
          </div>

          {/* Short Description - Optional */}
          <div className="space-y-2">
            <Label htmlFor="shortDescription" className="text-sm font-medium">
              {t('offers.shortDescription')}
            </Label>
            <Textarea
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              placeholder="Provide additional details about your offer..."
              className="w-full min-h-[80px]"
              maxLength={250}
            />
            <p className="text-xs text-gray-500">
              Optional: Add more details about your offer (max 250 characters)
            </p>
          </div>

          {/* Points Needed - Required */}
          <div className="space-y-2">
            <Label htmlFor="pointsNeeded" className="text-sm font-medium">
              {t('offers.pointsNeeded')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pointsNeeded"
              type="number"
              value={formData.pointsNeeded}
              onChange={(e) => handleInputChange('pointsNeeded', e.target.value)}
              placeholder="100"
              className="w-full"
              min="1"
              max="10000"
              required
            />
            <p className="text-xs text-gray-500">
              How many points customers need to redeem this offer
            </p>
          </div>

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
                'Create Offer'
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
                {t('common.cancel')}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedOfferForm;
