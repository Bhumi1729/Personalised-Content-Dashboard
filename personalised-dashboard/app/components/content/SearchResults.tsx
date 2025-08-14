'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../hooks/redux';
import ContentCard from './ContentCard';
import { ContentItem } from '../../types';
import { RootState } from '../../store';

const SearchResults: React.FC = () => {
  const { query, results, loading, error } = useAppSelector((state: RootState) => state.search);
  const layout = useAppSelector((state: RootState) => state.preferences.layout) as 'grid' | 'list';
  
  // Ensure results is always an array and properly typed
  const safeResults: ContentItem[] = results || [];

  if (!query) {
    return null; // Don't show anything if there's no search query
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded-lg">
        Error searching content: {error}
      </div>
    );
  }

  if (!safeResults || safeResults.length === 0) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg">
  No results found for &quot;{query}&quot;. Try a different search.
      </div>
    );
  }

  return (
    <div className="mb-8 p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4">
  Search Results for &quot;{query}&quot;
      </h2>
      <div className={`w-full ${
        layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-8'
      }`}>
        {safeResults.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ContentCard item={item} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
