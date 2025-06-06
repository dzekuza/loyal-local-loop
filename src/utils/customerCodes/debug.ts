
/**
 * Debug and testing utilities for customer codes
 */

import { generateCustomerCode } from './generator';

/**
 * Debug function: Generate sample codes for testing
 */
export const generateSampleCodes = async (supabase: any, limit: number = 10): Promise<void> => {
  console.log('🧪 GENERATING SAMPLE CODES for debugging...');
  
  try {
    const { data: customers, error } = await supabase
      .from('profiles')
      .select('id, name, user_role')
      .eq('user_role', 'customer')
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching customers for sample codes:', error);
      return;
    }

    if (!customers || customers.length === 0) {
      console.log('❌ No customers found for sample codes');
      return;
    }

    console.log('📋 SAMPLE CUSTOMER CODES:');
    console.log('=' .repeat(50));
    
    customers.forEach((customer, index) => {
      const code = generateCustomerCode(customer.id);
      console.log(`${index + 1}. ${customer.name || 'Unknown'}`);
      console.log(`   ID: ${customer.id}`);
      console.log(`   Code: ${code}`);
      console.log('');
    });
    
    console.log('=' .repeat(50));
  } catch (error) {
    console.error('❌ Error generating sample codes:', error);
  }
};
