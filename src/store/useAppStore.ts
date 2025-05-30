
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Business, LoyaltyOffer, UserRole } from '../types';

interface AppState {
  // Auth state
  currentUser: any | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  
  // Business state
  currentBusiness: Business | null;
  businesses: Business[];
  loyaltyOffers: LoyaltyOffer[];
  
  // Actions
  setUser: (user: any, role: UserRole) => void;
  logout: () => void;
  setCurrentBusiness: (business: Business) => void;
  addBusiness: (business: Business) => void;
  updateBusiness: (business: Business) => void;
  addLoyaltyOffer: (offer: LoyaltyOffer) => void;
  updateLoyaltyOffer: (offer: LoyaltyOffer) => void;
  setBusinesses: (businesses: Business[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      userRole: null,
      isAuthenticated: false,
      currentBusiness: null,
      businesses: [],
      loyaltyOffers: [],

      // Actions
      setUser: (user, role) => {
        console.log('Store: Setting user', { user, role });
        
        // Validate role
        const validRoles: UserRole[] = ['customer', 'business', 'admin'];
        const validatedRole = validRoles.includes(role) ? role : 'customer';
        
        if (role !== validatedRole) {
          console.warn(`Invalid role "${role}" provided, defaulting to "customer"`);
        }
        
        set({ 
          currentUser: user, 
          userRole: validatedRole, 
          isAuthenticated: true 
        });
        
        console.log('Auth state change:', {
          isAuthenticated: true,
          userRole: validatedRole,
          user: user
        });
      },
      
      logout: () => {
        console.log('Store: Logging out user');
        set({ 
          currentUser: null, 
          userRole: null, 
          isAuthenticated: false,
          currentBusiness: null 
        });
        console.log('Auth state change:', {
          isAuthenticated: false,
          userRole: null,
          user: null
        });
      },
      
      setCurrentBusiness: (business) => set({ currentBusiness: business }),
      
      addBusiness: (business) => set((state) => ({ 
        businesses: [...state.businesses, business] 
      })),
      
      updateBusiness: (business) => set((state) => ({
        businesses: state.businesses.map(b => b.id === business.id ? business : b),
        currentBusiness: state.currentBusiness?.id === business.id ? business : state.currentBusiness
      })),
      
      addLoyaltyOffer: (offer) => set((state) => ({ 
        loyaltyOffers: [...state.loyaltyOffers, offer] 
      })),
      
      updateLoyaltyOffer: (offer) => set((state) => ({
        loyaltyOffers: state.loyaltyOffers.map(o => o.id === offer.id ? offer : o)
      })),
      
      setBusinesses: (businesses) => set({ businesses }),
    }),
    {
      name: 'loyalty-app-store',
    }
  )
);
