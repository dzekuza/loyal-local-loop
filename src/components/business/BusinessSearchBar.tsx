
import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BusinessSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onFilterToggle?: () => void;
  showSpecialDeals: boolean;
  onSpecialDealsToggle: () => void;
}

const BusinessSearchBar: React.FC<BusinessSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onFilterToggle,
  showSpecialDeals,
  onSpecialDealsToggle,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder={t('search.placeholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant={showSpecialDeals ? 'default' : 'outline'}
          onClick={onSpecialDealsToggle}
          className="whitespace-nowrap flex-shrink-0"
        >
          {t('offers.specialDeals')}
        </Button>
        {onFilterToggle && (
          <Button variant="outline" size="icon" onClick={onFilterToggle} className="flex-shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default BusinessSearchBar;
