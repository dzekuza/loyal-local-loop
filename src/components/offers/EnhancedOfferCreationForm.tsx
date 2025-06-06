
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Gift, Star, Percent, Euro, ShoppingBag, Clock, UserPlus, Heart, Share, TrendingUp, Package } from 'lucide-react';
import PointsDealForm from './offer-types/PointsDealForm';
import StampCardForm from './offer-types/StampCardForm';
import PercentageDiscountForm from './offer-types/PercentageDiscountForm';
import FixedDiscountForm from './offer-types/FixedDiscountForm';
import BuyXGetYForm from './offer-types/BuyXGetYForm';
import SpecialOfferForm from './offer-types/SpecialOfferForm';

interface EnhancedOfferCreationFormProps {
  businessId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type OfferType = 'points_deal' | 'stamp_card' | 'percentage_discount' | 'fixed_discount' | 'buy_x_get_y' | 'special_offer' | 'time_based' | 'first_customer' | 'birthday_anniversary' | 'referral' | 'tiered_spending' | 'product_specific';

const offerTypes = [
  {
    id: 'points_deal' as OfferType,
    name: 'Points Deal',
    description: 'Customers earn points for each euro spent',
    icon: <Star className="w-5 h-5" />,
    color: 'bg-blue-100 border-blue-200 hover:bg-blue-150',
    available: true
  },
  {
    id: 'stamp_card' as OfferType,
    name: 'Stamp Card',
    description: 'Buy X visits, get reward free',
    icon: <Gift className="w-5 h-5" />,
    color: 'bg-purple-100 border-purple-200 hover:bg-purple-150',
    available: true
  },
  {
    id: 'percentage_discount' as OfferType,
    name: 'Percentage Discount',
    description: 'X% off entire purchase or with minimum spend',
    icon: <Percent className="w-5 h-5" />,
    color: 'bg-green-100 border-green-200 hover:bg-green-150',
    available: true
  },
  {
    id: 'fixed_discount' as OfferType,
    name: 'Fixed Discount',
    description: 'Fixed amount off with minimum spend',
    icon: <Euro className="w-5 h-5" />,
    color: 'bg-orange-100 border-orange-200 hover:bg-orange-150',
    available: true
  },
  {
    id: 'buy_x_get_y' as OfferType,
    name: 'Buy X Get Y',
    description: 'Buy X items, get Y free',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'bg-red-100 border-red-200 hover:bg-red-150',
    available: true
  },
  {
    id: 'special_offer' as OfferType,
    name: 'Special Offer',
    description: 'Custom time-limited promotion',
    icon: <Clock className="w-5 h-5" />,
    color: 'bg-indigo-100 border-indigo-200 hover:bg-indigo-150',
    available: true
  },
  {
    id: 'time_based' as OfferType,
    name: 'Happy Hour',
    description: 'Time-specific offers (coming soon)',
    icon: <Clock className="w-5 h-5" />,
    color: 'bg-gray-100 border-gray-200',
    available: false
  },
  {
    id: 'first_customer' as OfferType,
    name: 'First Customer',
    description: 'New customer bonuses (coming soon)',
    icon: <UserPlus className="w-5 h-5" />,
    color: 'bg-gray-100 border-gray-200',
    available: false
  },
  {
    id: 'birthday_anniversary' as OfferType,
    name: 'Birthday/Anniversary',
    description: 'Special occasion offers (coming soon)',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-gray-100 border-gray-200',
    available: false
  },
  {
    id: 'referral' as OfferType,
    name: 'Referral',
    description: 'Refer friends rewards (coming soon)',
    icon: <Share className="w-5 h-5" />,
    color: 'bg-gray-100 border-gray-200',
    available: false
  },
  {
    id: 'tiered_spending' as OfferType,
    name: 'Tiered Spending',
    description: 'Spend more, save more (coming soon)',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-gray-100 border-gray-200',
    available: false
  },
  {
    id: 'product_specific' as OfferType,
    name: 'Product Specific',
    description: 'Category-based offers (coming soon)',
    icon: <Package className="w-5 h-5" />,
    color: 'bg-gray-100 border-gray-200',
    available: false
  }
];

const EnhancedOfferCreationForm: React.FC<EnhancedOfferCreationFormProps> = ({
  businessId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedOfferType, setSelectedOfferType] = useState<OfferType | null>(null);
  const [formData, setFormData] = useState<any>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!selectedOfferType) {
      toast({
        title: "Validation Error",
        description: "Please select an offer type",
        variant: "destructive",
      });
      return false;
    }

    // Specific validation for each offer type
    switch (selectedOfferType) {
      case 'points_deal':
        if (!formData.pointsPerEuro || !formData.rewardThreshold || !formData.rewardDescription) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields for points deal",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 'stamp_card':
        if (!formData.visitsRequired || !formData.stampValue || !formData.rewardDescription) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields for stamp card",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 'percentage_discount':
        if (!formData.discountPercentage || !formData.offerDescription) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields for percentage discount",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 'fixed_discount':
        if (!formData.discountAmount || !formData.minimumSpend || !formData.offerDescription) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields for fixed discount",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 'buy_x_get_y':
        if (!formData.buyQuantity || !formData.getQuantity || !formData.offerDescription) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields for buy X get Y offer",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 'special_offer':
        if (!formData.offerName || !formData.offerRule) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields for special offer",
            variant: "destructive",
          });
          return false;
        }
        break;
    }

    return true;
  };

  const buildOfferData = () => {
    // Base data with all required fields
    const baseData = {
      business_id: businessId,
      offer_type: selectedOfferType,
      is_active: true,
      points_earned: 0, // Default value, will be overridden per offer type
      reward_description: '', // Default value, will be overridden per offer type
      reward_threshold: 0, // Default value, will be overridden per offer type
      spend_amount: 0, // Default value, will be overridden per offer type
    };

    switch (selectedOfferType) {
      case 'points_deal':
        return {
          ...baseData,
          points_per_euro: parseFloat(formData.pointsPerEuro),
          reward_threshold: parseInt(formData.rewardThreshold),
          reward_description: formData.rewardDescription,
          points_earned: Math.round(parseFloat(formData.pointsPerEuro) * 10),
          spend_amount: 10,
          offer_config: {
            points_per_euro: parseFloat(formData.pointsPerEuro),
            reward_threshold: parseInt(formData.rewardThreshold)
          }
        };

      case 'stamp_card':
        return {
          ...baseData,
          reward_description: formData.rewardDescription,
          points_earned: 1,
          spend_amount: parseFloat(formData.stampValue || 0),
          reward_threshold: parseInt(formData.visitsRequired),
          offer_config: {
            visits_required: parseInt(formData.visitsRequired),
            stamp_value: parseFloat(formData.stampValue)
          }
        };

      case 'percentage_discount':
        return {
          ...baseData,
          reward_description: formData.offerDescription,
          spend_amount: parseFloat(formData.minimumSpend || 0),
          offer_config: {
            discount_percentage: parseFloat(formData.discountPercentage),
            minimum_spend: parseFloat(formData.minimumSpend || 0),
            maximum_discount: parseFloat(formData.maximumDiscount || 0)
          }
        };

      case 'fixed_discount':
        return {
          ...baseData,
          reward_description: formData.offerDescription,
          spend_amount: parseFloat(formData.minimumSpend),
          offer_config: {
            discount_amount: parseFloat(formData.discountAmount),
            minimum_spend: parseFloat(formData.minimumSpend)
          },
          usage_limits: {
            max_uses_per_customer: parseInt(formData.maxUsesPerCustomer || 0) || null
          }
        };

      case 'buy_x_get_y':
        return {
          ...baseData,
          reward_description: formData.offerDescription,
          offer_config: {
            buy_quantity: parseInt(formData.buyQuantity),
            get_quantity: parseInt(formData.getQuantity),
            item_category: formData.itemCategory || null
          }
        };

      case 'special_offer':
        return {
          ...baseData,
          offer_name: formData.offerName,
          offer_rule: formData.offerRule,
          reward_description: formData.offerName,
          valid_from: formData.validFrom ? new Date(formData.validFrom).toISOString() : null,
          valid_to: formData.validTo ? new Date(formData.validTo).toISOString() : null,
          time_from: formData.timeFrom || null,
          time_to: formData.timeTo || null,
        };

      default:
        return baseData;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const offerData = buildOfferData();
      console.log('Creating offer with data:', offerData);

      const { error } = await supabase
        .from('loyalty_offers')
        .insert(offerData);

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: `Your ${offerTypes.find(t => t.id === selectedOfferType)?.name} has been created successfully!`,
      });

      setFormData({});
      setSelectedOfferType(null);
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

  const renderOfferForm = () => {
    switch (selectedOfferType) {
      case 'points_deal':
        return <PointsDealForm formData={formData} onInputChange={handleInputChange} />;
      case 'stamp_card':
        return <StampCardForm formData={formData} onInputChange={handleInputChange} />;
      case 'percentage_discount':
        return <PercentageDiscountForm formData={formData} onInputChange={handleInputChange} />;
      case 'fixed_discount':
        return <FixedDiscountForm formData={formData} onInputChange={handleInputChange} />;
      case 'buy_x_get_y':
        return <BuyXGetYForm formData={formData} onInputChange={handleInputChange} />;
      case 'special_offer':
        return <SpecialOfferForm formData={formData} onInputChange={handleInputChange} />;
      default:
        return null;
    }
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
            <h3 className="text-lg font-medium">Choose Offer Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {offerTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => type.available && setSelectedOfferType(type.id)}
                  disabled={!type.available}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${selectedOfferType === type.id 
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' 
                      : type.available 
                        ? `${type.color} cursor-pointer` 
                        : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`
                      p-2 rounded-lg
                      ${selectedOfferType === type.id 
                        ? 'bg-purple-100 text-purple-600' 
                        : type.available 
                          ? 'bg-white/50' 
                          : 'bg-gray-100 text-gray-400'
                      }
                    `}>
                      {type.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{type.name}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{type.description}</p>
                      {!type.available && (
                        <p className="text-xs text-orange-600 mt-1 font-medium">Coming Soon</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Offer Configuration Form */}
          {selectedOfferType && (
            <div className="space-y-4">
              {renderOfferForm()}
            </div>
          )}

          {/* Form Actions */}
          {selectedOfferType && (
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
                  `Create ${offerTypes.find(t => t.id === selectedOfferType)?.name}`
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
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedOfferCreationForm;
