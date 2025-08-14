'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ContentCard from './ContentCard';
import { ContentItem } from '../../types';
import { useAppSelector } from '../../hooks/redux';
import { RootState } from '../../store';
import { DragEndEvent, SensorDescriptor } from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface SocialSectionProps {
  items: ContentItem[];
  layout: 'grid' | 'list';
  handleDragEnd: (event: DragEndEvent) => void;
  emptyMessage: string;
  isMounted: boolean;
  sensors: SensorDescriptor<Record<string, unknown>>[];
}

const SocialSection: React.FC<SocialSectionProps> = ({ 
  items, 
  layout, 
  handleDragEnd, 
  emptyMessage, 
  isMounted, 
  sensors 
}) => {
  // Get the theme from Redux
  const theme = useAppSelector((state: RootState) => state.theme.theme);
  
  // Debug: Log the current theme
  console.log('SocialSection - Current theme:', theme);

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
  const [itemsPerPage] = useState(
    getStoredPreference('social-itemsPerPage', 9)
  );
  
  // Calculate total pages
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  
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

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // Simple layout without DnD for server rendering or when not mounted
  const renderSimpleLayout = () => (
    <div>
      <div className={`w-full ${
        layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-8'
      }`}>
        {currentItems.map((item, index) => (
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
      
      {/* Pagination */}
      {renderPagination()}
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
          items={currentItems.map(item => String(item.id))}
          strategy={rectSortingStrategy}
        >
          <div className={`w-full ${
            layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-8'
          }`}>
            {currentItems.map((item, index) => (
              <SortableContentCard 
                key={item.id} 
                item={item} 
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {/* Pagination */}
      {renderPagination()}
    </div>
  );

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
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
    );
  };

  // Only use DnD on the client side
  return isMounted ? renderDragDropLayout() : renderSimpleLayout();
};

export default SocialSection;
