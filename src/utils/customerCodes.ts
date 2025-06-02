
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
  // Use a simple hash of the user ID to ensure consistency
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Make hash positive
  hash = Math.abs(hash);
  
  // Generate code parts
  const part1 = generateCodePart(hash, 3, true); // Letters
  const part2 = generateCodePart(hash >> 8, 3, false); // Numbers
  const part3 = generateCodePart(hash >> 16, 3, true); // Letters
  
  return `${part1}-${part2}-${part3}`;
};

/**
 * Generate a part of the customer code
 */
const generateCodePart = (seed: number, length: number, letters: boolean): string => {
  let result = '';
  let current = seed;
  
  const chars = letters ? CODE_CHARS.slice(10) : '23456789'; // Letters or numbers only
  
  for (let i = 0; i < length; i++) {
    result += chars[current % chars.length];
    current = Math.floor(current / chars.length) + 1;
  }
  
  return result;
};

/**
 * Validate customer code format
 */
export const validateCustomerCode = (code: string): boolean => {
  const pattern = /^[A-Z]{3}-[0-9]{3}-[A-Z]{3}$/;
  return pattern.test(code.toUpperCase());
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
 * Find customer by code (searches through existing customers)
 * This is a helper function that can be used with Supabase
 */
export const findCustomerByCode = async (code: string, supabase: any): Promise<string | null> => {
  try {
    // Get all user profiles to check their generated codes
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_role', 'customer');

    if (error) {
      console.error('Error fetching profiles:', error);
      return null;
    }

    // Check each profile to see if their generated code matches
    for (const profile of profiles || []) {
      const generatedCode = generateCustomerCode(profile.id);
      if (generatedCode === code.toUpperCase()) {
        return profile.id;
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding customer by code:', error);
    return null;
  }
};
