
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Store, CreditCard, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

const MobileNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      active: location.pathname === '/',
    },
    {
      href: '/businesses',
      icon: Store,
      label: t('nav.businesses'),
      active: location.pathname === '/businesses',
    },
    {
      href: '/wallet',
      icon: CreditCard,
      label: t('nav.wallet'),
      active: location.pathname === '/wallet',
    },
    {
      href: '/profile',
      icon: User,
      label: t('nav.profile'),
      active: location.pathname === '/profile',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="grid grid-cols-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors ${
              item.active
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="truncate max-w-full">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
