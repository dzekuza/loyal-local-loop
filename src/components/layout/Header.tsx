
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
import { LogOut, User, Settings, Building2, Wallet, CreditCard, Globe } from 'lucide-react';
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
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/businesses" className="text-gray-600 hover:text-gray-900 transition-colors">
              {t('nav.businesses')}
            </Link>
            {isAuthenticated && userRole === 'customer' && (
              <Link to="/wallet" className="text-gray-600 hover:text-gray-900 transition-colors">
                {t('nav.wallet')}
              </Link>
            )}
            {isAuthenticated && userRole === 'business' && (
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
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
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser?.avatar_url} alt={getUserDisplayName()} />
                      <AvatarFallback>
                        {getUserDisplayName().charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white z-50" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {userRole} account
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link to={getProfilePath()} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('nav.profile')}</span>
                    </Link>
                  </DropdownMenuItem>

                  {userRole === 'business' && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>{t('nav.dashboard')}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {userRole === 'customer' && (
                    <DropdownMenuItem asChild>
                      <Link to="/wallet" className="cursor-pointer">
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>{t('nav.wallet')}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  
                  {/* Language switcher in dropdown for authenticated users */}
                  <DropdownMenuItem onClick={toggleLanguage} className="cursor-pointer">
                    <Globe className="mr-2 h-4 w-4" />
                    <span>Language: {i18n.language === 'en' ? 'English' : 'Lietuvių'}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('nav.signOut')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">{t('nav.signIn')}</Link>
                </Button>
                <Button asChild>
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
