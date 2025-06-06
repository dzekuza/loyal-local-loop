
/**
 * Main export file for customer codes utilities
 */

// Re-export all functions to maintain existing API
export { generateCustomerCode } from './generator';
export { validateCustomerCode, formatCustomerCodeInput } from './validator';
export { findCustomerIdByCode, findCustomerByCode, checkCustomerEnrollment } from './lookup';
export { generateSampleCodes } from './debug';
export type { CustomerData, EnrollmentCheck } from './types';
export { CODE_CHARS } from './types';
