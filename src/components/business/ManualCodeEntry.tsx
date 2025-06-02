
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Keyboard, User, CheckCircle, AlertTriangle } from 'lucide-react';
import { validateCustomerCode, formatCustomerCodeInput, findCustomerByCode } from '@/utils/customerCodes';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ManualCodeEntryProps {
  onCustomerFound: (customerId: string, customerName: string) => void;
  onCancel: () => void;
}

const ManualCodeEntry: React.FC<ManualCodeEntryProps> = ({ onCustomerFound, onCancel }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCodeChange = (value: string) => {
    const formatted = formatCustomerCodeInput(value);
    setCode(formatted);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCustomerCode(code)) {
      setError('Please enter a valid customer code (format: ABC-123-XYZ)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Looking up customer by code:', code);
      
      const customerId = await findCustomerByCode(code, supabase);
      
      if (!customerId) {
        setError('Customer code not found. Please check the code and try again.');
        setLoading(false);
        return;
      }

      // Get customer profile info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, id')
        .eq('id', customerId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Error fetching customer information.');
        setLoading(false);
        return;
      }

      const customerName = profile?.name || 'Customer';
      
      console.log('✅ Customer found:', { customerId, customerName });
      
      toast({
        title: "Customer Found! ✅",
        description: `Ready to award points to ${customerName}`,
      });

      onCustomerFound(customerId, customerName);
      
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
        <p className="text-sm text-gray-600">
          Enter the customer's loyalty code manually
        </p>
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
              Format: 3 letters - 3 numbers - 3 letters
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
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
            💡 <strong>Tip:</strong> Ask the customer to show their loyalty card or read their customer code aloud
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualCodeEntry;
