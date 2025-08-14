'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchAllContent } from '../../store/contentSlice';
import ContentCard from './ContentCard';
import { ContentItem } from '../../types';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { RootState } from '../../store';

const SimpleDragDropFeed: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    news = [], 
    movies = [], 
    social = [],
    loading, 
    error 
  } = useAppSelector((state: RootState) => state.content);
  
  const [isMounted, setIsMounted] = useState(false);
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  
  // Update allContent when sources change
  useEffect(() => {
    const combinedContent = [...news, ...movies, ...social];
    setAllContent(combinedContent);
  }, [news, movies, social]);
  
  // Use the drag and drop hook to manage content order
  const { items, handleDragEnd } = useDragAndDrop(allContent);
  
  // Handle client-side only rendering to avoid hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch content when the component mounts
  useEffect(() => {
    if (allContent.length === 0) {
      dispatch(fetchAllContent([]));
    }
  }, [dispatch, allContent.length]);

  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-40 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error loading content: {error}</p>
        <button 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" 
          onClick={() => dispatch(fetchAllContent([]))}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isMounted) {
    // Simple layout for SSR
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
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
  }

  // Client-side render with drag and drop
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          🎯 Simple Drag & Drop Demo
        </h2>
        <p className="text-blue-700 text-sm">
          Drag and drop the cards below to reorder them. Your order will be saved automatically.
        </p>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="simple-feed" direction="vertical">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-all duration-300 ${
                        snapshot.isDragging 
                          ? 'z-50 rotate-1 scale-105 shadow-2xl' 
                          : 'hover:shadow-lg'
                      }`}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: snapshot.isDragging ? 1.02 : 1
                        }}
                        transition={{ 
                          delay: index * 0.05,
                          scale: { duration: 0.2 }
                        }}
                        className={snapshot.isDragging ? 'opacity-90' : ''}
                      >
                        <ContentCard item={item} />
                        {/* Drag indicator */}
                        <div className={`absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded transition-opacity ${
                          snapshot.isDragging ? 'opacity-100' : 'opacity-0'
                        }`}>
                          Dragging...
                        </div>
                      </motion.div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SimpleDragDropFeed;