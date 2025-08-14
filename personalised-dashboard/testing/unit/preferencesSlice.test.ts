import preferencesReducer, {
  setCategories,
  setMovieGenres,
  setSocialCategories,
  setLayout,
  toggleFavorite,
  updateContentOrder,
  resetPreferences,
} from '../../app/store/preferencesSlice';
import { mockUserPreferences, mockNewsItems } from '../mocks/mockData';
import { UserPreferences } from '../../app/types';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock window.dispatchEvent
const mockDispatchEvent = jest.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
  writable: true,
});

describe('preferencesSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    // Reset setItem to its default behavior
    mockLocalStorage.setItem.mockImplementation(jest.fn());
  });

  describe('initial state', () => {
    it('should return default preferences when localStorage is empty', () => {
      const state = preferencesReducer(undefined, { type: 'unknown' });
      
      expect(state).toEqual({
        categories: ['technology', 'sports', 'entertainment'],
        movieGenres: ['action', 'comedy', 'drama'],
        socialCategories: ['Technology', 'Humor & Relatable Moments'],
        layout: 'grid',
        favorites: {},
        contentOrder: [],
      });
    });

    it('should load preferences from localStorage when available', () => {
      const savedPreferences = JSON.stringify(mockUserPreferences);
      mockLocalStorage.getItem.mockReturnValue(savedPreferences);

      // We need to reimport to trigger the initial state calculation
      jest.resetModules();
      const { default: freshReducer } = require('../../app/store/preferencesSlice');
      
      const state = freshReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(mockUserPreferences);
    });

    it('should handle corrupted localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      // Should not throw and use default values
      const state = preferencesReducer(undefined, { type: 'unknown' });
      expect(state).toBeDefined();
    });
  });

  describe('setCategories', () => {
    it('should update categories and save to localStorage', () => {
      const initialState = mockUserPreferences;
      const newCategories = ['technology', 'health'];
      
      const newState = preferencesReducer(initialState, setCategories(newCategories));
      
      expect(newState.categories).toEqual(newCategories);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'userPreferences',
        JSON.stringify({ ...initialState, categories: newCategories })
      );
      // Check that dispatch event was called with correct type
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'preferencesChanged'
        })
      );
    });

    it('should handle empty categories array', () => {
      const initialState = mockUserPreferences;
      const newCategories: string[] = [];
      
      const newState = preferencesReducer(initialState, setCategories(newCategories));
      
      expect(newState.categories).toEqual([]);
    });
  });

  describe('setMovieGenres', () => {
    it('should update movie genres and save to localStorage', () => {
      const initialState = mockUserPreferences;
      const newGenres = ['action', 'thriller'];
      
      const newState = preferencesReducer(initialState, setMovieGenres(newGenres));
      
      expect(newState.movieGenres).toEqual(newGenres);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should handle duplicate genres', () => {
      const initialState = mockUserPreferences;
      const newGenres = ['action', 'action', 'comedy'];
      
      const newState = preferencesReducer(initialState, setMovieGenres(newGenres));
      
      expect(newState.movieGenres).toEqual(newGenres); // Slice doesn't dedupe
    });
  });

  describe('setSocialCategories', () => {
    it('should update social categories and save to localStorage', () => {
      const initialState = mockUserPreferences;
      const newCategories = ['Technology', 'Fitness'];
      
      const newState = preferencesReducer(initialState, setSocialCategories(newCategories));
      
      expect(newState.socialCategories).toEqual(newCategories);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('setLayout', () => {
    it('should update layout to list', () => {
      const initialState = mockUserPreferences;
      
      const newState = preferencesReducer(initialState, setLayout('list'));
      
      expect(newState.layout).toBe('list');
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should update layout to grid', () => {
      const initialState = { ...mockUserPreferences, layout: 'list' as const };
      
      const newState = preferencesReducer(initialState, setLayout('grid'));
      
      expect(newState.layout).toBe('grid');
    });
  });

  describe('toggleFavorite', () => {
    it('should add item to favorites when not already favorited', () => {
      const initialState = mockUserPreferences;
      const newsItem = mockNewsItems[0];
      
      const newState = preferencesReducer(initialState, toggleFavorite(newsItem));
      
      expect(newState.favorites[newsItem.id]).toEqual(newsItem);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should remove item from favorites when already favorited', () => {
      const newsItem = mockNewsItems[0];
      const initialState: UserPreferences = {
        ...mockUserPreferences,
        favorites: { [newsItem.id]: newsItem },
      };
      
      const newState = preferencesReducer(initialState, toggleFavorite(newsItem));
      
      expect(newState.favorites[newsItem.id]).toBeUndefined();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should handle toggling multiple items', () => {
      const initialState = mockUserPreferences;
      const newsItem1 = mockNewsItems[0];
      const newsItem2 = mockNewsItems[1];
      
      let newState = preferencesReducer(initialState, toggleFavorite(newsItem1));
      newState = preferencesReducer(newState, toggleFavorite(newsItem2));
      
      expect(newState.favorites[newsItem1.id]).toEqual(newsItem1);
      expect(newState.favorites[newsItem2.id]).toEqual(newsItem2);
      expect(Object.keys(newState.favorites)).toHaveLength(2);
    });
  });

  describe('updateContentOrder', () => {
    it('should update content order and save to localStorage', () => {
      const initialState = mockUserPreferences;
      const newOrder = ['item1', 'item2', 'item3'];
      
      const newState = preferencesReducer(initialState, updateContentOrder(newOrder));
      
      expect(newState.contentOrder).toEqual(newOrder);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should handle empty content order', () => {
      const initialState = { ...mockUserPreferences, contentOrder: ['item1', 'item2'] };
      
      const newState = preferencesReducer(initialState, updateContentOrder([]));
      
      expect(newState.contentOrder).toEqual([]);
    });
  });

  describe('resetPreferences', () => {
    it('should reset all preferences to default values', () => {
      const modifiedState: UserPreferences = {
        categories: ['custom'],
        movieGenres: ['horror'],
        socialCategories: ['Custom Category'],
        layout: 'list',
        favorites: { 'item1': mockNewsItems[0] },
        contentOrder: ['item1', 'item2'],
      };
      
      const newState = preferencesReducer(modifiedState, resetPreferences());
      
      expect(newState).toEqual({
        categories: ['technology', 'sports', 'entertainment'],
        movieGenres: ['action', 'comedy', 'drama'],
        socialCategories: ['Technology', 'Humor & Relatable Moments'],
        layout: 'grid',
        favorites: {},
        contentOrder: [],
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('localStorage integration', () => {
    it('should save preferences on every change', () => {
      const initialState = mockUserPreferences;
      
      preferencesReducer(initialState, setCategories(['health']));
      preferencesReducer(initialState, setMovieGenres(['comedy']));
      preferencesReducer(initialState, setLayout('list'));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3);
    });

    it('should dispatch custom events on preferences change', () => {
      const initialState = mockUserPreferences;
      
      preferencesReducer(initialState, setCategories(['health']));
      
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'preferencesChanged',
        })
      );
    });

    it('should handle localStorage errors gracefully', () => {
      // Create a fresh copy of the mock that throws an error
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('LocalStorage error');
      });
      
      // Should not throw
      expect(() => {
        preferencesReducer(mockUserPreferences, setCategories(['health']));
      }).not.toThrow();
      
      // Restore the original mock
      mockLocalStorage.setItem = originalSetItem;
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      // Ensure localStorage mock is clean for edge case tests
      jest.clearAllMocks();
      mockLocalStorage.setItem.mockImplementation(jest.fn());
    });

    it('should handle undefined state', () => {
      const newState = preferencesReducer(undefined, setCategories(['test']));
      
      expect(newState.categories).toEqual(['test']);
    });

    it('should preserve other state properties when updating one', () => {
      const initialState = mockUserPreferences;
      
      const newState = preferencesReducer(initialState, setCategories(['health']));
      
      expect(newState.movieGenres).toEqual(initialState.movieGenres);
      expect(newState.socialCategories).toEqual(initialState.socialCategories);
      expect(newState.layout).toEqual(initialState.layout);
      expect(newState.favorites).toEqual(initialState.favorites);
    });
  });
});
