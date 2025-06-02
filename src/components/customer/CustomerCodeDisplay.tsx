
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Copy, Check, CreditCard, Info } from 'lucide-react';
import { generateCustomerCode } from '@/utils/customerCodes';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';

interface CustomerCodeDisplayProps {
  customerId: string;
  customerName: string;
  showInstructions?: boolean;
  className?: string;
}

const CustomerCodeDisplay: React.FC<CustomerCodeDisplayProps> = ({ 
  customerId, 
  customerName, 
  showInstructions = true,
  className = "" 
}) => {
  const [codeCopied, setCodeCopied] = useState(false);
  const { toast } = useToast();
  const { userRole } = useAppStore();

  // Only show customer codes for actual customers
  if (userRole !== 'customer') {
    return null;
  }

  const customerCode = generateCustomerCode(customerId);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(customerCode);
      setCodeCopied(true);
      toast({
        title: "Code Copied! 📋",
        description: "Your customer code has been copied to clipboard",
      });
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Your Loyalty Code</span>
        </CardTitle>
        <p className="text-sm text-purple-100">Use this code at participating businesses</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <p className="text-lg font-semibold text-gray-800 mb-2">Welcome, {customerName}!</p>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-300">
            <p className="text-lg font-bold text-green-800 mb-2">
              📱 Your Customer Code
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="bg-white px-6 py-3 rounded-md border-2 border-gray-400 font-mono text-2xl font-bold text-gray-800 tracking-widest shadow-md">
                {customerCode}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="flex items-center space-x-1"
              >
                {codeCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-green-700 mt-2 font-medium">
              💡 Share this code if QR scanning doesn't work
            </p>
          </div>
        </div>

        {showInstructions && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800 mb-2">How to use your loyalty code:</p>
                <ol className="text-sm space-y-1 text-blue-700">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">1.</span>
                    <span>Join a business's loyalty program</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">2.</span>
                    <span>Show your QR code OR share your customer code: <strong>{customerCode}</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">3.</span>
                    <span>Earn points automatically when you make purchases! 🎉</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            💾 Save this code - you'll need it to earn loyalty points at businesses
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerCodeDisplay;
