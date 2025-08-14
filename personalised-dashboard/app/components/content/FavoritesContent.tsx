'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../hooks/redux';
import ContentCard from './ContentCard';
import { ContentItem } from '../../types';

const FavoritesContent: React.FC = () => {
  const favorites = useAppSelector((state: { preferences: { favorites: Record<string, ContentItem> } }) => state.preferences.favorites);
  const layout = useAppSelector((state: { preferences: { layout: string } }) => state.preferences.layout);
  
  // Convert favorites object to array
  const favoriteItems: ContentItem[] = Object.values(favorites);

  if (favoriteItems.length === 0) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg">
        You haven&apos;t added any favorites yet. Star content you like to see it here!
      </div>
    );
  }

  return (
    <div className={`w-full ${
      layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'
    }`}>
      {favoriteItems.map((item, index) => (
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
  );
};

export default FavoritesContent;
