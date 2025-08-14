'use client';

import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchAllContent } from '../../store/contentSlice';
import ContentCard from './ContentCard';
import { ContentItem } from '../../types';
import { useDndKit } from '../../hooks/useDndKit';

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

const ContentFeed: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    news = [], 
    movies = [], 
    social = [],
    loading, 
    error 
  } = useAppSelector((state: import('../../types').AppState) => state.content);
  
  const layout = useAppSelector((state: import('../../types').AppState) => state.preferences.layout);
  const [isMounted, setIsMounted] = useState(false);
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  
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
  
  // Update allContent only when its sources change
  useEffect(() => {
    const combinedContent = [...news, ...movies, ...social];
    console.log('Content received:', { 
      news: news.length, 
      movies: movies.length, 
      social: social.length, 
      total: combinedContent.length,
      loading,
      error 
    });
    setAllContent(combinedContent);
  }, [news, movies, social, loading, error]);
  
  // Use the drag and drop hook to manage content order
  const { items, handleDragEnd } = useDndKit(allContent);
  
  // Handle client-side only rendering to avoid hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch content when the component mounts
  useEffect(() => {
    dispatch(fetchAllContent([]));
  }, [dispatch]);

  if (loading && items.length === 0) {
    // Enhanced loading state with multiple skeleton cards
    return (
      <div className={`w-full p-4 md:p-6 ${
        layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-8'
      }`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
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
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-lg mb-6">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">Error loading content</p>
            <p className="text-sm mt-1">
              {error.includes('rateLimited') || error.includes('rate') 
                ? '⚠️ API rate limit exceeded. Using fallback content or try again later.' 
                : 'Please try again later or check your internet connection.'}
            </p>
          </div>
        </div>
        <button 
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors" 
          onClick={() => dispatch(fetchAllContent([]))}
        >
          Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-lg">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-yellow-800">No content found. Try adjusting your preferences or check your internet connection.</p>
        </div>
        <button 
          className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          onClick={() => dispatch(fetchAllContent([]))}
        >
          Refresh Content
        </button>
      </div>
    );
  }

  // Simple layout without DnD for server rendering or when not mounted
  const renderSimpleLayout = () => (
    <div className={`w-full p-4 md:p-6 ${
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
          <div className={`w-full p-4 md:p-6 ${
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

export default ContentFeed;
