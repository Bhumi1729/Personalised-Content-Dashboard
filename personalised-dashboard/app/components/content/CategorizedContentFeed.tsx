'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Tab } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchAllContent } from '../../store/contentSlice';
import ContentCard from './ContentCard';
import { ContentItem, NewsItem, MovieItem, SocialPost } from '../../types';
import { useDndKit } from '../../hooks/useDndKit';
import { FiBookOpen, FiFilm, FiUsers, FiGrid, FiList } from 'react-icons/fi';
import { useCategorizedNews } from '../../hooks/useCategorizedNews';
import CategoryNewsSection from './CategoryNewsSection';
import MovieSection from './MovieSection';
import SocialSection from './SocialSection';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { isOmdbApiKeyValid } from '../../services/apiKeys';
import useDebounce from '../../hooks/useDebounce';

// Type definitions for better type safety
interface ContentState {
  news: NewsItem[];
  movies: MovieItem[];
  social: SocialPost[];
  loading: boolean;
  error: string | null;
}

interface PreferencesState {
  layout: 'grid' | 'list';
  categories: string[];
  movieGenres: string[];
  socialCategories: string[];
}

interface RootState {
  content: ContentState;
  preferences: PreferencesState;
}

interface OMDBMovieResult {
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
  imdbID: string;
}

// Sortable wrapper component for content cards
function SortableContentCard({ item, index }: { item: ContentItem; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(item.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`transition-all duration-200 ${
        isDragging 
          ? 'z-50 opacity-80' 
          : 'hover:shadow-lg'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: isDragging ? 1.02 : 1
        }}
        transition={{ 
          delay: index * 0.05,
          scale: { duration: 0.2 }
        }}
        className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      >
        <ContentCard item={item} />
        {/* Drag indicator */}
        {isDragging && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10">
            Dragging...
          </div>
        )}
      </motion.div>
    </div>
  );
}

const CategorizedContentFeed: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    news = [], 
    movies = [], 
    social = [],
    loading, 
    error 
  } = useAppSelector((state: RootState) => state.content);
  
  // User preferences for layout
  const preferences = useAppSelector((state: RootState) => state.preferences);
  const layout: 'grid' | 'list' = preferences.layout;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [movieSearchQuery, setMovieSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(movieSearchQuery, 600); // 600ms debounce
  const [searchedMovies, setSearchedMovies] = useState<MovieItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  // Initialize selectedCategories from preferences to avoid unnecessary resets
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => 
    preferences.categories && preferences.categories.length > 0 
      ? preferences.categories 
      : ['technology', 'business', 'entertainment']
  );
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);
  
  // Use ref to track if we're currently fetching to prevent duplicate calls
  const isFetchingRef = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle client-side only rendering to avoid hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debounced fetch function to prevent multiple API calls
  const debouncedFetch = useCallback(
    (categories: string[]) => {
      // Clear any existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      // Skip fetch if categories is empty
      if (categories.length === 0) return;
      
      // Skip if we're already fetching
      if (isFetchingRef.current) return;
      
      // Create a stable reference to the categories for the timeout closure
      const categoriesToFetch = [...categories];

      // Set a timeout to fetch data after 300ms of no changes
      fetchTimeoutRef.current = setTimeout(() => {
        if (!isFetchingRef.current) {
          isFetchingRef.current = true;
          dispatch(fetchAllContent(categoriesToFetch)).finally(() => {
            isFetchingRef.current = false;
          });
        }
      }, 300);
    },
    [dispatch]
  );

  // Combined effect for initial fetch and category changes
  useEffect(() => {
    // Skip if not mounted yet
    if (!isMounted) return;

    // Skip if we're already fetching
    if (isFetchingRef.current) return;

    // Skip if categories are empty
    if (selectedCategories.length === 0) return;

    // For initial fetch, directly dispatch
    if (!hasInitiallyFetched) {
      isFetchingRef.current = true;
      dispatch(fetchAllContent(selectedCategories)).finally(() => {
        isFetchingRef.current = false;
        setHasInitiallyFetched(true);
      });
    } 
    // For subsequent category changes, use debounced fetch
    else {
      debouncedFetch(selectedCategories);
    }
  }, [isMounted, hasInitiallyFetched, selectedCategories, dispatch, debouncedFetch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Get the selected movie genres and categories from preferences 
  const { movieGenres, categories: preferenceCategories } = useAppSelector((state: RootState) => ({
    movieGenres: state.preferences.movieGenres || [],
    categories: state.preferences.categories || []
  }));
  
  // Sync selectedCategories with preferences if they change externally (e.g., from settings modal)
  useEffect(() => {
    // Only update if preferences actually changed and we have categories
    if (preferenceCategories.length > 0 && 
        JSON.stringify(preferenceCategories) !== JSON.stringify(selectedCategories)) {
      setSelectedCategories(preferenceCategories);
    }
  }, [preferenceCategories, selectedCategories]);

  // Memoized filtered content to prevent unnecessary recalculations
  const filteredContent = useMemo(() => {
    const filterByCategories = (items: (NewsItem | MovieItem | SocialPost)[]) => {
      if (selectedCategories.length === 0) return [];
      return items.filter(item => 
        selectedCategories.includes(item.category) || 
        (selectedCategories.includes('general') && item.category === 'general')
      );
    };

    const filterByMovieGenres = (items: MovieItem[]) => {
      if (movieGenres.length === 0) return items; // Show all movies if no genres selected
      return items.filter(item => movieGenres.includes(item.category));
    };
    
    // For social posts, we should use socialCategories from preferences
    const filterBySocialCategories = (items: SocialPost[]) => {
      const socialCategories = preferences.socialCategories || [];
      // If no social categories are selected, show all social posts
      if (socialCategories.length === 0) return items;
      return items.filter(item => socialCategories.includes(item.category));
    };

    const filteredNews = filterByCategories(news) as NewsItem[];
    const filteredMovies = filterByMovieGenres(movies) as MovieItem[];
    const filteredSocial = filterBySocialCategories(social) as SocialPost[];
    const allContent = [...filteredNews, ...filteredMovies, ...filteredSocial];

    return {
      news: filteredNews,
      movies: filteredMovies,
      social: filteredSocial,
      all: allContent
    };
  }, [news, movies, social, selectedCategories, movieGenres, preferences.socialCategories]);

  // Handle drag and drop for each category
  // Determine which movies to show - search results or filtered content
  const moviesToDisplay = movieSearchQuery.trim() ? searchedMovies : filteredContent.movies;
  
  const { items: allItems, handleDragEnd: handleAllDragEnd } = useDndKit(filteredContent.all);
  const { items: newsItemsOrdered } = useDndKit(filteredContent.news);
  // Note: we need to cast moviesToDisplay as MovieItem[] to avoid type errors
  const { items: movieItemsOrderedRaw } = useDndKit(moviesToDisplay);
  const movieItemsOrdered = movieItemsOrderedRaw as MovieItem[]; // Type assertion
  const { items: socialItemsOrdered, handleDragEnd: handleSocialDragEnd } = useDndKit(filteredContent.social);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Movie search function
  const searchMovies = useCallback(async (query: string) => {
    // Reset error state
    setSearchError(null);
    
    // Clear results if the query is empty
    if (!query || !query.trim()) {
      setSearchedMovies([]);
      setIsSearching(false);
      return;
    }
    
    // Check minimum length requirement (at least 2 characters)
    if (query.trim().length < 2) {
      return;
    }
    
    try {
      setIsSearching(true);
      
      // Get OMDB API key from environment
      const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;
      const OMDB_API_URL = 'https://www.omdbapi.com/';
      
      if (!isOmdbApiKeyValid()) {
        console.error('OMDB API key is invalid or missing.');
        setSearchError('API key is missing or invalid');
        return;
      }
      
      const response = await axios.get(OMDB_API_URL, {
        params: {
          apikey: OMDB_API_KEY,
          s: query.trim(),
          type: 'movie',
        },
      });
      
      if (response.data.Response === 'True' && response.data.Search) {
        // Map the search results to MovieItem objects
        const searchResults: MovieItem[] = response.data.Search.map((movie: OMDBMovieResult) => ({
          id: uuidv4(),
          title: movie.Title,
          year: movie.Year,
          poster: movie.Poster,
          type: movie.Type,
          imdbID: movie.imdbID,
          category: 'search',
        }));
        
        setSearchedMovies(searchResults);
      } else {
        setSearchedMovies([]);
        if (response.data.Error) {
          setSearchError(response.data.Error);
        }
      }
    } catch (error: unknown) {
      console.error('Error searching movies:', error);
      setSearchedMovies([]);
      setSearchError(error instanceof Error ? error.message : 'Failed to search movies');
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // Use debounced search query to trigger API calls
  useEffect(() => {
    // Only search if there's an actual query
    if (debouncedSearchQuery && debouncedSearchQuery.trim() !== '') {
      searchMovies(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, searchMovies]);

  // Loading state - show loading for initial fetch or when no data and fetching
  if ((loading && !hasInitiallyFetched) || (loading && allItems.length === 0 && newsItemsOrdered.length === 0 && movieItemsOrdered.length === 0 && socialItemsOrdered.length === 0)) {
    return (
      <div>
        <ContentLoadingState layout={layout} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Error loading content. Please try again later.</p>
          </div>
          <button 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors" 
            onClick={() => {
              if (!isFetchingRef.current && selectedCategories.length > 0) {
                isFetchingRef.current = true;
                dispatch(fetchAllContent(selectedCategories)).finally(() => {
                  isFetchingRef.current = false;
                });
              }
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (allItems.length === 0 && newsItemsOrdered.length === 0 && movieItemsOrdered.length === 0 && socialItemsOrdered.length === 0) {
    return (
      <div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-lg">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-yellow-800">
              {selectedCategories.length === 0 
                ? 'Please select at least one category to see content.'
                : 'No content found for the selected categories. Try different categories or check your internet connection.'
              }
            </p>
          </div>
          <button 
            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            onClick={() => {
              if (!isFetchingRef.current && selectedCategories.length > 0) {
                isFetchingRef.current = true;
                dispatch(fetchAllContent(selectedCategories)).finally(() => {
                  isFetchingRef.current = false;
                });
              }
            }}
          >
            Refresh Content
          </button>
        </div>
      </div>
    );
  }

  // Render content by category with tabs
  return (
    <div className="w-full p-4 md:p-6">
      {/* Loading indicator for category changes */}
      {loading && hasInitiallyFetched && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-blue-800">Updating feed with new categories...</p>
          </div>
        </div>
      )}

      {/* View toggle and layout controls with integrated tabs */}
      <div className="flex justify-between mb-6 items-center gap-4">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex} className="flex-1 max-w-[80%]">
          <Tab.List className="flex rounded-lg p-2 space-x-2 tab-list-bg dark:bg-gray-800">
            <Tab
              className={({ selected }: { selected: boolean }) =>
                `w-full py-2.5 px-3 text-xs sm:text-sm font-medium leading-5 rounded-lg transition-all
                 ${selected
                  ? 'selected-tab'
                  : 'text-gray-700 dark:text-gray-300 tab-hover'
                }`
              }
            >
              <div className="flex items-center justify-center space-x-1">
                <FiBookOpen size={14} />
                <span>News ({newsItemsOrdered.length})</span>
              </div>
            </Tab>
            <Tab
              className={({ selected }: { selected: boolean }) =>
                `w-full py-2.5 px-3 text-xs sm:text-sm font-medium leading-5 rounded-lg transition-all
                 ${selected
                  ? 'selected-tab'
                  : 'text-gray-700 dark:text-gray-300 tab-hover'
                }`
              }
            >
              <div className="flex items-center justify-center space-x-1">
                <FiFilm size={14} />
                <span>Movies ({movieItemsOrdered.length})</span>
              </div>
            </Tab>
            <Tab
              className={({ selected }: { selected: boolean }) =>
                `w-full py-2.5 px-3 text-xs sm:text-sm font-medium leading-5 rounded-lg transition-all
                 ${selected
                  ? 'selected-tab'
                  : 'text-gray-700 dark:text-gray-300 tab-hover'
                }`
              }
            >
              <div className="flex items-center justify-center space-x-1">
                <FiUsers size={14} />
                <span>Social ({socialItemsOrdered.length})</span>
              </div>
            </Tab>
            <Tab
              className={({ selected }: { selected: boolean }) =>
                `w-full py-2.5 px-3 text-xs sm:text-sm font-medium leading-5 rounded-lg transition-all
                 ${selected
                  ? 'selected-tab'
                  : 'text-gray-700 dark:text-gray-300 tab-hover'
                }`
              }
            >
              <span>All ({allItems.length})</span>
            </Tab>
          </Tab.List>
        </Tab.Group>
        <div className="flex space-x-2">
          <button 
            className={`p-2.5 h-[42px] flex items-center justify-center rounded-lg transition-all ${
              layout === 'grid' 
                ? 'selected-layout-btn' 
                : 'unselected-layout-btn'
            }`}
            aria-label="Grid Layout"
            onClick={() => dispatch({ type: 'preferences/setLayout', payload: 'grid' })}
          >
            <FiGrid size={20} />
          </button>
          <button 
            className={`p-2.5 h-[42px] flex items-center justify-center rounded-lg transition-all ${
              layout === 'list' 
                ? 'selected-layout-btn' 
                : 'unselected-layout-btn'
            }`}
            aria-label="List Layout"
            onClick={() => dispatch({ type: 'preferences/setLayout', payload: 'list' })}
          >
            <FiList size={20} />
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="mb-6">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="hidden">
            <Tab className="hidden">
              <span>News</span>
            </Tab>
            <Tab className="hidden">
              <span>Movies</span>
            </Tab>
            <Tab className="hidden">
              <span>Social</span>
            </Tab>
            <Tab className="hidden">
              <span>All Content</span>
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-4">
            <AnimatePresence mode="wait">
              <Tab.Panel key="news">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <NewsByCategorySectionComponent 
                    layout={layout as 'grid' | 'list'} 
                  />
                </motion.div>
              </Tab.Panel>
              <Tab.Panel key="movies">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <MovieSection
                    movies={movieItemsOrdered}
                    layout={layout}
                    onSearch={searchMovies}
                    searchQuery={movieSearchQuery}
                    setSearchQuery={setMovieSearchQuery}
                    isSearching={isSearching}
                    searchError={searchError}
                    searchedMovies={searchedMovies}
                  />
                </motion.div>
              </Tab.Panel>
              <Tab.Panel key="social">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <SocialSection 
                    items={socialItemsOrdered} 
                    layout={layout} 
                    handleDragEnd={handleSocialDragEnd}
                    emptyMessage="No social posts found for the selected categories."
                    isMounted={isMounted}
                    sensors={sensors}
                  />
                </motion.div>
              </Tab.Panel>
              <Tab.Panel key="all">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ContentSection 
                    items={allItems} 
                    layout={layout} 
                    handleDragEnd={handleAllDragEnd}
                    emptyMessage="No content found for the selected categories."
                    isMounted={isMounted}
                    sensors={sensors}
                  />
                </motion.div>
              </Tab.Panel>
            </AnimatePresence>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

// Loading State Component
const ContentLoadingState: React.FC<{layout: string}> = ({ layout }) => {
  return (
    <div className={`w-full ${
      layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-8'
    }`}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg overflow-hidden">
          <div className="animate-pulse">
            <div className="h-40 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-5/6 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-4/6 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Content Section Component with drag and drop
interface ContentSectionProps {
  items: ContentItem[];
  layout: 'grid' | 'list';
  handleDragEnd: (event: DragEndEvent) => void;
  emptyMessage: string;
  isMounted: boolean;
  sensors: ReturnType<typeof useSensors>;
}

const ContentSection: React.FC<ContentSectionProps> = ({ items, layout, handleDragEnd, emptyMessage, isMounted, sensors }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // Simple layout without DnD for server rendering or when not mounted
  const renderSimpleLayout = () => (
    <div className={`w-full ${
      layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-8'
    }`}>
      {items.map((item, index) => (
        <div key={item.id}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ContentCard item={item} />
          </motion.div>
        </div>
      ))}
    </div>
  );

  // Full DnD layout for client rendering using @dnd-kit
  const renderDragDropLayout = () => (
    <div className="relative">
      {layout === 'grid' && (
        <div className="absolute -top-8 right-0 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          💡 Drag cards to reorder (DnD Kit)
        </div>
      )}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={items.map(item => String(item.id))}
          strategy={rectSortingStrategy}
        >
          <div className={`w-full ${
            layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-8'
          }`}>
            {items.map((item, index) => (
              <SortableContentCard 
                key={item.id} 
                item={item} 
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );

  // Only use DnD on the client side
  return isMounted ? renderDragDropLayout() : renderSimpleLayout();
};

// Component to display categorized news sections
interface NewsByCategorySectionProps {
  layout: 'grid' | 'list';
}

const NewsByCategorySectionComponent: React.FC<NewsByCategorySectionProps> = ({ layout }) => {
  // Use the categorized news hook to get news by category
  const { newsByCategory, loading, error, refreshNews } = useCategorizedNews();

  // Handle refresh of news content
  const handleRefresh = () => {
    refreshNews();
  };

  if (loading && Object.keys(newsByCategory).length === 0) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-7 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="h-5 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className={layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-8'}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden">
                      <div className="h-40 bg-gray-300"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-5/6 mb-2"></div>
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
          onClick={handleRefresh}
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
          <p className="text-yellow-800">No news articles found. Try selecting different categories or check your connection.</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button 
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            onClick={handleRefresh}
          >
            Refresh News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Removed News By Category title and refresh button as requested */}
      
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

export default CategorizedContentFeed;
