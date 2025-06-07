
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, CreditCard, User, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from 'react-i18next';

const MobileNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { userRole } = useAppStore();
  const { t } = useTranslation();

  // Show mobile navigation for all users, not just authenticated ones
  const getNavItems = () => {
    if (!user) {
      return [
        {
          href: '/',
          icon: Home,
          label: t('nav.home'),
          active: location.pathname === '/',
        },
        {
          href: '/discover',
          icon: Compass,
          label: t('nav.discover'),
          active: location.pathname === '/discover' || location.pathname === '/businesses',
        },
      ];
    }

    // Business user navigation
    if (userRole === 'business') {
      return [
        {
          href: '/',
          icon: Home,
          label: t('nav.home'),
          active: location.pathname === '/',
        },
        {
          href: '/dashboard',
          icon: Building2,
          label: t('nav.dashboard'),
          active: location.pathname === '/dashboard',
        },
        {
          href: '/business-profile',
          icon: User,
          label: t('nav.profile'),
          active: location.pathname === '/business-profile',
        },
      ];
    }

    // Customer user navigation
    return [
      {
        href: '/main',
        icon: Home,
        label: t('nav.home'),
        active: location.pathname === '/main',
      },
      {
        href: '/discover',
        icon: Compass,
        label: t('nav.discover'),
        active: location.pathname === '/discover' || location.pathname === '/businesses',
      },
      {
        href: '/my-cards',
        icon: CreditCard,
        label: t('nav.myCards'),
        active: location.pathname === '/my-cards' || location.pathname === '/wallet',
      },
      {
        href: '/customer-profile',
        icon: User,
        label: t('nav.profile'),
        active: location.pathname === '/customer-profile',
      },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      {/* Safe area padding for devices with home indicators */}
      <div 
        className="flex w-full"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs transition-all duration-200 min-h-[60px] ${
              item.active
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className={`mb-1 transition-all duration-200 ${
              item.active ? 'w-6 h-6' : 'w-5 h-5'
            }`} />
            <span className={`font-medium text-center leading-tight max-w-full px-1 ${
              item.active ? 'text-xs' : 'text-xs'
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
