
export interface ComingSoonBusiness {
  id: string;
  business_name: string;
  logo?: string;
  business_type: string;
  description?: string;
  created_at: string;
}

export interface BusinessClaim {
  id: string;
  coming_soon_business_id: string;
  email: string;
  first_name: string;
  last_name: string;
  message?: string;
  status: string;
  created_at: string;
}
