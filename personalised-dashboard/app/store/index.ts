import { configureStore } from '@reduxjs/toolkit';

import preferencesReducer from './preferencesSlice';
import contentReducer from './contentSlice';
import searchReducer from './searchSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    content: contentReducer,
    search: searchReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values like content items with functions or complex types
        ignoredActions: ['preferences/toggleFavorite'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
