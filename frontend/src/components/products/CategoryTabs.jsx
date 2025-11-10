import React from 'react';
import { CATEGORIES, CATEGORY_LABELS } from '../../utils/constants';

/**
 * Composant d'onglets pour filtrer par catégorie
 * Design tactile avec boutons larges
 */
const CategoryTabs = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { id: 'all', label: 'Tous', icon: '🍽️' },
    { id: CATEGORIES.BURGERS, label: CATEGORY_LABELS[CATEGORIES.BURGERS], icon: '🍔' },
    { id: CATEGORIES.SIDES, label: CATEGORY_LABELS[CATEGORIES.SIDES], icon: '🍟' },
    { id: CATEGORIES.DRINKS, label: CATEGORY_LABELS[CATEGORIES.DRINKS], icon: '🥤' },
    { id: CATEGORIES.DESSERTS, label: CATEGORY_LABELS[CATEGORIES.DESSERTS], icon: '🍰' },
    { id: CATEGORIES.MENUS, label: CATEGORY_LABELS[CATEGORIES.MENUS], icon: '📦' },
  ];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium
            transition-all duration-150 active:scale-95
            whitespace-nowrap min-h-touch select-none
            ${
              selectedCategory === category.id
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            }
          `}
        >
          <span className="text-2xl">{category.icon}</span>
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
