
export interface Business {
  id: string;
  name: string;
  email: string;
  logo?: string;
  businessType: string;
  description: string;
  qrCode: string;
  createdAt: Date;
}

export interface LoyaltyOffer {
  id: string;
  businessId: string;
  spendAmount: number;
  pointsEarned: number;
  rewardThreshold: number;
  rewardDescription: string;
  rewardImage?: string;
  isActive: boolean;
  createdAt: Date;
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

export type UserRole = 'business' | 'customer';
