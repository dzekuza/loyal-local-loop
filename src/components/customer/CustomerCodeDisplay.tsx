
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
      className="w-full py-8 px-6 border-2 border-gray-200 rounded-lg"
      style={{ background: 'linear-gradient(90deg, #EF4549 0%, #ED4890 100%)' }}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-2 gap-6 items-center">
          {/* Left Column - Logo and Heading */}
          <div className="flex items-center space-x-3">
            <img 
              src="https://eghaglafhlqajdktorjb.supabase.co/storage/v1/object/sign/files/loyablee%20logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNzdkNmM5OS0yOWE0LTRkNzEtYTViOS0yNmFkYjRjMDRlYWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmaWxlcy9sb3lhYmxlZSBsb2dvLnBuZyIsImlhdCI6MTc0OTMxNDM1MywiZXhwIjoxNzQ5OTE5MTUzfQ.1H5sEQPDIPw5O-zdzDgLUEt_VM4KLpYIFH_0BKXx3PE"
              alt="Loyable Logo"
              className="w-8 h-8 object-contain"
            />
            <p className="text-lg font-bold text-white">
              Your Customer Code
            </p>
          </div>
          
          {/* Right Column - Code and Copy Button */}
          <div className="flex items-center justify-end space-x-3">
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
    </div>
  );
};

export default CustomerCodeDisplay;
