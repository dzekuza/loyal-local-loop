
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, User } from 'lucide-react';

interface CustomerData {
  customerId: string;
  customerName: string;
}

interface CustomerInfoCardProps {
  customer: CustomerData;
  onScanNew: () => void;
  processing: boolean;
}

const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({ 
  customer, 
  onScanNew, 
  processing 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200 flex-1">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Customer Found</p>
              <p className="text-green-700">{customer.customerName}</p>
              <p className="text-xs text-green-600">ID: {customer.customerId.slice(0, 8)}...</p>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={onScanNew}
          disabled={processing}
          className="w-full"
        >
          <User className="w-4 h-4 mr-2" />
          Scan New Customer
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomerInfoCard;
