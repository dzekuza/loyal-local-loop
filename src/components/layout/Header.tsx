
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { LogOut, User, Building2, Wallet, CreditCard, Globe, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/language-switcher';

const Header = () => {
  const { user, signOut } = useAuth();
  const { isAuthenticated, userRole, currentUser } = useAppStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getProfilePath = () => {
    return userRole === 'business' ? '/business-profile' : '/customer-profile';
  };

  const getUserDisplayName = () => {
    if (currentUser?.name) return currentUser.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'lt' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container-airbnb">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">LoyaltyWallet</span>
          </Link>

          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {(!isAuthenticated || userRole !== 'business') && (
              <Link 
                to="/discover" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                {t('nav.discover')}
              </Link>
            )}
            {isAuthenticated && userRole === 'customer' && (
              <Link 
                to="/my-cards" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                {t('nav.myCards')}
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

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language switcher for non-authenticated users on desktop only */}
            {!isAuthenticated && <div className="hidden md:block"><LanguageSwitcher /></div>}
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full border-2 border-gray-200 hover:border-gray-300 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser?.avatar_url} alt={getUserDisplayName()} />
                      <AvatarFallback className="bg-gradient-to-br from-red-500 to-pink-500 text-white font-semibold">
                        {getUserDisplayName().charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-white border border-gray-200 shadow-airbnb rounded-2xl p-2" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-4 border-b border-gray-100">
                    <p className="text-base font-semibold leading-none text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-sm leading-none text-gray-500">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded-full inline-block mt-2 w-fit">
                      {userRole} account
                    </p>
                  </div>
                  
                  <div className="py-2">
                    <DropdownMenuItem asChild>
                      <Link to={getProfilePath()} className="cursor-pointer flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                        <User className="mr-3 h-4 w-4" />
                        <span>{t('nav.profile')}</span>
                      </Link>
                    </DropdownMenuItem>

                    {userRole === 'business' && (
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                          <Building2 className="mr-3 h-4 w-4" />
                          <span>{t('nav.dashboard')}</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {userRole === 'customer' && (
                      <DropdownMenuItem asChild>
                        <Link to="/my-cards" className="cursor-pointer flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                          <Wallet className="mr-3 h-4 w-4" />
                          <span>{t('nav.myCards')}</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <DropdownMenuItem onClick={toggleLanguage} className="cursor-pointer flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                      <Globe className="mr-3 h-4 w-4" />
                      <span>Language: {i18n.language === 'en' ? 'English' : 'Lietuvių'}</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>{t('nav.signOut')}</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="default" asChild className="font-medium">
                  <Link to="/login">{t('nav.signIn')}</Link>
                </Button>
                <Button variant="airbnb" size="default" asChild className="font-semibold">
                  <Link to="/register">{t('nav.signUp')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
