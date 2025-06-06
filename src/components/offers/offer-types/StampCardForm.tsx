
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StampCardFormProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
}

const StampCardForm: React.FC<StampCardFormProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
      <h3 className="font-medium text-purple-900">Stamp Card Configuration</h3>
      
      <div className="space-y-2">
        <Label htmlFor="visitsRequired" className="text-sm font-medium">
          Visits Required <span className="text-red-500">*</span>
        </Label>
        <Input
          id="visitsRequired"
          type="number"
          value={formData.visitsRequired || ''}
          onChange={(e) => onInputChange('visitsRequired', e.target.value)}
          placeholder="10"
          className="w-full"
          min="2"
          max="50"
          required
        />
        <p className="text-xs text-gray-500">
          Number of visits needed to earn the reward
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stampValue" className="text-sm font-medium">
          Minimum Spend per Visit <span className="text-red-500">*</span>
        </Label>
        <Input
          id="stampValue"
          type="number"
          step="0.01"
          value={formData.stampValue || ''}
          onChange={(e) => onInputChange('stampValue', e.target.value)}
          placeholder="5.00"
          className="w-full"
          min="0"
          required
        />
        <p className="text-xs text-gray-500">
          Minimum amount customer must spend per visit to earn a stamp
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rewardDescription" className="text-sm font-medium">
          Reward Description <span className="text-red-500">*</span>
        </Label>
        <Input
          id="rewardDescription"
          type="text"
          value={formData.rewardDescription || ''}
          onChange={(e) => onInputChange('rewardDescription', e.target.value)}
          placeholder="Free coffee or pastry"
          className="w-full"
          maxLength={100}
          required
        />
      </div>
    </div>
  );
};

export default StampCardForm;
