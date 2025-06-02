
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
 * NEW LOGIC: Find customer by code and verify business enrollment
 * Step 1: Find which customer ID generates the given code
 * Step 2: Check if that customer is enrolled in the specified business
 */
export const findCustomerByCode = async (code: string, businessId: string, supabase: any): Promise<{ customerId: string; customerName: string } | null> => {
  try {
    console.log('🔍 NEW LOOKUP: Searching for customer with code:', code, 'for business:', businessId);
    
    if (!businessId) {
      console.error('❌ Business ID is required for customer lookup');
      return null;
    }

    // Step 1: Get ALL customer profiles (only customers, not businesses)
    const { data: allCustomers, error: customersError } = await supabase
      .from('profiles')
      .select('id, name, user_role')
      .eq('user_role', 'customer');

    if (customersError) {
      console.error('❌ Error fetching customer profiles:', customersError);
      return null;
    }

    if (!allCustomers || allCustomers.length === 0) {
      console.log('❌ No customers found in the system');
      return null;
    }

    console.log('👥 Found', allCustomers.length, 'total customers in system');

    // Step 2: Generate codes for all customers and find the matching one
    let matchingCustomer = null;
    for (const customer of allCustomers) {
      const generatedCode = generateCustomerCode(customer.id);
      console.log('🔍 Checking customer:', customer.id, 'name:', customer.name, 'generated code:', generatedCode);
      
      if (generatedCode === code.toUpperCase()) {
        console.log('✅ Found customer with matching code:', customer.id, 'for code:', code);
        matchingCustomer = customer;
        break;
      }
    }

    if (!matchingCustomer) {
      console.log('❌ No customer found with code:', code);
      return null;
    }

    // Step 3: Check if this customer is enrolled in the specific business
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('user_points')
      .select('customer_id')
      .eq('customer_id', matchingCustomer.id)
      .eq('business_id', businessId)
      .single();

    if (enrollmentError && enrollmentError.code === 'PGRST116') {
      console.log('❌ Customer found but not enrolled in business:', matchingCustomer.id, 'business:', businessId);
      return null;
    }

    if (enrollmentError) {
      console.error('❌ Error checking enrollment:', enrollmentError);
      return null;
    }

    console.log('✅ Customer found and enrolled:', matchingCustomer.id, 'in business:', businessId);
    
    return {
      customerId: matchingCustomer.id,
      customerName: matchingCustomer.name || 'Customer'
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
      .single();

    if (error && error.code === 'PGRST116') {
      console.log('❌ Customer not enrolled:', customerId, 'in business:', businessId);
      return false;
    }

    if (error) {
      console.error('❌ Error checking enrollment:', error);
      return false;
    }

    console.log('✅ Customer is enrolled:', customerId, 'in business:', businessId);
    return true;
  } catch (error) {
    console.error('❌ Error checking customer enrollment:', error);
    return false;
  }
};
