import { useState, useEffect, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useAppDispatch, useAppSelector } from './redux';
import { updateContentOrder } from '../store/preferencesSlice';
import { ContentItem } from '../types';
import { RootState } from '../store';

export const useDndKit = (contentItems: ContentItem[]) => {
  const dispatch = useAppDispatch();
  const savedOrder = useAppSelector((state: RootState) => state.preferences.contentOrder || []);
  const [items, setItems] = useState<ContentItem[]>([]);

  // Memoized function to generate ordered items
  const getOrderedItems = useCallback(() => {
    if (!contentItems.length) return [];
    
    if (!savedOrder.length) {
      // If no saved order, just use content items as is
      return contentItems;
    }
    
    // Create a map for quick lookup
    const itemsMap = new Map<string, ContentItem>();
    contentItems.forEach(item => {
      itemsMap.set(String(item.id), item);
    });
    
    // First, add items based on the saved order (if they exist in the current content)
    const orderedItems: ContentItem[] = [];
    
    // Add items in saved order if they exist
    savedOrder.forEach((id: string) => {
      const item = itemsMap.get(id);
      if (item) {
        orderedItems.push(item);
        itemsMap.delete(id); // Remove from map to avoid duplicates
      }
    });
    
    // Add any remaining items not in saved order
    const remainingItems = Array.from(itemsMap.values());
    
    return [...orderedItems, ...remainingItems];
  }, [contentItems, savedOrder]);

  // Initialize items based on saved order or default order
  useEffect(() => {
    // Get the ordered items and set them
    const orderedItems = getOrderedItems();
    
    // Use JSON.stringify to do a deep comparison before setting items
    const currentItemIds = JSON.stringify(items.map(i => i.id));
    const newItemIds = JSON.stringify(orderedItems.map(i => i.id));
    
    if (currentItemIds !== newItemIds) {
      setItems(orderedItems);
    }
  }, [getOrderedItems, items]);

  // Handle reordering with @dnd-kit
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex(item => String(item.id) === String(active.id));
    const newIndex = items.findIndex(item => String(item.id) === String(over.id));

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedItems = arrayMove(items, oldIndex, newIndex);
      setItems(reorderedItems);
      
      // Update the saved order in the store
      dispatch(updateContentOrder(reorderedItems.map(item => item.id.toString())));
    }
  };

  return {
    items,
    handleDragEnd,
  };
};
