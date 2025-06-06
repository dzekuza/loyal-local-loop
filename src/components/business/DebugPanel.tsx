
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bug, Code, Search, Users, TestTube } from 'lucide-react';
import { generateSampleCodes, findCustomerIdByCode, generateCustomerCode, testCodeGeneration } from '@/utils/customerCodes';
import { supabase } from '@/integrations/supabase/client';

interface DebugPanelProps {
  businessId: string;
  businessName: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ businessId, businessName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [debugOutput, setDebugOutput] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addDebugOutput = (message: string) => {
    setDebugOutput(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleGenerateSampleCodes = async () => {
    setLoading(true);
    addDebugOutput('Generating sample customer codes...');
    
    try {
      const originalLog = console.log;
      const logs: string[] = [];
      
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };

      await generateSampleCodes(supabase, 5);
      
      console.log = originalLog;
      
      logs.forEach(log => addDebugOutput(log));
      addDebugOutput('Sample codes generated! Check console for details.');
    } catch (error) {
      addDebugOutput(`Error generating sample codes: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCodeConsistency = async () => {
    setLoading(true);
    addDebugOutput('Testing code generation consistency...');
    
    try {
      // Get a few customer IDs to test
      const { data: customers, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('user_role', 'customer')
        .limit(3);

      if (error) {
        addDebugOutput(`Error fetching customers: ${error.message}`);
        return;
      }

      if (!customers || customers.length === 0) {
        addDebugOutput('No customers found for consistency testing');
        return;
      }

      addDebugOutput(`Testing ${customers.length} customers for code consistency:`);
      
      for (const customer of customers) {
        const test = testCodeGeneration(customer.id);
        const isConsistent = test.code === test.verification;
        
        addDebugOutput(`Customer ${customer.name} (${customer.id}):`);
        addDebugOutput(`  Generated: ${test.code}`);
        addDebugOutput(`  Verified:  ${test.verification}`);
        addDebugOutput(`  Consistent: ${isConsistent ? '✅ YES' : '❌ NO'}`);
        
        if (!isConsistent) {
          addDebugOutput(`  ⚠️ INCONSISTENCY DETECTED for customer ${customer.id}`);
        }
      }
    } catch (error) {
      addDebugOutput(`Error testing code consistency: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestReverseCodeLookup = async () => {
    const testCode = 'CWZ-765-ERS';
    setLoading(true);
    addDebugOutput(`Testing reverse lookup for code: ${testCode}`);
    
    try {
      const customerId = await findCustomerIdByCode(testCode, supabase);
      if (customerId) {
        addDebugOutput(`✅ Found customer ID: ${customerId}`);
        
        const generatedCode = generateCustomerCode(customerId);
        addDebugOutput(`🔄 Generated code for this customer: ${generatedCode}`);
        
        if (generatedCode === testCode) {
          addDebugOutput('✅ Code generation is consistent!');
        } else {
          addDebugOutput(`❌ Code mismatch! Expected: ${testCode}, Got: ${generatedCode}`);
        }
      } else {
        addDebugOutput(`❌ No customer found with code: ${testCode}`);
        addDebugOutput('💡 Let me check what codes actually exist...');
        
        // Show what codes are actually generated
        const { data: customers, error } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('user_role', 'customer')
          .limit(5);
          
        if (customers && customers.length > 0) {
          addDebugOutput('📋 Here are the first 5 actual customer codes:');
          customers.forEach(customer => {
            const actualCode = generateCustomerCode(customer.id);
            addDebugOutput(`  ${customer.name}: ${actualCode}`);
          });
        }
      }
    } catch (error) {
      addDebugOutput(`Error in reverse lookup: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEnrolledCustomers = async () => {
    setLoading(true);
    addDebugOutput(`Checking enrolled customers for business: ${businessName}`);
    
    try {
      const { data: enrolledData, error } = await supabase
        .from('user_points')
        .select('customer_id, total_points')
        .eq('business_id', businessId);

      if (error) {
        addDebugOutput(`❌ Error fetching enrolled customers: ${error.message}`);
        return;
      }

      if (!enrolledData || enrolledData.length === 0) {
        addDebugOutput('❌ No customers enrolled in this business');
        return;
      }

      addDebugOutput(`📊 Found ${enrolledData.length} enrolled customers:`);
      
      // Get customer details and codes with better error handling
      for (const enrollment of enrolledData.slice(0, 5)) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, user_role')
          .eq('id', enrollment.customer_id)
          .maybeSingle();

        const code = generateCustomerCode(enrollment.customer_id);
        
        if (profileError) {
          addDebugOutput(`   • Customer ${enrollment.customer_id}: ${code} (${enrollment.total_points} pts) - Profile Error: ${profileError.message}`);
        } else if (!profile) {
          addDebugOutput(`   • Customer ${enrollment.customer_id}: ${code} (${enrollment.total_points} pts) - No Profile Found`);
        } else {
          addDebugOutput(`   • ${profile.name || 'No Name'} (${profile.user_role || 'No Role'}): ${code} (${enrollment.total_points} pts)`);
        }
      }
      
      if (enrolledData.length > 5) {
        addDebugOutput(`   ... and ${enrolledData.length - 5} more customers`);
      }
    } catch (error) {
      addDebugOutput(`Error checking enrolled customers: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearDebugOutput = () => {
    setDebugOutput([]);
  };

  if (!isExpanded) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-2"
          >
            <Bug className="w-4 h-4" />
            <span>Debug Customer Codes</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bug className="w-5 h-5 text-orange-600" />
            <span>Enhanced Debug Panel</span>
            <Badge variant="outline">Development</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            Hide
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSampleCodes}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Code className="w-4 h-4" />
            <span>Sample Codes</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestCodeConsistency}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <TestTube className="w-4 h-4" />
            <span>Test Consistency</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestReverseCodeLookup}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Test CWZ-765-ERS</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckEnrolledCustomers}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Enrolled Customers</span>
          </Button>
        </div>

        {debugOutput.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Debug Output:</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={clearDebugOutput}
              >
                Clear
              </Button>
            </div>
            <div className="bg-black text-green-400 p-3 rounded text-xs font-mono max-h-64 overflow-y-auto">
              {debugOutput.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
          <strong>Enhanced Debug Tools:</strong> Test code generation consistency, reverse lookup functionality, and enrolled customer queries. 
          The "Test Consistency" button will verify that codes are generated the same way every time.
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
