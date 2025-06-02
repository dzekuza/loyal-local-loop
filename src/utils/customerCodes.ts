
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
 * Find customer by code and verify business enrollment
 * This function checks if the customer with the given code is enrolled in the specified business's loyalty program
 */
export const findCustomerByCode = async (code: string, businessId: string, supabase: any): Promise<{ customerId: string; customerName: string } | null> => {
  try {
    console.log('🔍 Searching for customer with code:', code, 'for business:', businessId);
    
    if (!businessId) {
      console.error('❌ Business ID is required for customer lookup');
      return null;
    }

    // First, get all enrolled customers for this business
    const { data: enrolledCustomers, error: enrollmentError } = await supabase
      .from('user_points')
      .select('customer_id, total_points')
      .eq('business_id', businessId);

    if (enrollmentError) {
      console.error('❌ Error fetching enrolled customers:', enrollmentError);
      return null;
    }

    if (!enrolledCustomers || enrolledCustomers.length === 0) {
      console.log('❌ No customers enrolled in this business:', businessId);
      return null;
    }

    console.log('👥 Found', enrolledCustomers.length, 'enrolled customers to check');

    // Then get profiles for all enrolled customers
    const customerIds = enrolledCustomers.map(ec => ec.customer_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', customerIds);

    if (profilesError) {
      console.error('❌ Error fetching customer profiles:', profilesError);
      return null;
    }

    console.log('👤 Found', profiles?.length || 0, 'customer profiles');

    // Check each enrolled customer to see if their generated code matches
    for (const profile of profiles || []) {
      const generatedCode = generateCustomerCode(profile.id);
      console.log('🔍 Checking customer:', profile.id, 'name:', profile.name, 'generated code:', generatedCode);
      
      if (generatedCode === code.toUpperCase()) {
        console.log('✅ Found matching enrolled customer:', profile.id, 'for code:', code);
        
        return {
          customerId: profile.id,
          customerName: profile.name || 'Customer'
        };
      }
    }

    console.log('❌ No enrolled customer found for code:', code, 'in business:', businessId);
    return null;
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
