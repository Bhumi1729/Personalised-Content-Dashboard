'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTrending, fetchAllContent } from '../../store/contentSlice';
import ContentCard from './ContentCard';
import {
  NewsItem,
  MovieItem,
  SocialPost,
  ContentItem
} from '../../types';


const TrendingContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { trending, loading, social, movies, error } = useAppSelector((state) => state.content);
  const layout = useAppSelector((state) => state.preferences.layout);
  const theme = useAppSelector((state) => state.theme.theme);

  // Tabs: 'news', 'movies', 'posts'
  const [activeTab, setActiveTab] = useState<'news' | 'movies' | 'posts'>('news');

  // Pagination states for each tab
  const [newsCurrentPage, setNewsCurrentPage] = useState(1);
  const [moviesCurrentPage, setMoviesCurrentPage] = useState(1);
  const [postsCurrentPage, setPostsCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Remove setItemsPerPage (unused)

  // Fetch social posts when switching to posts tab
  useEffect(() => {
    if (activeTab === 'posts') {
      // Always fetch all categories for trending posts, ignoring user settings
      dispatch(fetchAllContent([]));
    }
  }, [activeTab, dispatch]);

  // Trending News
  // Only NewsItem from trending
  const safeTrending: NewsItem[] = Array.isArray(trending)
    ? trending.filter((item): item is NewsItem => 'source' in item && 'urlToImage' in item)
    : [];
  // Social Posts
  // Only trending posts (istrending === true) should be shown in Trending Posts tab, regardless of user preferences or selected categories
  // This ignores any category selection from the settings modal
  const safeSocial: SocialPost[] = Array.isArray(social)
    ? shuffleArray<SocialPost>(social.filter((post) => post.istrending === true))
    : [];

// Shuffle array utility
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
  // Trending Movies: filter by year and sort by imdbVotes, then imdbRating
  const safeMovies: MovieItem[] = (movies || [])
    .filter((movie) => {
      // Accept year as string, e.g. "2021" or "2021-2022"
      if (!movie.year) return false;
      const yearStr = movie.year.split('-')[0];
      const yearNum = parseInt(yearStr, 10);
      return yearNum >= 2020 && yearNum <= 2025;
    })
    .sort((a, b) => {
      // Sort by imdbRating (string to float)
      const ratingA = a.imdbRating ? parseFloat(a.imdbRating) : 0;
      const ratingB = b.imdbRating ? parseFloat(b.imdbRating) : 0;
      return ratingB - ratingA;
    });

  // Time window for trending articles (in days)
  const [timeWindow, setTimeWindow] = useState(7);

  // Language selection for trending articles
  const [language, setLanguage] = useState('en');

  // Available languages according to NewsAPI documentation
  const languages = [
    { code: 'ar', name: 'Arabic' },
    { code: 'de', name: 'German' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'he', name: 'Hebrew' },
    { code: 'it', name: 'Italian' },
    { code: 'nl', name: 'Dutch' },
    { code: 'no', name: 'Norwegian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'sv', name: 'Swedish' },
    { code: 'zh', name: 'Chinese' }
  ];

  useEffect(() => {
    dispatch(fetchTrending({ timeWindow, language }));
  }, [dispatch, timeWindow, language]);

  // Pagination logic
  const getCurrentItems = (): ContentItem[] => {
    let items: ContentItem[] = [];
    let currentPage = 1;
    switch (activeTab) {
      case 'news':
        items = safeTrending;
        currentPage = newsCurrentPage;
        break;
      case 'movies':
        items = safeMovies;
        currentPage = moviesCurrentPage;
        break;
      case 'posts':
        items = safeSocial;
        currentPage = postsCurrentPage;
        break;
    }
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getTotalPages = (): number => {
    let items: ContentItem[] = [];
    switch (activeTab) {
      case 'news':
        items = safeTrending;
        break;
      case 'movies':
        items = safeMovies;
        break;
      case 'posts':
        items = safeSocial;
        break;
    }
    return Math.ceil(items.length / itemsPerPage);
  };

  const getCurrentPage = () => {
    switch (activeTab) {
      case 'news':
        return newsCurrentPage;
      case 'movies':
        return moviesCurrentPage;
      case 'posts':
        return postsCurrentPage;
      default:
        return 1;
    }
  };

  const setCurrentPage = (page: number) => {
    switch (activeTab) {
      case 'news':
        setNewsCurrentPage(page);
        break;
      case 'movies':
        setMoviesCurrentPage(page);
        break;
      case 'posts':
        setPostsCurrentPage(page);
        break;
    }
  };

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Go to next page
  const nextPage = () => {
    const currentPage = getCurrentPage();
    const totalPages = getTotalPages();
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    const currentPage = getCurrentPage();
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Pagination component (exact same as SocialSection)
  const renderPagination = () => {
    const currentPage = getCurrentPage();
    const totalPages = getTotalPages();
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center mt-6 mb-8 items-center">
        <button 
          onClick={prevPage} 
          disabled={currentPage === 1}
          style={{
            padding: '0.5rem 1rem',
            margin: '0 0.25rem',
            borderRadius: '0.25rem',
            backgroundColor: currentPage === 1 
              ? '#e5e7eb' // gray-200
              : theme === 'light'
                ? '#000000' // black
                : '#ffffff', // white
            color: currentPage === 1 
              ? '#6b7280' // gray-500
              : theme === 'light'
                ? '#ffffff' // white
                : '#000000', // black
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>
        
        <div className="flex space-x-1 mx-2">
          {(() => {
            // If only a few pages, show all
            if (totalPages <= 7) {
              return Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    backgroundColor: currentPage === i + 1
                      ? theme === 'light'
                        ? '#000000' // black
                        : '#ffffff' // white
                      : theme === 'light'
                        ? '#d1d5db' // gray-300
                        : '#4b5563', // gray-600
                    color: currentPage === i + 1
                      ? theme === 'light'
                        ? '#ffffff' // white
                        : '#000000' // black
                      : theme === 'light'
                        ? '#374151' // gray-700
                        : '#000000', // black
                    cursor: 'pointer',
                    margin: '0 0.125rem'
                  }}
                >
                  {i + 1}
                </button>
              ));
            }
            
            // For many pages, create smart pagination
            const pageNumbers = [];
            
            // Always show first page
            pageNumbers.push(
              <button
                key={1}
                onClick={() => paginate(1)}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem',
                  backgroundColor: currentPage === 1
                    ? theme === 'light'
                      ? '#000000' // black
                      : '#ffffff' // white
                    : theme === 'light'
                      ? '#d1d5db' // gray-300
                      : '#4b5563', // gray-600
                  color: currentPage === 1
                    ? theme === 'light'
                      ? '#ffffff' // white
                      : '#000000' // black
                    : theme === 'light'
                      ? '#374151' // gray-700
                      : '#000000', // black
                  cursor: 'pointer',
                  margin: '0 0.125rem'
                }}
              >
                1
              </button>
            );
            
            // Calculate range of visible page numbers
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);
            
            // Adjust to show at least 3 pages if possible
            if (endPage - startPage < 2) {
              if (currentPage < totalPages / 2) {
                endPage = Math.min(totalPages - 1, startPage + 2);
              } else {
                startPage = Math.max(2, endPage - 2);
              }
            }
            
            // Add ellipsis after first page if needed
            if (startPage > 2) {
              pageNumbers.push(
                <span key="ellipsis1" style={{
                  padding: '0.25rem 0.75rem',
                  color: theme === 'light' ? '#374151' : '#d1d5db'
                }}>...</span>
              );
            }
            
            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
              pageNumbers.push(
                <button
                  key={i}
                  onClick={() => paginate(i)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    backgroundColor: currentPage === i
                      ? theme === 'light'
                        ? '#000000' // black
                        : '#ffffff' // white
                      : theme === 'light'
                        ? '#d1d5db' // gray-300
                        : '#4b5563', // gray-600
                    color: currentPage === i
                      ? theme === 'light'
                        ? '#ffffff' // white
                        : '#000000' // black
                      : theme === 'light'
                        ? '#374151' // gray-700
                        : '#000000', // black
                    cursor: 'pointer',
                    margin: '0 0.125rem'
                  }}
                >
                  {i}
                </button>
              );
            }
            
            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
              pageNumbers.push(
                <span key="ellipsis2" style={{
                  padding: '0.25rem 0.75rem',
                  color: theme === 'light' ? '#374151' : '#d1d5db'
                }}>...</span>
              );
            }
            
            // Always show last page
            if (totalPages > 1) {
              pageNumbers.push(
                <button
                  key={totalPages}
                  onClick={() => paginate(totalPages)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    backgroundColor: currentPage === totalPages
                      ? theme === 'light'
                        ? '#000000' // black
                        : '#ffffff' // white
                      : theme === 'light'
                        ? '#d1d5db' // gray-300
                        : '#4b5563', // gray-600
                    color: currentPage === totalPages
                      ? theme === 'light'
                        ? '#ffffff' // white
                        : '#000000' // black
                      : theme === 'light'
                        ? '#374151' // gray-700
                        : '#000000', // black
                    cursor: 'pointer',
                    margin: '0 0.125rem'
                  }}
                >
                  {totalPages}
                </button>
              );
            }
            
            return pageNumbers;
          })()}
        </div>
        
        <button 
          onClick={nextPage} 
          disabled={currentPage === getTotalPages()}
          style={{
            padding: '0.5rem 1rem',
            margin: '0 0.25rem',
            borderRadius: '0.25rem',
            backgroundColor: currentPage === getTotalPages() 
              ? '#e5e7eb' // gray-200
              : theme === 'light'
                ? '#000000' // black
                : '#ffffff', // white
            color: currentPage === getTotalPages() 
              ? '#6b7280' // gray-500
              : theme === 'light'
                ? '#ffffff' // white
                : '#000000', // black
            cursor: currentPage === getTotalPages() ? 'not-allowed' : 'pointer'
          }}
        >
          Next
        </button>
      </div>
    );
  };

  const currentItems = getCurrentItems();

  // Always render tabs and controls
  return (
    <div className="w-full mt-8">
      {/* Tabs */}
      <div className="flex items-center mb-8 gap-4"> {/* Increased mb-3 to mb-8 for more space below tabs */}
        <button
          className="px-6 py-2 rounded-xl shadow-sm transition-all duration-200 font-semibold text-lg mr-2 focus:outline-none border-2 relative z-10"
          style={{
            backgroundColor: activeTab === 'news' 
              ? theme === 'light' 
                ? '#000000' // black for light theme
                : '#ffffff' // white for dark theme
              : theme === 'light'
                ? '#ffffff' // white for light theme
                : '#1f2937', // gray-800 for dark theme
            color: activeTab === 'news'
              ? theme === 'light'
                ? '#ffffff' // white text for light theme
                : '#000000' // black text for dark theme  
              : theme === 'light'
                ? '#374151' // gray-700 for light theme
                : '#ffffff', // white for dark theme
            borderColor: activeTab === 'news'
              ? theme === 'light'
                ? '#000000' // black border for light theme
                : '#ffffff' // white border for dark theme
              : theme === 'light'
                ? '#e5e7eb' // gray-200 for light theme
                : '#4b5563', // gray-600 for dark theme
            boxShadow: activeTab === 'news' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
          onClick={() => setActiveTab('news')}
        >
          Trending News
        </button>
        <button
          className="px-6 py-2 rounded-xl shadow-sm transition-all duration-200 font-semibold text-lg mr-2 focus:outline-none border-2 relative z-10"
          style={{
            backgroundColor: activeTab === 'movies' 
              ? theme === 'light' 
                ? '#000000' // black for light theme
                : '#ffffff' // white for dark theme
              : theme === 'light'
                ? '#ffffff' // white for light theme
                : '#1f2937', // gray-800 for dark theme
            color: activeTab === 'movies'
              ? theme === 'light'
                ? '#ffffff' // white text for light theme
                : '#000000' // black text for dark theme  
              : theme === 'light'
                ? '#374151' // gray-700 for light theme
                : '#ffffff', // white for dark theme
            borderColor: activeTab === 'movies'
              ? theme === 'light'
                ? '#000000' // black border for light theme
                : '#ffffff' // white border for dark theme
              : theme === 'light'
                ? '#e5e7eb' // gray-200 for light theme
                : '#4b5563', // gray-600 for dark theme
            boxShadow: activeTab === 'movies' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
          onClick={() => setActiveTab('movies')}
        >
          Trending Movies
        </button>
        <button
          className="px-6 py-2 rounded-xl shadow-sm transition-all duration-200 font-semibold text-lg focus:outline-none border-2 relative z-10"
          style={{
            backgroundColor: activeTab === 'posts' 
              ? theme === 'light' 
                ? '#000000' // black for light theme
                : '#ffffff' // white for dark theme
              : theme === 'light'
                ? '#ffffff' // white for light theme
                : '#1f2937', // gray-800 for dark theme
            color: activeTab === 'posts'
              ? theme === 'light'
                ? '#ffffff' // white text for light theme
                : '#000000' // black text for dark theme  
              : theme === 'light'
                ? '#374151' // gray-700 for light theme
                : '#ffffff', // white for dark theme
            borderColor: activeTab === 'posts'
              ? theme === 'light'
                ? '#000000' // black border for light theme
                : '#ffffff' // white border for dark theme
              : theme === 'light'
                ? '#e5e7eb' // gray-200 for light theme
                : '#4b5563', // gray-600 for dark theme
            boxShadow: activeTab === 'posts' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
          onClick={() => setActiveTab('posts')}
        >
          Trending Posts
        </button>
      </div>

      {/* Controls only for Trending News */}
      {activeTab === 'news' && (
        <div className="flex justify-end mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <span 
                className="text-sm mr-2"
                style={{
                  color: theme === 'light' ? '#6b7280' : '#9ca3af' // gray-500 for light, gray-400 for dark
                }}
              >
                Time Window:
              </span>
              <div 
                className="flex rounded-md overflow-hidden"
                style={{
                  border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}` // gray-300 for light, gray-600 for dark
                }}
              >
                <button
                  onClick={() => setTimeWindow(1)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.875rem',
                    backgroundColor: timeWindow === 1 
                      ? theme === 'light'
                        ? '#000000' // black for light theme
                        : '#ffffff' // white for dark theme
                      : theme === 'light'
                        ? '#ffffff' // white for light theme
                        : '#1f2937', // gray-800 for dark theme
                    color: timeWindow === 1
                      ? theme === 'light'
                        ? '#ffffff' // white text for light theme
                        : '#000000' // black text for dark theme
                      : theme === 'light'
                        ? '#374151' // gray-700 for light theme
                        : '#d1d5db', // gray-300 for dark theme
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  24h
                </button>
                <button
                  onClick={() => setTimeWindow(7)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.875rem',
                    backgroundColor: timeWindow === 7 
                      ? theme === 'light'
                        ? '#000000' // black for light theme
                        : '#ffffff' // white for dark theme
                      : theme === 'light'
                        ? '#ffffff' // white for light theme
                        : '#1f2937', // gray-800 for dark theme
                    color: timeWindow === 7
                      ? theme === 'light'
                        ? '#ffffff' // white text for light theme
                        : '#000000' // black text for dark theme
                      : theme === 'light'
                        ? '#374151' // gray-700 for light theme
                        : '#d1d5db', // gray-300 for dark theme
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeWindow(30)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.875rem',
                    backgroundColor: timeWindow === 30 
                      ? theme === 'light'
                        ? '#000000' // black for light theme
                        : '#ffffff' // white for dark theme
                      : theme === 'light'
                        ? '#ffffff' // white for light theme
                        : '#1f2937', // gray-800 for dark theme
                    color: timeWindow === 30
                      ? theme === 'light'
                        ? '#ffffff' // white text for light theme
                        : '#000000' // black text for dark theme
                      : theme === 'light'
                        ? '#374151' // gray-700 for light theme
                        : '#d1d5db', // gray-300 for dark theme
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span 
                className="text-sm mr-2"
                style={{
                  color: theme === 'light' ? '#6b7280' : '#9ca3af' // gray-500 for light, gray-400 for dark
                }}
              >
                Language:
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-md px-3 py-1 text-sm"
                style={{
                  backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937', // white for light, gray-800 for dark
                  color: theme === 'light' ? '#374151' : '#ffffff', // gray-700 for light, white for dark
                  border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}` // gray-300 for light, gray-600 for dark
                }}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => dispatch(fetchTrending({ timeWindow, language }))}
              className="text-sm px-3 py-1 rounded-md flex items-center transition-all duration-200"
              style={{
                backgroundColor: theme === 'light' ? '#e5e7eb' : '#374151', // gray-200 for light, gray-700 for dark
                color: theme === 'light' ? '#374151' : '#ffffff', // gray-700 for light, white for dark
                border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}` // gray-300 for light, gray-600 for dark
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#d1d5db' : '#4b5563'; // gray-300 for light, gray-600 for dark
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#e5e7eb' : '#374151'; // gray-200 for light, gray-700 for dark
              }}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Content Section: show loading, error, or empty state for active tab only */}
      <div className={`w-full ${layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'} ${activeTab === 'posts' ? 'mt-8' : ''}`}>
        {loading && ((activeTab === 'news' && safeTrending.length === 0) || (activeTab === 'movies' && safeMovies.length === 0) || (activeTab === 'posts' && safeSocial.length === 0)) && (
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
        )}
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">
            Error loading content: {error}
          </div>
        )}
        {activeTab === 'news' && !error && safeTrending.length === 0 && !loading && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg">
            No trending news found.
          </div>
        )}
        {activeTab === 'movies' && !error && safeMovies.length === 0 && !loading && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg">
            No trending movies found.
          </div>
        )}
        {activeTab === 'posts' && !error && safeSocial.length === 0 && !loading && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg">
            No trending posts found.
          </div>
        )}
        
        {/* Render current page items */}
        {currentItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ContentCard item={item} isTrendingTab={activeTab === 'news' || activeTab === 'movies' || activeTab === 'posts'} />
          </motion.div>
        ))}
      </div>

      {/* Pagination with bottom padding */}
      <div className="pb-6"> {/* Adds padding from bottom of screen */}
        {renderPagination()}
      </div>
    </div>
  );
};

export default TrendingContent;