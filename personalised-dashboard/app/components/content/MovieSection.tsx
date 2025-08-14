'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ContentCard from './ContentCard';
import { MovieItem } from '../../types';
import { FiSearch, FiX } from 'react-icons/fi';
import { useAppSelector } from '../../hooks/redux';
import { RootState } from '../../store';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MovieSectionProps {
  movies: MovieItem[];
  layout: 'grid' | 'list';
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  searchError: string | null;
  onSearch?: (query: string) => Promise<void>;
  searchedMovies?: MovieItem[];
}

// Sortable wrapper for movie cards
function SortableMovieCard({ item, index }: { item: MovieItem; index: number }) {
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

const MovieSection: React.FC<MovieSectionProps> = ({ 
  movies, 
  layout, 
  searchQuery, 
  setSearchQuery,
  isSearching,
  searchError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSearch,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  searchedMovies,
}) => {
  // Get the theme from Redux
  const theme = useAppSelector((state: RootState) => state.theme.theme);
  
  // Drag and drop state
  const [localMovies, setLocalMovies] = useState<MovieItem[]>(movies);
  
  // Update local movies when props change
  React.useEffect(() => {
    setLocalMovies(movies);
  }, [movies]);
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setLocalMovies((items) => {
        const oldIndex = items.findIndex(item => String(item.id) === active.id);
        const newIndex = items.findIndex(item => String(item.id) === over?.id);
        
        const newItems = [...items];
        const [reorderedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, reorderedItem);
        
        return newItems;
      });
    }
  };
  
  // Load initial state from localStorage if available
  const getStoredPreference = (key: string, defaultValue: number): number => {
    if (typeof window === 'undefined') return defaultValue;
    
    const storedValue = localStorage.getItem(key);
    if (storedValue !== null) {
      return parseInt(storedValue, 10);
    }
    return defaultValue;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(
    getStoredPreference('movies-itemsPerPage', 12)
  );
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate total pages
  const totalPages = Math.ceil(localMovies.length / itemsPerPage);
  
  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = localMovies.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="mb-10">
      {/* Movie Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search movies by title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search for movies"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="w-5 h-5 text-gray-500" />
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {searchQuery.length === 1 && (
          <div className="mt-2 text-sm text-gray-600">
            Please enter at least 2 characters to search
          </div>
        )}
        
        {isSearching ? (
          <div className="mt-2 text-sm text-blue-600 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Searching for &quot;{searchQuery}&quot;...
          </div>
        ) : searchError ? (
          <div className="mt-2 text-sm text-red-600">
            Error: {searchError}
          </div>
        ) : (
          searchQuery && searchQuery.length > 1 && (
            <div className="mt-2 text-sm text-gray-600">
              Found {movies.length} {movies.length === 1 ? 'result' : 'results'} for &quot;{searchQuery}&quot;
            </div>
          )
        )}
      </div>
      
      {/* Movies header with count and items per page selector */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
          Movies <span className="text-sm font-normal">({movies.length} total)</span>
        </h2>
        <div className="flex items-center">
          <label className="mr-2 text-sm text-gray-700">Show:</label>
          <select 
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1"
            value={itemsPerPage}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setItemsPerPage(newValue);
              setCurrentPage(1); // Reset to first page when changing items per page
              
              // Save preference to localStorage
              if (typeof window !== 'undefined') {
                localStorage.setItem('movies-itemsPerPage', newValue.toString());
              }
            }}
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={movies.length}>All</option>
          </select>
        </div>
      </div>
      
      {/* Movies grid */}
      {movies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {searchQuery ? `No movies found matching "${searchQuery}"` : "No movies available"}
          </p>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={currentItems.map(item => String(item.id))}
            strategy={rectSortingStrategy}
          >
            <div 
              className={`${
                layout === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-6'
              }`}
            >
              {currentItems.map((item, index) => (
                <SortableMovieCard 
                  key={item.id} 
                  item={item} 
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 items-center">
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
            {/* Simplified pagination display */}
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
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              margin: '0 0.25rem',
              borderRadius: '0.25rem',
              backgroundColor: currentPage === totalPages 
                ? '#e5e7eb' // gray-200
                : theme === 'light'
                  ? '#000000' // black
                  : '#ffffff', // white
              color: currentPage === totalPages 
                ? '#6b7280' // gray-500
                : theme === 'light'
                  ? '#ffffff' // white
                  : '#000000', // black
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieSection;
