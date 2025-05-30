
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyWalletStateProps {
  onExploreBusinesses: () => void;
}

const EmptyWalletState: React.FC<EmptyWalletStateProps> = ({ onExploreBusinesses }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="text-center py-12">
        <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('wallet.noCards')}</h3>
        <p className="text-gray-600 mb-4">
          {t('wallet.noCardsDescription')}
        </p>
        <Button onClick={onExploreBusinesses}>
          {t('wallet.exploreBusinesses')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyWalletState;
