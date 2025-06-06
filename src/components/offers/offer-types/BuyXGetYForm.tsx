
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BuyXGetYFormProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
}

const BuyXGetYForm: React.FC<BuyXGetYFormProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4 p-4 bg-red-50 rounded-lg">
      <h3 className="font-medium text-red-900">Buy X Get Y Configuration</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="buyQuantity" className="text-sm font-medium">
            Buy Quantity <span className="text-red-500">*</span>
          </Label>
          <Input
            id="buyQuantity"
            type="number"
            value={formData.buyQuantity || ''}
            onChange={(e) => onInputChange('buyQuantity', e.target.value)}
            placeholder="2"
            className="w-full"
            min="1"
            max="20"
            required
          />
          <p className="text-xs text-gray-500">Items to buy</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="getQuantity" className="text-sm font-medium">
            Get Quantity <span className="text-red-500">*</span>
          </Label>
          <Input
            id="getQuantity"
            type="number"
            value={formData.getQuantity || ''}
            onChange={(e) => onInputChange('getQuantity', e.target.value)}
            placeholder="1"
            className="w-full"
            min="1"
            max="10"
            required
          />
          <p className="text-xs text-gray-500">Items to get free</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemCategory" className="text-sm font-medium">
          Item Category (Optional)
        </Label>
        <Input
          id="itemCategory"
          type="text"
          value={formData.itemCategory || ''}
          onChange={(e) => onInputChange('itemCategory', e.target.value)}
          placeholder="pizzas, drinks, desserts, etc."
          className="w-full"
          maxLength={50}
        />
        <p className="text-xs text-gray-500">
          Specify which items this applies to (leave empty for all items)
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
          placeholder="Buy 2 pizzas, get 1 free"
          className="w-full"
          maxLength={100}
          required
        />
      </div>
    </div>
  );
};

export default BuyXGetYForm;
