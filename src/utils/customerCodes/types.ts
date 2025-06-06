
/**
 * Type definitions and constants for customer codes
 */

// Characters that are easy to read and type (excluding confusing ones like 0, O, 1, I, l)
export const CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export interface CustomerData {
  customerId: string;
  customerName: string;
}

export interface EnrollmentCheck {
  isEnrolled: boolean;
  points?: number;
}
