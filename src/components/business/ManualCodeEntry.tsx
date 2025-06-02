
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Keyboard, User, CheckCircle, AlertTriangle, UserX, Building } from 'lucide-react';
import { validateCustomerCode, formatCustomerCodeInput, findCustomerByCode } from '@/utils/customerCodes';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ManualCodeEntryProps {
  businessId: string;
  businessName: string;
  onCustomerFound: (customerId: string, customerName: string) => void;
  onCancel: () => void;
}

const ManualCodeEntry: React.FC<ManualCodeEntryProps> = ({ 
  businessId, 
  businessName, 
  onCustomerFound, 
  onCancel 
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCodeChange = (value: string) => {
    const formatted = formatCustomerCodeInput(value);
    setCode(formatted);
    setError(null);
    console.log('📝 Code input changed:', { original: value, formatted, businessId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCustomerCode(code)) {
      setError('Please enter a valid customer code (format: ABC-123-XYZ)');
      return;
    }

    if (!businessId) {
      setError('Business information is missing. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Looking up customer by code:', code, 'for business:', businessId);
      
      const customerData = await findCustomerByCode(code, businessId, supabase);
      
      if (!customerData) {
        console.warn('❌ Customer code not found or not enrolled:', code, 'business:', businessId);
        setError(`Customer code not found or customer is not enrolled in ${businessName}'s loyalty program. Please check the code or ask the customer to join the program first.`);
        setLoading(false);
        return;
      }

      console.log('✅ Customer found and enrolled:', customerData);

      toast({
        title: "Customer Found! ✅",
        description: `${customerData.customerName} is enrolled in ${businessName}'s loyalty program`,
      });

      onCustomerFound(customerData.customerId, customerData.customerName);
      
    } catch (error) {
      console.error('❌ Error looking up customer:', error);
      setError('Error looking up customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValidFormat = code.length === 0 || validateCustomerCode(code);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Keyboard className="w-5 h-5" />
          <span>Enter Customer Code</span>
        </CardTitle>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Enter the customer's loyalty code manually (Format: ABC-123-XYZ)
          </p>
          <div className="flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
            <Building className="w-4 h-4" />
            <span>Checking enrollment for: <strong>{businessName}</strong></span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customer-code">Customer Code</Label>
            <div className="relative mt-1">
              <Input
                id="customer-code"
                type="text"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="ABC-123-XYZ"
                maxLength={11}
                className={`font-mono text-lg tracking-widest text-center uppercase ${
                  !isValidFormat ? 'border-red-300 focus:border-red-500' : ''
                }`}
                disabled={loading}
              />
              <div className="absolute right-3 top-3">
                {code.length > 0 && (
                  isValidFormat ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Format: 3 letters - 3 numbers - 3 letters (e.g., ABC-123-XYZ)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <UserX className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Customer Not Found</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={!validateCustomerCode(code) || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Looking up...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Find Customer
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> The customer must be enrolled in your loyalty program for their code to work. If the code is valid but not found, ask them to join your program first.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualCodeEntry;
