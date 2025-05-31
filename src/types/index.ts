
export interface Business {
  id: string;
  name: string;
  email: string;
  logo?: string;
  coverImage?: string;
  address?: string;
  phone?: string;
  businessType: string;
  description: string;
  qrCode: string;
  createdAt: Date;
  loyaltyOffers?: LoyaltyOffer[];
}

export interface LoyaltyOffer {
  id: string;
  business_id: string;
  spend_amount: number;
  points_earned: number;
  reward_threshold: number;
  reward_description: string;
  reward_name?: string;
  short_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  walletPasses: string[];
}

export interface UserPoints {
  customerId: string;
  businessId: string;
  totalPoints: number;
  lastActivity: Date;
}

export type UserRole = 'business' | 'customer' | 'admin';
