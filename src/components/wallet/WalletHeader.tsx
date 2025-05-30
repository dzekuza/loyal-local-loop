
import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Plus, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/language-switcher';

interface WalletHeaderProps {
  onBack: () => void;
  onAddCards: () => void;
}

const WalletHeader: React.FC<WalletHeaderProps> = ({ onBack, onAddCards }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('wallet.backToBusinesses')}</span>
        </Button>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Button onClick={onAddCards} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>{t('wallet.addCards')}</span>
          </Button>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
          <Wallet className="w-8 h-8" />
          <span>{t('wallet.title')}</span>
        </h1>
        <p className="text-gray-600">
          {t('wallet.description')}
        </p>
      </div>
    </>
  );
};

export default WalletHeader;
