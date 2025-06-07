
import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import Logo from './header/Logo';
import SearchBar from './header/SearchBar';
import NavigationMenu from './header/NavigationMenu';
import UserMenu from './header/UserMenu';
import AuthButtons from './header/AuthButtons';

const Header = () => {
  const { isAuthenticated, userRole } = useAppStore();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container-airbnb">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo />

          {/* Center Search - Only for authenticated customers */}
          {isAuthenticated && userRole === 'customer' && <SearchBar />}

          {/* Center Navigation - Desktop (for non-customers or business) */}
          {(!isAuthenticated || userRole === 'business') && <NavigationMenu />}

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? <UserMenu /> : <AuthButtons />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
