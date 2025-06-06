
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bug, Code, Search, Users } from 'lucide-react';
import { generateSampleCodes, findCustomerIdByCode, generateCustomerCode } from '@/utils/customerCodes';
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
      // Capture console.log output
      const originalLog = console.log;
      const logs: string[] = [];
      
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };

      await generateSampleCodes(supabase, 5);
      
      // Restore console.log
      console.log = originalLog;
      
      logs.forEach(log => addDebugOutput(log));
      addDebugOutput('Sample codes generated! Check console for details.');
    } catch (error) {
      addDebugOutput(`Error generating sample codes: ${error}`);
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
        
        // Generate the code for this customer to verify
        const generatedCode = generateCustomerCode(customerId);
        addDebugOutput(`🔄 Generated code for this customer: ${generatedCode}`);
        
        if (generatedCode === testCode) {
          addDebugOutput('✅ Code generation is consistent!');
        } else {
          addDebugOutput(`❌ Code mismatch! Expected: ${testCode}, Got: ${generatedCode}`);
        }
      } else {
        addDebugOutput(`❌ No customer found with code: ${testCode}`);
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
      
      // Get customer details and codes
      for (const enrollment of enrolledData.slice(0, 5)) { // Limit to 5 for debugging
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', enrollment.customer_id)
          .single();

        if (!profileError && profile) {
          const code = generateCustomerCode(profile.id);
          addDebugOutput(`   • ${profile.name}: ${code} (${enrollment.total_points} pts)`);
        }
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
            <span>Debug Panel</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
          <strong>Debug Tools:</strong> Use these tools to diagnose customer code issues. 
          Check the console for detailed logs during code generation and lookup.
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
