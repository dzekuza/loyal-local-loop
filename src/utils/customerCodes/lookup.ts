
/**
 * Customer lookup and search functions
 */

import { generateCustomerCode } from './generator';
import { validateCustomerCode } from './validator';
import { CustomerData } from './types';

/**
 * Enhanced function: Find which customer ID generates a specific code
 */
export const findCustomerIdByCode = async (targetCode: string, supabase: any): Promise<string | null> => {
  console.log('🔍 REVERSE LOOKUP: Finding customer ID for code:', targetCode);
  
  if (!validateCustomerCode(targetCode)) {
    console.error('❌ Invalid code format for reverse lookup:', targetCode);
    return null;
  }
  
  try {
    // Get all customer profiles with better error handling
    const { data: allCustomers, error } = await supabase
      .from('profiles')
      .select('id, name, user_role')
      .eq('user_role', 'customer');

    if (error) {
      console.error('❌ Error fetching customers for reverse lookup:', error);
      return null;
    }

    if (!allCustomers || allCustomers.length === 0) {
      console.log('❌ No customers found for reverse lookup');
      return null;
    }

    console.log('🔍 Checking', allCustomers.length, 'customers for reverse lookup...');
    
    // Check each customer with detailed logging
    for (const customer of allCustomers) {
      const generatedCode = generateCustomerCode(customer.id);
      console.log(`🔄 Testing customer ${customer.id} (${customer.name}): generated ${generatedCode}`);
      
      if (generatedCode === targetCode.toUpperCase()) {
        console.log('✅ REVERSE LOOKUP MATCH! Code:', targetCode, 'belongs to customer:', customer.id, 'name:', customer.name);
        return customer.id;
      }
    }

    console.log('❌ REVERSE LOOKUP: No customer found with code:', targetCode);
    console.log('💡 This could mean:');
    console.log('   - The code was entered incorrectly');
    console.log('   - The customer was deleted from the system');
    console.log('   - There is an issue with code generation consistency');
    return null;
  } catch (error) {
    console.error('❌ Error in reverse lookup:', error);
    return null;
  }
};

/**
 * Enhanced customer lookup with better error handling and data validation
 */
export const findCustomerByCode = async (code: string, businessId: string, supabase: any): Promise<CustomerData | null> => {
  try {
    console.log('🔍 ENHANCED LOOKUP: Searching for customer with code:', code, 'for business:', businessId);
    
    if (!businessId) {
      console.error('❌ Business ID is required for customer lookup');
      return null;
    }

    if (!validateCustomerCode(code)) {
      console.error('❌ Invalid code format:', code);
      return null;
    }

    // Step 1: First try reverse lookup to see if this code exists at all
    console.log('🔄 Step 1: Performing reverse lookup to check if code exists...');
    const reverseCustomerId = await findCustomerIdByCode(code, supabase);
    
    if (!reverseCustomerId) {
      console.log('❌ REVERSE LOOKUP FAILED: Code', code, 'does not match any customer in the system');
      return null;
    }

    console.log('✅ REVERSE LOOKUP SUCCESS: Code', code, 'belongs to customer:', reverseCustomerId);

    // Step 2: Get customer profile with better error handling
    const { data: customerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, user_role')
      .eq('id', reverseCustomerId)
      .eq('user_role', 'customer')
      .maybeSingle(); // Use maybeSingle to avoid errors when no data found

    if (profileError) {
      console.error('❌ Error fetching customer profile:', profileError);
      return null;
    }

    if (!customerProfile) {
      console.log('❌ Customer profile not found or not a customer role');
      return null;
    }

    console.log('✅ Customer profile found:', customerProfile);

    // Step 3: Check if this customer is enrolled in the specific business
    console.log('🏢 Step 3: Checking enrollment for customer:', customerProfile.id, 'in business:', businessId);
    
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('user_points')
      .select('customer_id, total_points')
      .eq('customer_id', customerProfile.id)
      .eq('business_id', businessId)
      .maybeSingle();

    if (enrollmentError) {
      console.error('❌ Error checking enrollment:', enrollmentError);
      return null;
    }

    if (!enrollmentData) {
      console.log('❌ Customer found but not enrolled in business');
      console.log('📊 Customer details:');
      console.log('   - ID:', customerProfile.id);
      console.log('   - Name:', customerProfile.name);
      console.log('   - Code:', code);
      console.log('   - Business:', businessId);
      return null;
    }

    console.log('✅ SUCCESS: Customer found and enrolled!');
    console.log('📊 Final result:');
    console.log('   - Customer ID:', customerProfile.id);
    console.log('   - Customer Name:', customerProfile.name);
    console.log('   - Code:', code);
    console.log('   - Points:', enrollmentData.total_points);
    console.log('   - Business:', businessId);
    
    return {
      customerId: customerProfile.id,
      customerName: customerProfile.name || 'Customer'
    };
  } catch (error) {
    console.error('❌ Error finding customer by code:', error);
    return null;
  }
};

/**
 * Check if customer is enrolled in business loyalty program
 */
export const checkCustomerEnrollment = async (customerId: string, businessId: string, supabase: any): Promise<boolean> => {
  try {
    console.log('🔍 Checking enrollment for customer:', customerId, 'in business:', businessId);
    
    const { data, error } = await supabase
      .from('user_points')
      .select('customer_id')
      .eq('customer_id', customerId)
      .eq('business_id', businessId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error checking enrollment:', error);
      return false;
    }

    const isEnrolled = !!data;
    console.log(isEnrolled ? '✅ Customer is enrolled' : '❌ Customer not enrolled');
    return isEnrolled;
  } catch (error) {
    console.error('❌ Error checking customer enrollment:', error);
    return false;
  }
};
