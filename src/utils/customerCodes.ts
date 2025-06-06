
/**
 * Utility functions for generating and validating customer loyalty codes
 */

// Characters that are easy to read and type (excluding confusing ones like 0, O, 1, I, l)
const CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generate a readable customer code from user ID
 * Format: ABC-123-XYZ (3 letters - 3 numbers - 3 letters)
 */
export const generateCustomerCode = (userId: string): string => {
  console.log('🔢 Generating customer code for userId:', userId);
  
  // Use a simple hash of the user ID to ensure consistency
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Make hash positive
  hash = Math.abs(hash);
  
  // Generate code parts - fixed algorithm for consistency
  const part1 = generateCodePart(hash, 3, true); // Letters
  const part2 = generateCodePart(hash >> 8, 3, false); // Numbers
  const part3 = generateCodePart(hash >> 16, 3, true); // Letters
  
  const code = `${part1}-${part2}-${part3}`;
  console.log('✅ Generated customer code:', code, 'for userId:', userId);
  return code;
};

/**
 * Generate a part of the customer code with deterministic algorithm
 */
const generateCodePart = (seed: number, length: number, letters: boolean): string => {
  let result = '';
  let current = Math.abs(seed);
  
  const chars = letters ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : '23456789'; // Consistent character sets
  
  for (let i = 0; i < length; i++) {
    result += chars[current % chars.length];
    current = Math.floor(current / chars.length) + (i + 1); // Add deterministic increment
  }
  
  return result;
};

/**
 * Validate customer code format
 */
export const validateCustomerCode = (code: string): boolean => {
  const pattern = /^[A-Z]{3}-[0-9]{3}-[A-Z]{3}$/;
  const isValid = pattern.test(code.toUpperCase());
  console.log('✓ Validating customer code:', code, 'valid:', isValid);
  return isValid;
};

/**
 * Format customer code input (auto-add dashes)
 */
export const formatCustomerCodeInput = (input: string): string => {
  // Remove all non-alphanumeric characters
  const clean = input.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // Add dashes at appropriate positions
  if (clean.length <= 3) {
    return clean;
  } else if (clean.length <= 6) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  } else {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 9)}`;
  }
};

/**
 * Debug function: Find which customer ID generates a specific code
 */
export const findCustomerIdByCode = async (targetCode: string, supabase: any): Promise<string | null> => {
  console.log('🔍 REVERSE LOOKUP: Finding customer ID for code:', targetCode);
  
  try {
    // Get all customer profiles
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

    for (const customer of allCustomers) {
      const generatedCode = generateCustomerCode(customer.id);
      if (generatedCode === targetCode.toUpperCase()) {
        console.log('✅ REVERSE LOOKUP MATCH! Code:', targetCode, 'belongs to customer:', customer.id, 'name:', customer.name);
        return customer.id;
      }
    }

    console.log('❌ REVERSE LOOKUP: No customer found with code:', targetCode);
    return null;
  } catch (error) {
    console.error('❌ Error in reverse lookup:', error);
    return null;
  }
};

/**
 * Enhanced customer lookup with comprehensive debugging
 */
export const findCustomerByCode = async (code: string, businessId: string, supabase: any): Promise<{ customerId: string; customerName: string } | null> => {
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
      console.log('💡 This means either:');
      console.log('   1. The code was entered incorrectly');
      console.log('   2. The customer is not registered in the system');
      console.log('   3. There is an issue with the code generation algorithm');
      return null;
    }

    console.log('✅ REVERSE LOOKUP SUCCESS: Code', code, 'belongs to customer:', reverseCustomerId);

    // Step 2: Get customer profile
    const { data: customerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, user_role')
      .eq('id', reverseCustomerId)
      .eq('user_role', 'customer')
      .single();

    if (profileError) {
      console.error('❌ Error fetching customer profile:', profileError);
      return null;
    }

    if (!customerProfile) {
      console.log('❌ Customer profile not found or not a customer');
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
      console.log('💡 Customer needs to join this business\'s loyalty program first');
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
