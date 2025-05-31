
import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Filter } from 'lucide-react';

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
  return (
    <div className="flex space-x-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search businesses..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button
        variant={showSpecialDeals ? 'default' : 'outline'}
        onClick={onSpecialDealsToggle}
        className="whitespace-nowrap"
      >
        Special Deals
      </Button>
      {onFilterToggle && (
        <Button variant="outline" size="icon" onClick={onFilterToggle}>
          <Filter className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default BusinessSearchBar;
