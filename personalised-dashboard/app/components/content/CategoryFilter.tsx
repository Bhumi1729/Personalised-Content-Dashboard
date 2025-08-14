'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiCheck } from 'react-icons/fi';

interface CategoryFilterProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = React.memo(({
  selectedCategories,
  onCategoryChange,
}) => {
  // Available categories for filtering
  const availableCategories = React.useMemo(() => [
    { id: 'business', label: 'Business', emoji: '💼' },
    { id: 'entertainment', label: 'Entertainment', emoji: '🎭' },
    { id: 'general', label: 'General', emoji: '📰' },
    { id: 'health', label: 'Health', emoji: '🏥' },
    { id: 'science', label: 'Science', emoji: '🔬' },
    { id: 'sports', label: 'Sports', emoji: '⚽' },
    { id: 'technology', label: 'Technology', emoji: '💻' },
  ], []);

  const handleCategoryToggle = React.useCallback((categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // Remove category
      onCategoryChange(selectedCategories.filter(cat => cat !== categoryId));
    } else {
      // Add category
      onCategoryChange([...selectedCategories, categoryId]);
    }
  }, [selectedCategories, onCategoryChange]);

  const handleSelectAll = React.useCallback(() => {
    if (selectedCategories.length === availableCategories.length) {
      // Deselect all
      onCategoryChange([]);
    } else {
      // Select all
      onCategoryChange(availableCategories.map(cat => cat.id));
    }
  }, [selectedCategories.length, onCategoryChange, availableCategories]);

  const isAllSelected = selectedCategories.length === availableCategories.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiFilter className="text-blue-600" size={18} />
          <h3 className="font-semibold text-gray-900">Filter by Categories</h3>
          <span className="text-sm text-gray-500">
            ({selectedCategories.length} selected)
          </span>
        </div>
        
        <button
          onClick={handleSelectAll}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {isAllSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {availableCategories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          
          return (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryToggle(category.id)}
              className={`
                relative flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200
                ${isSelected
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-1"
                >
                  <FiCheck size={10} />
                </motion.div>
              )}
              
              <span className="text-2xl mb-1">{category.emoji}</span>
              <span className="text-xs font-medium text-center leading-tight">
                {category.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {selectedCategories.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">No categories selected.</span> Please select at least one category to see content.
          </p>
        </div>
      )}
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';

export default CategoryFilter;
