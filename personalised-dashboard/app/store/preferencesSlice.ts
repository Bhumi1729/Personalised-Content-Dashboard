import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem, DashboardLayout, UserPreferences } from '../types';

// Get initial preferences from localStorage if available
const getInitialPreferences = (): UserPreferences => {
  if (typeof window !== 'undefined') {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        return JSON.parse(savedPreferences);
      } catch (e) {
        console.error('Failed to parse saved preferences', e);
      }
    }
  }
  
  // Default preferences
  return {
    categories: ['technology', 'sports', 'entertainment'],
    movieGenres: ['action', 'comedy', 'drama'],
    socialCategories: ['Technology', 'Humor & Relatable Moments'],
    layout: 'grid',
    favorites: {},
    contentOrder: [],
  };
};

const initialState = getInitialPreferences();

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
      savePreferences({ ...state, categories: action.payload });
    },
    setMovieGenres: (state, action: PayloadAction<string[]>) => {
      state.movieGenres = action.payload;
      savePreferences({ ...state, movieGenres: action.payload });
    },
    setSocialCategories: (state, action: PayloadAction<string[]>) => {
      state.socialCategories = action.payload;
      savePreferences({ ...state, socialCategories: action.payload });
    },
    setLayout: (state, action: PayloadAction<DashboardLayout>) => {
      state.layout = action.payload;
      savePreferences({ ...state, layout: action.payload });
    },
    toggleFavorite: (state, action: PayloadAction<ContentItem>) => {
      const item = action.payload;
      
      if (state.favorites[item.id]) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [item.id]: _, ...rest } = state.favorites;
        state.favorites = rest;
      } else {
        state.favorites[item.id] = item;
      }
      
      savePreferences({ ...state });
    },
    updateContentOrder: (state, action: PayloadAction<string[]>) => {
      state.contentOrder = action.payload;
      savePreferences({ ...state, contentOrder: action.payload });
    },
    resetPreferences: () => {
      const defaultPreferences: UserPreferences = {
        categories: ['technology', 'sports', 'entertainment'],
        movieGenres: ['action', 'comedy', 'drama'],
        socialCategories: ['Technology', 'Humor & Relatable Moments'],
        layout: 'grid',
        favorites: {},
        contentOrder: [],
      };
      savePreferences(defaultPreferences);
      return defaultPreferences;
    },
  },
});

// Helper function to save preferences to localStorage and emit a custom event
const savePreferences = (preferences: UserPreferences): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      // Dispatch a custom event to notify other components
      const event = new CustomEvent('preferencesChanged', { 
        detail: { preferences }
      });
      window.dispatchEvent(event);
    } catch (error) {
      // Handle localStorage errors gracefully (e.g., when storage is full or disabled)
      console.warn('Failed to save preferences to localStorage:', error);
    }
  }
};

export const {
  setCategories,
  setMovieGenres,
  setSocialCategories,
  setLayout,
  toggleFavorite,
  updateContentOrder,
  resetPreferences,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
