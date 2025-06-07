
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/ui/language-switcher';

const AuthButtons = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-3">
      {/* Language switcher for non-authenticated users on desktop only */}
      <div className="hidden md:block">
        <LanguageSwitcher />
      </div>
      
      <Button variant="ghost" size="default" asChild className="font-medium">
        <Link to="/login">{t('nav.signIn')}</Link>
      </Button>
      <Button variant="airbnb" size="default" asChild className="font-semibold">
        <Link to="/register">{t('nav.signUp')}</Link>
      </Button>
    </div>
  );
};

export default AuthButtons;
