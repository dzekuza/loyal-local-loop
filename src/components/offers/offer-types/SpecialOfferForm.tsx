
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock } from 'lucide-react';

interface SpecialOfferFormProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
}

const SpecialOfferForm: React.FC<SpecialOfferFormProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4 p-4 bg-indigo-50 rounded-lg">
      <h3 className="font-medium text-indigo-900">Special Offer Configuration</h3>
      
      <div className="space-y-2">
        <Label htmlFor="offerName" className="text-sm font-medium">
          Offer Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="offerName"
          type="text"
          value={formData.offerName || ''}
          onChange={(e) => onInputChange('offerName', e.target.value)}
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
          value={formData.offerRule || ''}
          onChange={(e) => onInputChange('offerRule', e.target.value)}
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
            value={formData.validFrom || ''}
            onChange={(e) => onInputChange('validFrom', e.target.value)}
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
            value={formData.validTo || ''}
            onChange={(e) => onInputChange('validTo', e.target.value)}
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
            value={formData.timeFrom || ''}
            onChange={(e) => onInputChange('timeFrom', e.target.value)}
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
            value={formData.timeTo || ''}
            onChange={(e) => onInputChange('timeTo', e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default SpecialOfferForm;
