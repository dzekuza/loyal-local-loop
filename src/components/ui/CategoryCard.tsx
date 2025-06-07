
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  backgroundColor: string;
  textColor?: string;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  title, 
  icon: Icon, 
  backgroundColor, 
  textColor = 'text-white',
  onClick 
}) => {
  return (
    <div 
      className={`${backgroundColor} ${textColor} rounded-2xl p-4 min-h-[100px] flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg`}
      onClick={onClick}
    >
      <Icon className="w-8 h-8 mb-2" />
      <span className="text-sm font-medium text-center leading-tight">{title}</span>
    </div>
  );
};

export default CategoryCard;
