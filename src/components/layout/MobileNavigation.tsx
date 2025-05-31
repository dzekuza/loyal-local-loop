
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, CreditCard, User, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

const MobileNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'lt' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Show mobile navigation for all users, not just authenticated ones
  const navItems = [
    {
      href: '/',
      icon: Home,
      label: t('nav.home'),
      active: location.pathname === '/',
    },
    {
      href: '/discover',
      icon: Compass,
      label: 'Discover',
      active: location.pathname === '/discover' || location.pathname === '/businesses',
    },
    ...(user ? [
      {
        href: '/my-cards',
        icon: CreditCard,
        label: 'My Cards',
        active: location.pathname === '/my-cards' || location.pathname === '/wallet',
      },
      {
        href: '/customer-profile',
        icon: User,
        label: t('nav.profile'),
        active: location.pathname === '/customer-profile' || location.pathname === '/business-profile',
      },
    ] : [
      {
        href: '#',
        icon: Globe,
        label: i18n.language.toUpperCase(),
        active: false,
        onClick: toggleLanguage,
      }
    ])
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className={`grid ${user ? 'grid-cols-4' : 'grid-cols-3'}`}>
        {navItems.map((item) => (
          item.onClick ? (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center py-3 px-1 text-xs transition-colors ${
                item.active
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="truncate max-w-full font-medium">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center py-3 px-1 text-xs transition-colors ${
                item.active
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="truncate max-w-full font-medium">{item.label}</span>
            </Link>
          )
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
