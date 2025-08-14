'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { fetchAllContent } from '../store/contentSlice';
import { NewsItem } from '../types';
import { RootState } from '../store';

/**
 * Custom hook to manage categorized news data
 * Handles automatic fetching and organization of news by category
 */
export function useCategorizedNews() {
  const dispatch = useAppDispatch();
  const { news = [], loading, error } = useAppSelector((state: RootState) => state.content);
  const selectedCategories = useAppSelector((state: RootState) => state.preferences.categories);
  
  // Group news by category
  const [newsByCategory, setNewsByCategory] = useState<Record<string, NewsItem[]>>({});
  
  // Memoized fetch function
  const fetchContent = useCallback(() => {
    if (news.length === 0 && !loading && selectedCategories.length > 0) {
      dispatch(fetchAllContent(selectedCategories));
    }
  }, [dispatch, news.length, loading, selectedCategories]);
  
  // Fetch content only once when the component mounts
  // Skip this hook's fetch if content is already available
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);
  
  // Organize news into categories when they change
  useEffect(() => {
    const groupedNews: Record<string, NewsItem[]> = {};
    
    // Initialize categories from user preferences
    const supportedCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
    
    // Get categories to use - either from user preferences or all supported categories
    const userSelectedCategories = selectedCategories || [];
    const categoriesToUse = userSelectedCategories.length > 0 
      ? userSelectedCategories.filter((cat: string) => supportedCategories.includes(cat))
      : supportedCategories;
      
    // Initialize empty arrays for each category
    categoriesToUse.forEach((category: string) => {
      groupedNews[category] = [];
    });
    
    // Group news items by their category
    if (news && news.length > 0) {
      news.forEach((item: NewsItem) => {
        if (item.category && groupedNews[item.category]) {
          groupedNews[item.category].push(item);
        } else if (item.category && categoriesToUse.includes(item.category)) {
          // Initialize the category if it doesn't exist yet
          groupedNews[item.category] = [item];
        }
      });
    }
    
    // Sort categories by name
    const sortedGroupedNews: Record<string, NewsItem[]> = {};
    Object.keys(groupedNews).sort().forEach(key => {
      sortedGroupedNews[key] = groupedNews[key];
    });
    
    setNewsByCategory(sortedGroupedNews);
  }, [news, selectedCategories]);

  return {
    newsByCategory,
    loading,
    error,
    refreshNews: () => dispatch(fetchAllContent(selectedCategories))
  };
}
