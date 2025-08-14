'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../hooks/redux';
import { useCategorizedNews } from '../../hooks/useCategorizedNews';
import CategoryNewsSection from './CategoryNewsSection';
// import { fetchAllContent } from '../../store/contentSlice';

const NewsByCategoryFeed: React.FC = () => {
  // const dispatch = useAppDispatch();
  const layout = useAppSelector((state: { preferences: { layout: string } }) => state.preferences.layout) as 'grid' | 'list';
  const selectedCategories = useAppSelector((state: { preferences: { categories: string[] } }) => state.preferences.categories);
  
  // Use our custom hook to manage categorized news
  const { newsByCategory, loading, error, refreshNews } = useCategorizedNews();
  
  // Show notification when user arrives from settings change
  const [showSettingsNotification, setShowSettingsNotification] = useState(false);
  
  // Handle settings change notification
  useEffect(() => {
    // Check for settings update on mount
    const wasUpdated = sessionStorage.getItem('preferencesJustUpdated');
    if (wasUpdated === 'true') {
      setShowSettingsNotification(true);
      sessionStorage.removeItem('preferencesJustUpdated');
      
      const timer = setTimeout(() => {
        setShowSettingsNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    // Listen for preference changes
    const handlePreferencesChanged = () => {
      setShowSettingsNotification(true);
      
      const timer = setTimeout(() => {
        setShowSettingsNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    };
    
    window.addEventListener('preferencesChanged', handlePreferencesChanged);
    return () => window.removeEventListener('preferencesChanged', handlePreferencesChanged);
  }, []);

  if (loading && Object.keys(newsByCategory).length === 0) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-7 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-5 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className={layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-40 bg-gray-300"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-5/6 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-4/6 mb-4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Error loading news content. Please try again later.</p>
        </div>
        <button 
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors" 
          onClick={() => refreshNews()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Check if we have any news to display
  const hasNews = Object.values(newsByCategory).some(articles => articles.length > 0);
  
  if (!hasNews && !loading) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-lg">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-yellow-800">No news articles found. Try selecting different categories in settings or check your connection.</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button 
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            onClick={() => refreshNews()}
          >
            Refresh News
          </button>
          
          {selectedCategories.length === 0 && (
            <div className="flex items-center text-sm text-yellow-700 ml-2">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Tip: Open settings to select news categories</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Refresh all content
  // const handleRefresh = () => {
  //   refreshNews();
  // };

  return (
    <div className="w-full">
      {/* Notification for settings changes */}
      {showSettingsNotification && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex justify-between items-center">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Settings updated successfully! News is now categorized based on your preferences.</span>
          </div>
          <button 
            onClick={() => setShowSettingsNotification(false)}
            className="text-green-700 hover:text-green-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    
      <div className="flex justify-between items-center mb-6">
  {/* Removed News By Category title and refresh button as requested */}
      </div>
      
      {/* Show each category with its news */}
      {Object.entries(newsByCategory).map(([category, categoryNews]) => (
        <CategoryNewsSection 
          key={category}
          categoryTitle={category}
          news={categoryNews}
          layout={layout}
        />
      ))}
    </div>
  );
};

export default NewsByCategoryFeed;
