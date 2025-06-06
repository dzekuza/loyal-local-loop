
/**
 * Customer code generation utilities
 */

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
