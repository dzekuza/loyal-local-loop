
import React from 'react';
import EnhancedOfferCreationForm from './EnhancedOfferCreationForm';

interface EnhancedOfferFormProps {
  businessId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// This component now uses the new EnhancedOfferCreationForm
const EnhancedOfferForm: React.FC<EnhancedOfferFormProps> = (props) => {
  return <EnhancedOfferCreationForm {...props} />;
};

export default EnhancedOfferForm;
