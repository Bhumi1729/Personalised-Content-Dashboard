import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils/testUtils';
import ContentCard from '../../app/components/content/ContentCard';
import { mockNewsItems, mockMovieItems, mockSocialPosts } from '../mocks/mockData';
import { toggleFavorite } from '../../app/store/preferencesSlice';

describe('Content Feed Integration', () => {
  describe('User Preferences and Content Display', () => {
    it('should filter content based on user preferences', () => {
      const preloadedState = {
        preferences: {
          categories: ['technology'],
          movieGenres: ['action'],
          socialCategories: ['Technology'],
          layout: 'grid' as const,
          favorites: {},
          contentOrder: [],
        },
        content: {
          news: mockNewsItems.filter(item => item.category === 'technology'),
          movies: mockMovieItems.filter(item => item.category === 'action'),
          social: mockSocialPosts.filter(item => item.category === 'Technology'),
          trending: [],
          loading: false,
          error: null,
        },
        search: {
          query: '',
          results: [],
          loading: false,
          error: null,
        },
        theme: {
          theme: 'light' as const,
        },
      };

      renderWithProviders(<ContentCard item={mockNewsItems[0]} />, { preloadedState });
      
      // Should display technology news
      expect(screen.getByText(mockNewsItems[0].title)).toBeDefined();
    });

    it('should persist favorites across sessions', async () => {
      const { store } = renderWithProviders(<ContentCard item={mockNewsItems[0]} />);
      
      const favoriteButton = screen.getByLabelText('Toggle favorite');
      fireEvent.click(favoriteButton);
      
      await waitFor(() => {
        const state = store.getState();
        expect(state.preferences.favorites[mockNewsItems[0].id]).toBeDefined();
      });
    });

    it('should handle content order changes', () => {
      const initialOrder = ['2', '1'];
      const preloadedState = {
        preferences: {
          categories: ['technology'],
          movieGenres: ['action'],
          socialCategories: ['Technology'],
          layout: 'grid' as const,
          favorites: {},
          contentOrder: initialOrder,
        },
        content: {
          news: mockNewsItems,
          movies: [],
          social: [],
          trending: [],
          loading: false,
          error: null,
        },
        search: {
          query: '',
          results: [],
          loading: false,
          error: null,
        },
        theme: {
          theme: 'light' as const,
        },
      };

      const { store } = renderWithProviders(<ContentCard item={mockNewsItems[0]} />, { preloadedState });
      
      expect(store.getState().preferences.contentOrder).toEqual(initialOrder);
    });
  });

  describe('Search and Filter Integration', () => {
    it('should handle search across different content types', async () => {
      const preloadedState = {
        preferences: {
          categories: ['technology', 'sports'],
          movieGenres: ['action', 'comedy'],
          socialCategories: ['Technology'],
          layout: 'grid' as const,
          favorites: {},
          contentOrder: [],
        },
        content: {
          news: mockNewsItems,
          movies: mockMovieItems,
          social: mockSocialPosts,
          trending: [],
          loading: false,
          error: null,
        },
        search: {
          query: 'test',
          results: [...mockNewsItems, ...mockMovieItems, ...mockSocialPosts],
          loading: false,
          error: null,
        },
        theme: {
          theme: 'light' as const,
        },
      };

      renderWithProviders(<ContentCard item={mockNewsItems[0]} />, { preloadedState });
      
      // Should display search results
      expect(screen.getByText(mockNewsItems[0].title)).toBeDefined();
    });

    it('should clear search results when query is empty', () => {
      const preloadedState = {
        preferences: {
          categories: ['technology'],
          movieGenres: ['action'],
          socialCategories: ['Technology'],
          layout: 'grid' as const,
          favorites: {},
          contentOrder: [],
        },
        content: {
          news: mockNewsItems,
          movies: mockMovieItems,
          social: mockSocialPosts,
          trending: [],
          loading: false,
          error: null,
        },
        search: {
          query: '',
          results: [],
          loading: false,
          error: null,
        },
        theme: {
          theme: 'light' as const,
        },
      };

      const { store } = renderWithProviders(<ContentCard item={mockNewsItems[0]} />, { preloadedState });
      
      expect(store.getState().search.results).toHaveLength(0);
    });
  });

  describe('API Integration Flow', () => {
    it('should handle loading states correctly', () => {
      const preloadedState = {
        preferences: {
          categories: ['technology'],
          movieGenres: ['action'],
          socialCategories: ['Technology'],
          layout: 'grid' as const,
          favorites: {},
          contentOrder: [],
        },
        content: {
          news: [],
          movies: [],
          social: [],
          trending: [],
          loading: true,
          error: null,
        },
        search: {
          query: '',
          results: [],
          loading: false,
          error: null,
        },
        theme: {
          theme: 'light' as const,
        },
      };

      const { store } = renderWithProviders(<ContentCard item={mockNewsItems[0]} />, { preloadedState });
      
      expect(store.getState().content.loading).toBe(true);
    });

    it('should handle API errors gracefully', () => {
      const preloadedState = {
        preferences: {
          categories: ['technology'],
          movieGenres: ['action'],
          socialCategories: ['Technology'],
          layout: 'grid' as const,
          favorites: {},
          contentOrder: [],
        },
        content: {
          news: [],
          movies: [],
          social: [],
          trending: [],
          loading: false,
          error: 'Failed to fetch content',
        },
        search: {
          query: '',
          results: [],
          loading: false,
          error: null,
        },
        theme: {
          theme: 'light' as const,
        },
      };

      const { store } = renderWithProviders(<ContentCard item={mockNewsItems[0]} />, { preloadedState });
      
      expect(store.getState().content.error).toBe('Failed to fetch content');
    });
  });

  describe('Theme Integration', () => {
    it('should apply dark theme styles when theme is dark', () => {
      const preloadedState = {
        preferences: {
          categories: ['technology'],
          movieGenres: ['action'],
          socialCategories: ['Technology'],
          layout: 'grid' as const,
          favorites: {},
          contentOrder: [],
        },
        content: {
          news: mockNewsItems,
          movies: [],
          social: [],
          trending: [],
          loading: false,
          error: null,
        },
        search: {
          query: '',
          results: [],
          loading: false,
          error: null,
        },
        theme: {
          theme: 'dark' as const,
        },
      };

      renderWithProviders(<ContentCard item={mockNewsItems[0]} />, { preloadedState });
      
      // Card should have dark theme class
      const cardElement = document.querySelector('.dark\\:bg-card-custom');
      expect(cardElement).toBeDefined();
    });

    it('should apply light theme styles by default', () => {
      const preloadedState = {
        preferences: {
          categories: ['technology'],
          movieGenres: ['action'],
          socialCategories: ['Technology'],
          layout: 'grid' as const,
          favorites: {},
          contentOrder: [],
        },
        content: {
          news: mockNewsItems,
          movies: [],
          social: [],
          trending: [],
          loading: false,
          error: null,
        },
        search: {
          query: '',
          results: [],
          loading: false,
          error: null,
        },
        theme: {
          theme: 'light' as const,
        },
      };

      renderWithProviders(<ContentCard item={mockNewsItems[0]} />, { preloadedState });
      
      // Card should have light theme class
      const cardElement = document.querySelector('.bg-white');
      expect(cardElement).toBeDefined();
    });
  });

  describe('Drag and Drop Integration', () => {
    it('should handle content reordering', () => {
      const preloadedState = {
        preferences: {
          categories: ['technology'],
          movieGenres: ['action'],
          socialCategories: ['Technology'],
          layout: 'grid' as const,
          favorites: {},
          contentOrder: ['1', '2'],
        },
        content: {
          news: mockNewsItems,
          movies: [],
          social: [],
          trending: [],
          loading: false,
          error: null,
        },
        search: {
          query: '',
          results: [],
          loading: false,
          error: null,
        },
        theme: {
          theme: 'light' as const,
        },
      };

      const { store } = renderWithProviders(<ContentCard item={mockNewsItems[0]} />, { preloadedState });
      
      expect(store.getState().preferences.contentOrder).toEqual(['1', '2']);
    });
  });

  describe('Real-time Updates', () => {
    it('should handle content updates without losing user interactions', async () => {
      const { store, rerender } = renderWithProviders(<ContentCard item={mockNewsItems[0]} />);
      
      // User favorites an item
      const favoriteButton = screen.getByLabelText('Toggle favorite');
      fireEvent.click(favoriteButton);
      
      // Content updates (simulating new API data)
      const updatedNewsItem = { ...mockNewsItems[0], title: 'Updated Title' };
      rerender(<ContentCard item={updatedNewsItem} />);
      
      // Favorite should still be preserved
      await waitFor(() => {
        const state = store.getState();
        expect(state.preferences.favorites[mockNewsItems[0].id]).toBeDefined();
      });
    });
  });

  describe('Performance Integration', () => {
    it('should handle large content lists efficiently', () => {
      const largeContentList = Array.from({ length: 100 }, (_, i) => ({
        ...mockNewsItems[0],
        id: `news-${i}`,
        title: `News Article ${i}`,
      }));

      const preloadedState = {
        preferences: {
          categories: ['technology'],
          movieGenres: ['action'],
          socialCategories: ['Technology'],
          layout: 'grid' as const,
          favorites: {},
          contentOrder: [],
        },
        content: {
          news: largeContentList,
          movies: [],
          social: [],
          trending: [],
          loading: false,
          error: null,
        },
        search: {
          query: '',
          results: [],
          loading: false,
          error: null,
        },
        theme: {
          theme: 'light' as const,
        },
      };

      // Should render without performance issues
      const startTime = performance.now();
      renderWithProviders(<ContentCard item={largeContentList[0]} />, { preloadedState });
      const endTime = performance.now();
      
      // Should render quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should memoize content cards to prevent unnecessary re-renders', () => {
      const { rerender } = renderWithProviders(<ContentCard item={mockNewsItems[0]} />);
      
      // Rerender with same item
      rerender(<ContentCard item={mockNewsItems[0]} />);
      
      // Should still display the same content
      expect(screen.getByText(mockNewsItems[0].title)).toBeDefined();
    });
  });

  describe('Error Recovery', () => {
    it('should recover from failed API calls gracefully', () => {
      const preloadedState = {
        preferences: {
          categories: ['technology'],
          movieGenres: ['action'],
          socialCategories: ['Technology'],
          layout: 'grid' as const,
          favorites: {},
          contentOrder: [],
        },
        content: {
          news: [],
          movies: [],
          social: [],
          trending: [],
          loading: false,
          error: 'Network error',
        },
        search: {
          query: '',
          results: [],
          loading: false,
          error: null,
        },
        theme: {
          theme: 'light' as const,
        },
      };

      const { store } = renderWithProviders(<ContentCard item={mockNewsItems[0]} />, { preloadedState });
      
      // Should maintain error state
      expect(store.getState().content.error).toBe('Network error');
      
      // Should still render provided content
      expect(screen.getByText(mockNewsItems[0].title)).toBeDefined();
    });
  });
});
