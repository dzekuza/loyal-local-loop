
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PercentageDiscountFormProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
}

const PercentageDiscountForm: React.FC<PercentageDiscountFormProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4 p-4 bg-green-50 rounded-lg">
      <h3 className="font-medium text-green-900">Percentage Discount Configuration</h3>
      
      <div className="space-y-2">
        <Label htmlFor="discountPercentage" className="text-sm font-medium">
          Discount Percentage <span className="text-red-500">*</span>
        </Label>
        <Input
          id="discountPercentage"
          type="number"
          value={formData.discountPercentage || ''}
          onChange={(e) => onInputChange('discountPercentage', e.target.value)}
          placeholder="15"
          className="w-full"
          min="1"
          max="100"
          required
        />
        <p className="text-xs text-gray-500">
          Percentage discount to apply (1-100%)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minimumSpend" className="text-sm font-medium">
          Minimum Spend (Optional)
        </Label>
        <Input
          id="minimumSpend"
          type="number"
          step="0.01"
          value={formData.minimumSpend || ''}
          onChange={(e) => onInputChange('minimumSpend', e.target.value)}
          placeholder="25.00"
          className="w-full"
          min="0"
        />
        <p className="text-xs text-gray-500">
          Minimum purchase amount required for discount
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maximumDiscount" className="text-sm font-medium">
          Maximum Discount Amount (Optional)
        </Label>
        <Input
          id="maximumDiscount"
          type="number"
          step="0.01"
          value={formData.maximumDiscount || ''}
          onChange={(e) => onInputChange('maximumDiscount', e.target.value)}
          placeholder="50.00"
          className="w-full"
          min="0"
        />
        <p className="text-xs text-gray-500">
          Cap the maximum discount amount
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="offerDescription" className="text-sm font-medium">
          Offer Description <span className="text-red-500">*</span>
        </Label>
        <Input
          id="offerDescription"
          type="text"
          value={formData.offerDescription || ''}
          onChange={(e) => onInputChange('offerDescription', e.target.value)}
          placeholder="15% off entire purchase"
          className="w-full"
          maxLength={100}
          required
        />
      </div>
    </div>
  );
};

export default PercentageDiscountForm;
