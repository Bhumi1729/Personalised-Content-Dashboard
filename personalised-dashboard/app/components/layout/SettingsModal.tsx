
'use client';

import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setCategories, setMovieGenres, setSocialCategories } from '../../store/preferencesSlice';
import { useRouter } from 'next/navigation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const preferences = useAppSelector((state: { preferences: { categories: string[]; movieGenres?: string[]; socialCategories?: string[] } }) => state.preferences);
  
  // Initialize state with preferences but avoid resets on rerender
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => preferences.categories);
  const [selectedMovieGenres, setSelectedMovieGenres] = useState<string[]>(() => preferences.movieGenres || []);
  const [selectedSocialCategories, setSelectedSocialCategories] = useState<string[]>(() => preferences.socialCategories || []);
  
  // Keep preferences in sync with Redux state
  React.useEffect(() => {
    setSelectedCategories(preferences.categories);
    setSelectedMovieGenres(preferences.movieGenres || []);
    setSelectedSocialCategories(preferences.socialCategories || []);
  }, [preferences]);
  
  // Categories supported by News API Top Headlines endpoint
  const availableCategories = [
    'business',
    'entertainment',
    'general',
    'health',
    'science',
    'sports',
    'technology',
  ];

  // Movie genres
  const availableMovieGenres = [
    'action',
    'adventure',
    'animation',
    'comedy',
    'crime',
    'documentary',
    'drama',
    'fantasy',
    'horror',
    'mystery',
    'romance',
    'sci-fi',
    'thriller',
    'western',
  ];
  
  // Social media categories
  const availableSocialCategories = [
    'Technology',
    'Health & Wellness',
    'Fitness',
    'Travel & Lifestyle',
    'Humor & Relatable Moments',
  ];

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleMovieGenreToggle = (genre: string) => {
    if (selectedMovieGenres.includes(genre)) {
      setSelectedMovieGenres(selectedMovieGenres.filter(g => g !== genre));
    } else {
      setSelectedMovieGenres([...selectedMovieGenres, genre]);
    }
  };
  
  const handleSocialCategoryToggle = (category: string) => {
    if (selectedSocialCategories.includes(category)) {
      setSelectedSocialCategories(selectedSocialCategories.filter(c => c !== category));
    } else {
      setSelectedSocialCategories([...selectedSocialCategories, category]);
    }
  };

  const handleSave = () => {
    // Check if preferences have actually changed to avoid unnecessary updates
    const categoriesChanged = JSON.stringify(selectedCategories) !== JSON.stringify(preferences.categories);
    const movieGenresChanged = JSON.stringify(selectedMovieGenres) !== JSON.stringify(preferences.movieGenres);
    const socialCategoriesChanged = JSON.stringify(selectedSocialCategories) !== JSON.stringify(preferences.socialCategories);
    const preferencesChanged = categoriesChanged || movieGenresChanged || socialCategoriesChanged;
    
    // Only dispatch actions if preferences have changed
    if (categoriesChanged) {
      dispatch(setCategories(selectedCategories));
    }
    
    if (movieGenresChanged) {
      dispatch(setMovieGenres(selectedMovieGenres));
    }
    
    if (socialCategoriesChanged) {
      dispatch(setSocialCategories(selectedSocialCategories));
    }
    
    // Only fetch content if categories, movie genres or social categories have changed
    if (categoriesChanged || movieGenresChanged || socialCategoriesChanged) {
      // Directly dispatch the content fetch action to update the feed immediately
      // This will ensure content is refreshed right away with new preferences
      import('../../store/contentSlice').then(module => {
        if (typeof module.fetchAllContent === 'function') {
          // The fetchAllContent will get movieGenres and socialCategories from the updated state
          dispatch(module.fetchAllContent(selectedCategories));
        }
      });
    }
    
    // If preferences changed, notify user
    if (preferencesChanged) {
      // Set a flag in session storage to show notification
      sessionStorage.setItem('preferencesJustUpdated', 'true');
      
      // Go back to the feed tab to see changes
      if (window.location.pathname === '/dashboard') {
        router.replace('/dashboard?tab=feed');
      }
    }
    
    // Close the settings modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-5xl w-[85%] transform scale-105 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center bg-white border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Manage Preferences</h2>
            <p className="text-base text-gray-500">Customize your dashboard experience</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX size={22} className="text-gray-700" />
          </button>
        </div>
        
        <div className="p-5">
          <div className="mb-5">            
            <div className="grid grid-cols-12 gap-2">
              {/* News Categories - Vertical Layout */}
              <div className="col-span-3">
                <h3 className="text-base font-medium text-gray-800 mb-3">News Categories</h3>
                <div className="flex flex-col space-y-2 max-w-[180px]">
                  {availableCategories.map((category) => (
                    <div key={category} className="flex items-center bg-gray-50 py-2 px-3 rounded hover:bg-gray-100 transition-colors w-full">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="ml-2.5 text-sm font-medium text-gray-700 capitalize truncate"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Social Media Categories - Vertical Layout */}
              <div className="col-span-3 ml-2">
                <h3 className="text-base font-medium text-gray-800 mb-3">Social Media</h3>
                <div className="flex flex-col space-y-2 max-w-[180px]">
                  {availableSocialCategories.map((category) => (
                    <div key={category} className="flex items-center bg-gray-50 py-2 px-3 rounded hover:bg-gray-100 transition-colors w-full">
                      <input
                        type="checkbox"
                        id={`social-${category.replace(/\s+/g, '-').toLowerCase()}`}
                        checked={selectedSocialCategories.includes(category)}
                        onChange={() => handleSocialCategoryToggle(category)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <label
                        htmlFor={`social-${category.replace(/\s+/g, '-').toLowerCase()}`}
                        className="ml-2.5 text-sm font-medium text-gray-700 truncate"
                      >
                        {category.length > 15 ? category.split(' ')[0] : category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Movie Genres - Vertical Layout */}
              <div className="col-span-6 ml-6">
                <h3 className="text-base font-medium text-gray-800 mb-3">Movie Genres</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {availableMovieGenres.map((genre) => (
                    <div key={genre} className="flex items-center bg-gray-50 py-2 px-3 rounded hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        id={`genre-${genre}`}
                        checked={selectedMovieGenres.includes(genre)}
                        onChange={() => handleMovieGenreToggle(genre)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <label
                        htmlFor={`genre-${genre}`}
                        className="ml-2.5 text-sm font-medium text-gray-700 capitalize truncate"
                      >
                        {genre}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 flex justify-end bg-white shadow-inner border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg mr-4 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300 text-base font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 text-base font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
