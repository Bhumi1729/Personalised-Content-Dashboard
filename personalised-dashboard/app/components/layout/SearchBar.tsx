'use client';

import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { useDebounceSearch } from '../../hooks/useDebounceSearch';

const SearchBar: React.FC = () => {
  const { inputValue, setInputValue } = useDebounceSearch(500);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search across news, movies, and social posts..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors bg-gray-50"
      />
      <FiSearch 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        size={18} 
      />
    </div>
  );
};

export default SearchBar;
