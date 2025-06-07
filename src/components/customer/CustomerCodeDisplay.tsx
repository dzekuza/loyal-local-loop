
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Copy, Check } from 'lucide-react';
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
    <div 
      className="w-full py-8 px-4"
      style={{ background: 'linear-gradient(90deg, #EF4549 0%, #ED4890 100%)' }}
    >
      <div className="container mx-auto text-center">
        <p className="text-lg font-bold text-white mb-4">
          📱 Your Customer Code
        </p>
        <div className="flex items-center justify-center space-x-3">
          <div className="bg-white px-6 py-3 rounded-md border-2 border-gray-400 font-mono text-2xl font-bold text-gray-800 tracking-widest shadow-md">
            {customerCode}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="flex items-center space-x-1 bg-white hover:bg-gray-50"
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
      </div>
    </div>
  );
};

export default CustomerCodeDisplay;
