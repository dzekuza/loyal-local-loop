
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Keyboard, User, CheckCircle, AlertTriangle, UserX, Building, Users, Copy, Check } from 'lucide-react';
import { validateCustomerCode, formatCustomerCodeInput, findCustomerByCode, generateCustomerCode } from '@/utils/customerCodes';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DebugPanel from './DebugPanel';

interface ManualCodeEntryProps {
  businessId: string;
  businessName: string;
  onCustomerFound: (customerId: string, customerName: string) => void;
  onCancel: () => void;
}

interface EnrolledCustomer {
  id: string;
  name: string;
  code: string;
  points: number;
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
  const [enrolledCustomers, setEnrolledCustomers] = useState<EnrolledCustomer[]>([]);
  const [showEnrolledCustomers, setShowEnrolledCustomers] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCodeChange = (value: string) => {
    const formatted = formatCustomerCodeInput(value);
    setCode(formatted);
    setError(null);
    setDebugInfo(null);
    console.log('📝 Code input changed:', { original: value, formatted, businessId });
  };

  const loadEnrolledCustomers = async () => {
    setLoadingCustomers(true);
    try {
      console.log('👥 Loading enrolled customers for business:', businessId);
      
      // Get enrolled customers with improved query
      const { data: enrolledData, error: enrollmentError } = await supabase
        .from('user_points')
        .select('customer_id, total_points')
        .eq('business_id', businessId);

      if (enrollmentError) {
        console.error('❌ Error fetching enrolled customers:', enrollmentError);
        return;
      }

      if (!enrolledData || enrolledData.length === 0) {
        console.log('📊 No customers enrolled in this business yet');
        setEnrolledCustomers([]);
        return;
      }

      // Get customer IDs
      const customerIds = enrolledData.map(item => item.customer_id);
      console.log('👥 Found', customerIds.length, 'enrolled customer IDs:', customerIds);

      // Fetch profiles with better error handling - include customers with incomplete profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, user_role')
        .in('id', customerIds);

      if (profilesError) {
        console.error('❌ Error fetching customer profiles:', profilesError);
        return;
      }

      console.log('👤 Retrieved', profilesData?.length || 0, 'profiles:', profilesData);

      // Combine the data and handle missing or incomplete profiles
      const customers: EnrolledCustomer[] = enrolledData.map(enrollment => {
        const profile = profilesData?.find(p => p.id === enrollment.customer_id);
        
        // Handle cases where profile might be missing or incomplete
        const customerName = profile?.name || 'Customer (Incomplete Profile)';
        const code = generateCustomerCode(enrollment.customer_id);
        
        console.log(`👤 Processing customer ${enrollment.customer_id}:`, {
          profile,
          customerName,
          code,
          points: enrollment.total_points
        });
        
        return {
          id: enrollment.customer_id,
          name: customerName,
          code,
          points: enrollment.total_points
        };
      });

      // Filter out customers with invalid roles only if profile exists
      const validCustomers = customers.filter(customer => {
        const profile = profilesData?.find(p => p.id === customer.id);
        
        // Include customers without profiles (they might be valid but incomplete)
        if (!profile) {
          console.log(`⚠️ Customer ${customer.id} has no profile, including anyway`);
          return true;
        }
        
        // Only exclude if profile exists but role is not customer
        if (profile.user_role && profile.user_role !== 'customer') {
          console.log(`❌ Excluding ${customer.id} - wrong role: ${profile.user_role}`);
          return false;
        }
        
        return true;
      });

      setEnrolledCustomers(validCustomers);
      console.log('✅ Loaded', validCustomers.length, 'enrolled customers (including incomplete profiles)');
    } catch (error) {
      console.error('❌ Error loading enrolled customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
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
    setDebugInfo(null);

    try {
      console.log('🔍 Looking up customer by code:', code, 'for business:', businessId);
      
      const customerData = await findCustomerByCode(code, businessId, supabase);
      
      if (!customerData) {
        console.warn('❌ Customer code not found or not enrolled:', code, 'business:', businessId);
        
        // Provide detailed debug information
        setDebugInfo(`Detailed diagnosis for code "${code}":
        
1. ✅ Code format is valid
2. 🔍 Checking if code exists in system...
3. 🏢 Checking enrollment in "${businessName}"
4. ❌ Result: Code not found or customer not enrolled

This could mean:
• The code was entered incorrectly
• The customer is not registered in the system  
• The customer exists but is not enrolled in your loyalty program
• There is a mismatch in code generation

Use the Debug Panel below to investigate further.`);

        setError(`Customer code "${code}" not found or customer is not enrolled in ${businessName}'s loyalty program. Please check the code or ask the customer to join the program first.`);
        setLoading(false);
        return;
      }

      console.log('✅ Customer found and verified:', customerData);

      toast({
        title: "Customer Found! ✅",
        description: `${customerData.customerName} is enrolled in ${businessName}'s loyalty program`,
      });

      onCustomerFound(customerData.customerId, customerData.customerName);
      
    } catch (error) {
      console.error('❌ Error looking up customer:', error);
      setError('Error looking up customer. Please try again.');
      setDebugInfo(`System error occurred during lookup. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (customerCode: string) => {
    try {
      await navigator.clipboard.writeText(customerCode);
      setCopiedCode(customerCode);
      toast({
        title: "Code Copied! 📋",
        description: "Customer code copied to clipboard",
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  const handleSelectCustomer = (customer: EnrolledCustomer) => {
    setCode(customer.code);
    setShowEnrolledCustomers(false);
    toast({
      title: "Customer Selected",
      description: `${customer.name}'s code has been entered`,
    });
  };

  const isValidFormat = code.length === 0 || validateCustomerCode(code);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5" />
            <span>Enter Customer Code</span>
          </CardTitle>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Enter any customer's loyalty code (Format: ABC-123-XYZ). The system will find the customer and check if they're enrolled in your program.
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

            {debugInfo && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Debug Information</p>
                    <pre className="text-xs text-yellow-700 mt-1 whitespace-pre-wrap font-mono">
                      {debugInfo}
                    </pre>
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
              💡 <strong>How it works:</strong> Enter any customer's code. The system will find the customer in the database and check if they're enrolled in your loyalty program.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Debug Panel */}
      <DebugPanel businessId={businessId} businessName={businessName} />

      {/* Enhanced Enrolled Customers Helper */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Enrolled Customers</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!showEnrolledCustomers) {
                  loadEnrolledCustomers();
                }
                setShowEnrolledCustomers(!showEnrolledCustomers);
              }}
              disabled={loadingCustomers}
            >
              {loadingCustomers ? 'Loading...' : showEnrolledCustomers ? 'Hide' : 'Show'}
            </Button>
          </CardTitle>
          <p className="text-sm text-gray-600">
            View customers enrolled in your loyalty program and their codes (including customers with incomplete profiles)
          </p>
        </CardHeader>
        {showEnrolledCustomers && (
          <CardContent>
            {enrolledCustomers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No customers enrolled yet.</p>
                <p className="text-sm text-gray-400">Ask customers to join your loyalty program first.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {enrolledCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.points} points</p>
                      <p className="text-xs text-gray-400">ID: {customer.id.slice(0, 8)}...</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {customer.code}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCode(customer.code)}
                      >
                        {copiedCode === customer.code ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {enrolledCustomers.length > 0 && (
              <div className="mt-4 p-2 bg-green-50 rounded border border-green-200">
                <p className="text-xs text-green-800">
                  ✅ Found {enrolledCustomers.length} enrolled customers. Some may have incomplete profiles but are still valid for transactions.
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ManualCodeEntry;
