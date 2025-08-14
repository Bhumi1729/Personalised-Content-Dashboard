import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import preferencesReducer from '../../app/store/preferencesSlice';
import contentReducer from '../../app/store/contentSlice';
import searchReducer from '../../app/store/searchSlice';
import themeReducer from '../../app/store/themeSlice';
import { createMockStoreState } from '../mocks/mockData';
import { RootState } from '../../app/store';

// Create a custom render function that includes Redux Provider
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: any;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = createMockStoreState(),
    store = configureStore({
      reducer: {
        preferences: preferencesReducer,
        content: contentReducer,
        search: searchReducer,
        theme: themeReducer,
      },
      preloadedState: preloadedState as RootState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Utility to create a mock store
export function createTestStore(preloadedState = createMockStoreState()) {
  return configureStore({
    reducer: {
      preferences: preferencesReducer,
      content: contentReducer,
      search: searchReducer,
      theme: themeReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
}

// Utility to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock event utility
export const createMockEvent = (overrides = {}) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: { value: '' },
  currentTarget: { value: '' },
  ...overrides,
});

// Mock drag event utility
export const createMockDragEvent = (overrides = {}) => ({
  dataTransfer: {
    setData: jest.fn(),
    getData: jest.fn(),
    effectAllowed: 'move',
    dropEffect: 'move',
  },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  ...overrides,
});

// Test ID utilities
export const getTestId = (id: string) => `[data-testid="${id}"]`;

// Mock intersection observer entry
export const createMockIntersectionObserverEntry = (isIntersecting = true) => ({
  isIntersecting,
  intersectionRatio: isIntersecting ? 1 : 0,
  target: document.createElement('div'),
  boundingClientRect: new DOMRect(),
  intersectionRect: new DOMRect(),
  rootBounds: new DOMRect(),
  time: Date.now(),
});

// Custom matchers for Jest
export const customMatchers = {
  toHaveValidNewsItem: (received: any) => {
    const requiredFields = ['id', 'title', 'description', 'url', 'category'];
    const hasAllFields = requiredFields.every(field => received[field] !== undefined);
    
    return {
      message: () => 
        hasAllFields 
          ? `Expected object not to be a valid news item`
          : `Expected object to have all required news item fields: ${requiredFields.join(', ')}`,
      pass: hasAllFields,
    };
  },
  
  toHaveValidMovieItem: (received: any) => {
    const requiredFields = ['id', 'title', 'year', 'imdbID', 'category'];
    const hasAllFields = requiredFields.every(field => received[field] !== undefined);
    
    return {
      message: () => 
        hasAllFields 
          ? `Expected object not to be a valid movie item`
          : `Expected object to have all required movie item fields: ${requiredFields.join(', ')}`,
      pass: hasAllFields,
    };
  },
  
  toHaveValidSocialPost: (received: any) => {
    const requiredFields = ['id', 'body', 'username', 'category', 'timestamp'];
    const hasAllFields = requiredFields.every(field => received[field] !== undefined);
    
    return {
      message: () => 
        hasAllFields 
          ? `Expected object not to be a valid social post`
          : `Expected object to have all required social post fields: ${requiredFields.join(', ')}`,
      pass: hasAllFields,
    };
  },
};

// Setup for all tests
export const setupTest = () => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset localStorage mock
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
};

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
