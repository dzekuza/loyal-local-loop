
import React from 'react';
import AdvancedOfferForm from './AdvancedOfferForm';

interface EnhancedOfferFormProps {
  businessId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// This component now uses the new AdvancedOfferForm
const EnhancedOfferForm: React.FC<EnhancedOfferFormProps> = (props) => {
  return <AdvancedOfferForm {...props} />;
};

export default EnhancedOfferForm;
