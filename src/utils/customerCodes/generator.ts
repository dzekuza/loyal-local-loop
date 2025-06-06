
/**
 * Customer code generation utilities
 */

import { CODE_CHARS } from './types';

/**
 * Generate a readable customer code from user ID
 * Format: ABC-123-XYZ (3 letters - 3 numbers - 3 letters)
 */
export const generateCustomerCode = (userId: string): string => {
  console.log('🔢 Generating customer code for userId:', userId);
  
  if (!userId || typeof userId !== 'string') {
    console.error('❌ Invalid userId provided to generateCustomerCode:', userId);
    return 'ERR-000-ERR';
  }
  
  // Use a more deterministic hash of the user ID to ensure consistency
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Make hash positive and ensure it's consistent
  hash = Math.abs(hash);
  console.log('🔨 Hash calculated for userId:', userId, 'hash:', hash);
  
  // Generate code parts with improved deterministic algorithm
  const part1 = generateCodePart(hash, 3, true); // Letters
  const part2 = generateCodePart(hash >> 8, 3, false); // Numbers
  const part3 = generateCodePart(hash >> 16, 3, true); // Letters
  
  const code = `${part1}-${part2}-${part3}`;
  console.log('✅ Generated customer code:', code, 'for userId:', userId);
  
  // Verify the code is valid format
  if (!/^[A-Z]{3}-[0-9]{3}-[A-Z]{3}$/.test(code)) {
    console.error('❌ Generated invalid code format:', code);
    return 'ERR-000-ERR';
  }
  
  return code;
};

/**
 * Generate a part of the customer code with improved deterministic algorithm
 */
const generateCodePart = (seed: number, length: number, letters: boolean): string => {
  let result = '';
  let current = Math.abs(seed);
  
  const chars = letters ? CODE_CHARS.replace(/[0-9]/g, '') : CODE_CHARS.replace(/[A-Z]/g, '');
  console.log('🎯 Using character set:', chars, 'for', letters ? 'letters' : 'numbers');
  
  // Ensure we have enough characters
  if (chars.length === 0) {
    console.error('❌ No characters available for generation');
    return letters ? 'ERR' : '000';
  }
  
  for (let i = 0; i < length; i++) {
    const index = current % chars.length;
    result += chars[index];
    // Use a more deterministic progression
    current = Math.floor(current / chars.length) + (seed * (i + 1));
    if (current === 0) current = seed + i + 1; // Prevent zero progression
  }
  
  console.log('🔧 Generated part:', result, 'from seed:', seed);
  return result;
};

/**
 * Test code generation for debugging
 */
export const testCodeGeneration = (userId: string): { userId: string; code: string; verification: string } => {
  const code = generateCustomerCode(userId);
  const verification = generateCustomerCode(userId); // Generate again to verify consistency
  
  return {
    userId,
    code,
    verification
  };
};
