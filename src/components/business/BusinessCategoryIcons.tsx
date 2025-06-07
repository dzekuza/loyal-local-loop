
import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  ShoppingBag, 
  Coffee, 
  Car, 
  Home, 
  Heart, 
  Utensils, 
  Scissors, 
  Dumbbell,
  Monitor,
  Building2,
  Palette,
  ShoppingCart
} from 'lucide-react';

interface BusinessCategoryIconsProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

// Map business types to icons and colors
const getCategoryConfig = (category: string) => {
  const configs: Record<string, { icon: any; bgColor: string; textColor: string }> = {
    'Restaurant': { icon: Utensils, bgColor: 'bg-orange-500', textColor: 'text-white' },
    'Retail': { icon: ShoppingBag, bgColor: 'bg-purple-500', textColor: 'text-white' },
    'Coffee Shop': { icon: Coffee, bgColor: 'bg-amber-600', textColor: 'text-white' },
    'Automotive': { icon: Car, bgColor: 'bg-blue-600', textColor: 'text-white' },
    'Beauty & Wellness': { icon: Scissors, bgColor: 'bg-pink-500', textColor: 'text-white' },
    'Healthcare': { icon: Heart, bgColor: 'bg-red-500', textColor: 'text-white' },
    'Fitness': { icon: Dumbbell, bgColor: 'bg-green-600', textColor: 'text-white' },
    'Technology': { icon: Monitor, bgColor: 'bg-indigo-600', textColor: 'text-white' },
    'Real Estate': { icon: Home, bgColor: 'bg-teal-600', textColor: 'text-white' },
    'Professional Services': { icon: Building2, bgColor: 'bg-gray-600', textColor: 'text-white' },
    'Art & Entertainment': { icon: Palette, bgColor: 'bg-violet-600', textColor: 'text-white' },
    'Grocery': { icon: ShoppingCart, bgColor: 'bg-emerald-600', textColor: 'text-white' },
  };

  return configs[category] || { icon: Building2, bgColor: 'bg-gray-500', textColor: 'text-white' };
};

const BusinessCategoryIcons: React.FC<BusinessCategoryIconsProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  const allCategories = ['All', ...categories];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Browse by Category</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* All Categories Card */}
        <Card 
          className={`p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${
            selectedCategory === 'All' 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onCategoryChange('All')}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              selectedCategory === 'All' ? 'bg-purple-500' : 'bg-gray-100'
            }`}>
              <Building2 className={`w-6 h-6 ${
                selectedCategory === 'All' ? 'text-white' : 'text-gray-600'
              }`} />
            </div>
            <span className={`text-sm font-medium ${
              selectedCategory === 'All' ? 'text-purple-700' : 'text-gray-700'
            }`}>
              All
            </span>
            {selectedCategory === 'All' && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                Selected
              </Badge>
            )}
          </div>
        </Card>

        {/* Category Cards */}
        {categories.map((category) => {
          const { icon: Icon, bgColor, textColor } = getCategoryConfig(category);
          const isSelected = selectedCategory === category;

          return (
            <Card 
              key={category}
              className={`p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${
                isSelected 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onCategoryChange(category)}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
                  <Icon className={`w-6 h-6 ${textColor}`} />
                </div>
                <span className={`text-sm font-medium line-clamp-2 ${
                  isSelected ? 'text-purple-700' : 'text-gray-700'
                }`}>
                  {category}
                </span>
                {isSelected && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                    Selected
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessCategoryIcons;
