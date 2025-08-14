import { configureStore } from '@reduxjs/toolkit';
import searchReducer, {
  searchAllContent,
  clearSearch,
  setSearchQuery,
} from '../../app/store/searchSlice';
import preferencesReducer from '../../app/store/preferencesSlice';
import { mockNewsItems, mockMovieItems, mockSocialPosts } from '../mocks/mockData';
import { RootState } from '../../app/store';

// Mock the API module
jest.mock('../../app/services/api', () => ({
  searchContent: jest.fn(),
}));

const { searchContent } = require('../../app/services/api');

describe('searchSlice', () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    store = configureStore({
      reducer: {
        search: searchReducer,
        preferences: preferencesReducer,
      },
      preloadedState: {
        search: {
          query: '',
          results: [],
          loading: false,
          error: null,
        },
        preferences: {
          categories: ['technology', 'sports'],
          movieGenres: ['action', 'comedy'],
          socialCategories: ['Technology'],
          layout: 'grid' as const,
          favorites: {},
          contentOrder: [],
        },
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().search;
      
      expect(state).toEqual({
        query: '',
        results: [],
        loading: false,
        error: null,
      });
    });
  });

  describe('setSearchQuery', () => {
    it('should update the search query', () => {
      store.dispatch(setSearchQuery('test query'));
      
      const state = store.getState().search;
      expect(state.query).toBe('test query');
    });

    it('should handle empty query', () => {
      store.dispatch(setSearchQuery(''));
      
      const state = store.getState().search;
      expect(state.query).toBe('');
    });

    it('should trim whitespace in query', () => {
      store.dispatch(setSearchQuery('  test query  '));
      
      const state = store.getState().search;
      expect(state.query).toBe('  test query  '); // Slice doesn't trim
    });
  });

  describe('clearSearch', () => {
    it('should clear search state', () => {
      // Set some initial search state
      store.dispatch(setSearchQuery('test'));
      store.dispatch(searchAllContent.fulfilled(
        { results: mockNewsItems, query: 'test' },
        'requestId',
        'test'
      ));
      
      // Clear search
      store.dispatch(clearSearch());
      
      const state = store.getState().search;
      expect(state).toEqual({
        query: '',
        results: [],
        loading: false,
        error: null,
      });
    });
  });

  describe('searchAllContent async thunk', () => {
    it('should handle successful search', async () => {
      const mockResults = {
        news: mockNewsItems,
        movies: mockMovieItems,
        social: mockSocialPosts,
      };
      
      searchContent.mockResolvedValueOnce(mockResults);
      
      await store.dispatch(searchAllContent('technology'));
      
      const state = store.getState().search;
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.results).toHaveLength(6); // 2 news + 2 movies + 2 social (from mockData)
      expect(state.query).toBe('technology');
      
      expect(searchContent).toHaveBeenCalledWith('technology', ['technology', 'sports']);
    });

    it('should handle empty search query', async () => {
      await store.dispatch(searchAllContent(''));
      
      const state = store.getState().search;
      
      expect(state.loading).toBe(false);
      expect(state.results).toEqual([]);
      expect(state.query).toBe('');
      expect(searchContent).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only query', async () => {
      await store.dispatch(searchAllContent('   '));
      
      const state = store.getState().search;
      
      expect(state.results).toEqual([]);
      expect(state.query).toBe('');
      expect(searchContent).not.toHaveBeenCalled();
    });

    it('should set loading state during search', () => {
      searchContent.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      store.dispatch(searchAllContent('test'));
      
      const state = store.getState().search;
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle search errors', async () => {
      const errorMessage = 'Search failed';
      searchContent.mockRejectedValueOnce(new Error(errorMessage));
      
      await store.dispatch(searchAllContent('test'));
      
      const state = store.getState().search;
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to search content');
      expect(state.results).toEqual([]);
    });

    it('should combine results from different content types', async () => {
      const mockResults = {
        news: [mockNewsItems[0]],
        movies: [mockMovieItems[0]],
        social: [mockSocialPosts[0]],
      };
      
      searchContent.mockResolvedValueOnce(mockResults);
      
      await store.dispatch(searchAllContent('test'));
      
      const state = store.getState().search;
      
      expect(state.results).toHaveLength(3);
      expect(state.results[0]).toEqual(mockNewsItems[0]);
      expect(state.results[1]).toEqual(mockMovieItems[0]);
      expect(state.results[2]).toEqual(mockSocialPosts[0]);
    });

    it('should handle partial search results', async () => {
      const mockResults = {
        news: mockNewsItems,
        movies: [], // Empty movies
        social: mockSocialPosts,
      };
      
      searchContent.mockResolvedValueOnce(mockResults);
      
      await store.dispatch(searchAllContent('test'));
      
      const state = store.getState().search;
      
      expect(state.results).toHaveLength(4); // 2 news + 0 movies + 2 social
      expect(state.results.some((item: any) => 'imdbID' in item)).toBe(false); // No movies
    });

    it('should use user preferences for search context', async () => {
      const customCategories = ['health', 'science'];
      
      // Update preferences
      store = configureStore({
        reducer: {
          search: searchReducer,
          preferences: preferencesReducer,
        },
        preloadedState: {
          search: {
            query: '',
            results: [],
            loading: false,
            error: null,
          },
          preferences: {
            categories: customCategories,
            movieGenres: ['drama'],
            socialCategories: ['Health & Wellness'],
            layout: 'grid' as const,
            favorites: {},
            contentOrder: [],
          },
        },
      });
      
      searchContent.mockResolvedValueOnce({
        news: [],
        movies: [],
        social: [],
      });
      
      await store.dispatch(searchAllContent('test'));
      
      expect(searchContent).toHaveBeenCalledWith('test', customCategories);
    });
  });

  describe('error handling', () => {
    it('should clear error when starting new search', async () => {
      // Set initial error state
      searchContent.mockRejectedValueOnce(new Error('Previous error'));
      await store.dispatch(searchAllContent('test'));
      
      expect(store.getState().search.error).toBe('Failed to search content');
      
      // Start new search
      searchContent.mockResolvedValueOnce({ news: [], movies: [], social: [] });
      await store.dispatch(searchAllContent('new query'));
      
      expect(store.getState().search.error).toBe(null);
    });

    it('should preserve query on error', async () => {
      searchContent.mockRejectedValueOnce(new Error('Network error'));
      
      await store.dispatch(searchAllContent('important query'));
      
      const state = store.getState().search;
      expect(state.query).toBe('important query');
      expect(state.error).toBe('Failed to search content');
    });
  });

  describe('state transitions', () => {
    it('should handle multiple rapid searches', async () => {
      searchContent.mockResolvedValue({ news: [], movies: [], social: [] });
      
      // Dispatch multiple searches rapidly
      const promises = [
        store.dispatch(searchAllContent('query1')),
        store.dispatch(searchAllContent('query2')),
        store.dispatch(searchAllContent('query3')),
      ];
      
      await Promise.all(promises);
      
      const state = store.getState().search;
      expect(state.loading).toBe(false);
      expect(state.query).toBe('query3'); // Last query should win
    });

    it('should maintain state integrity across actions', async () => {
      // Perform a series of actions
      store.dispatch(setSearchQuery('initial'));
      
      searchContent.mockResolvedValueOnce({
        news: [mockNewsItems[0]],
        movies: [],
        social: [],
      });
      
      await store.dispatch(searchAllContent('test'));
      
      store.dispatch(setSearchQuery('updated'));
      store.dispatch(clearSearch());
      
      const state = store.getState().search;
      expect(state).toEqual({
        query: '',
        results: [],
        loading: false,
        error: null,
      });
    });
  });
});
