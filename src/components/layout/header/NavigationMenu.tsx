
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';

const NavigationMenu = () => {
  const { t } = useTranslation();
  const { isAuthenticated, userRole } = useAppStore();

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {(!isAuthenticated || userRole !== 'business') && (
        <Link 
          to="/discover" 
          className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
        >
          {t('nav.discover')}
        </Link>
      )}
      {isAuthenticated && userRole === 'business' && (
        <Link 
          to="/dashboard" 
          className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
        >
          {t('nav.dashboard')}
        </Link>
      )}
    </nav>
  );
};

export default NavigationMenu;
