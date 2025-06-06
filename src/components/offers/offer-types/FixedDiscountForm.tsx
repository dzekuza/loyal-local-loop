
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FixedDiscountFormProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
}

const FixedDiscountForm: React.FC<FixedDiscountFormProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
      <h3 className="font-medium text-orange-900">Fixed Discount Configuration</h3>
      
      <div className="space-y-2">
        <Label htmlFor="discountAmount" className="text-sm font-medium">
          Discount Amount <span className="text-red-500">*</span>
        </Label>
        <Input
          id="discountAmount"
          type="number"
          step="0.01"
          value={formData.discountAmount || ''}
          onChange={(e) => onInputChange('discountAmount', e.target.value)}
          placeholder="10.00"
          className="w-full"
          min="0.01"
          required
        />
        <p className="text-xs text-gray-500">
          Fixed amount to discount from purchase
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minimumSpend" className="text-sm font-medium">
          Minimum Spend <span className="text-red-500">*</span>
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
          required
        />
        <p className="text-xs text-gray-500">
          Minimum purchase amount required for discount
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxUsesPerCustomer" className="text-sm font-medium">
          Max Uses per Customer (Optional)
        </Label>
        <Input
          id="maxUsesPerCustomer"
          type="number"
          value={formData.maxUsesPerCustomer || ''}
          onChange={(e) => onInputChange('maxUsesPerCustomer', e.target.value)}
          placeholder="1"
          className="w-full"
          min="1"
        />
        <p className="text-xs text-gray-500">
          Limit how many times each customer can use this offer
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
          placeholder="€10 off when you spend €25 or more"
          className="w-full"
          maxLength={100}
          required
        />
      </div>
    </div>
  );
};

export default FixedDiscountForm;
