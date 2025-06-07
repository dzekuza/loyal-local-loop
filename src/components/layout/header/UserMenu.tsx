
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { LogOut, User, Building2, Wallet, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { userRole, currentUser } = useAppStore();
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
    <div className="flex items-center space-x-3">
      {/* Cards Icon - Only for customers */}
      {userRole === 'customer' && (
        <Button variant="ghost" size="icon" asChild className="relative">
          <Link to="/my-cards">
            <Wallet className="w-5 h-5" />
          </Link>
        </Button>
      )}
      
      {/* Profile Dropdown */}
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
    </div>
  );
};

export default UserMenu;
