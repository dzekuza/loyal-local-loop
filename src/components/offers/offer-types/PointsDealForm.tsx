
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PointsDealFormProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
}

const PointsDealForm: React.FC<PointsDealFormProps> = ({ formData, onInputChange }) => {
  return (
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
          value={formData.pointsPerEuro || ''}
          onChange={(e) => onInputChange('pointsPerEuro', e.target.value)}
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
          value={formData.rewardThreshold || ''}
          onChange={(e) => onInputChange('rewardThreshold', e.target.value)}
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
          value={formData.rewardDescription || ''}
          onChange={(e) => onInputChange('rewardDescription', e.target.value)}
          placeholder="Free coffee or 10% discount"
          className="w-full"
          maxLength={100}
          required
        />
      </div>
    </div>
  );
};

export default PointsDealForm;
