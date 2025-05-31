
import React from 'react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface BusinessCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const BusinessCategoryFilter: React.FC<BusinessCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  const { t } = useTranslation();

  return (
    <ScrollArea className="w-full">
      <div className="flex space-x-2 pb-2">
        <Badge
          variant={selectedCategory === 'All' ? 'default' : 'outline'}
          className="cursor-pointer whitespace-nowrap flex-shrink-0"
          onClick={() => onCategoryChange('All')}
        >
          {t('business.categories.all')}
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className="cursor-pointer whitespace-nowrap flex-shrink-0"
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
    </ScrollArea>
  );
};

export default BusinessCategoryFilter;
