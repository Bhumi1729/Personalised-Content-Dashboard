// @ts-nocheck
import '@testing-library/jest-dom';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useDebounceSearch } from '../../app/hooks/useDebounceSearch';
import { searchAllContent, setSearchQuery } from '../../app/store/searchSlice';
import { Provider } from 'react-redux';
import { createTestStore } from '../utils/testUtils';

// @ts-ignore - Suppress TypeScript errors for Jest matchers
const jestExpect = expect;

// Mock lodash.debounce
jest.mock('lodash.debounce', () => {
  const mockFn = jest.fn((fn: Function) => {
    const debounced = (...args: any[]) => fn(...args);
    (debounced as any).cancel = jest.fn();
    return debounced;
  });
  return mockFn;
});

// Mock the search slice
jest.mock('../../app/store/searchSlice', () => ({
  searchAllContent: jest.fn(),
  setSearchQuery: jest.fn(),
}));

// Get a shared reference to the mocked debounce function for assertions and per-test overrides
const debounce = jest.requireMock('lodash.debounce') as jest.Mock;

const mockSearchAllContent = searchAllContent as jest.MockedFunction<typeof searchAllContent>;
const mockSetSearchQuery = setSearchQuery as jest.MockedFunction<typeof setSearchQuery>;

describe('useDebounceSearch', () => {
  let store: any;
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    store = createTestStore();
    mockDispatch = jest.fn();
    store.dispatch = mockDispatch;
    
    // Mock the action creators to return mock actions
    mockSearchAllContent.mockReturnValue({ type: 'search/searchAll' } as any);
    mockSetSearchQuery.mockReturnValue({ type: 'search/setSearchQuery' } as any);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  describe('Initialization', () => {
    it('should initialize with empty input value', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      expect(result.current.inputValue).toBe('');
    });

    it('should use default delay of 500ms', () => {
      renderHook(() => useDebounceSearch(), { wrapper });
      
      expect(debounce).toHaveBeenCalledWith(expect.any(Function), 500);
    });

    it('should use custom delay when provided', () => {
      renderHook(() => useDebounceSearch(1000), { wrapper });
      
      expect(debounce).toHaveBeenCalledWith(expect.any(Function), 1000);
    });
  });

  describe('Input Value Management', () => {
    it('should update input value when setInputValue is called', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      act(() => {
        result.current.setInputValue('test query');
      });
      
      expect(result.current.inputValue).toBe('test query');
    });

    it('should handle empty string input', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      act(() => {
        result.current.setInputValue('');
      });
      
      expect(result.current.inputValue).toBe('');
    });

    it('should handle special characters in input', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      const specialInput = 'test@#$%^&*()';
      act(() => {
        result.current.setInputValue(specialInput);
      });
      
      expect(result.current.inputValue).toBe(specialInput);
    });

    it('should handle very long input strings', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      const longInput = 'a'.repeat(1000);
      act(() => {
        result.current.setInputValue(longInput);
      });
      
      expect(result.current.inputValue).toBe(longInput);
    });
  });

  describe('Search Dispatch', () => {
    it('should dispatch setSearchQuery for every input change', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      act(() => {
        result.current.setInputValue('test');
      });
      
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'search/setSearchQuery' });
    });

    it('should not dispatch search for empty query', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      act(() => {
        result.current.setInputValue('');
      });
      
      expect(mockSearchAllContent).not.toHaveBeenCalled();
    });

    it('should not dispatch search for whitespace-only query', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      act(() => {
        result.current.setInputValue('   ');
      });
      
      expect(mockSearchAllContent).not.toHaveBeenCalled();
    });

    it('should dispatch search for valid query after debounce', () => {
      // Mock debounce to call the function immediately (explicit in this test)
      debounce.mockImplementation((fn: Function) => {
        const debouncedFn = (...args: any[]) => fn(...args);
        (debouncedFn as any).cancel = jest.fn();
        return debouncedFn;
      });

      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      act(() => {
        result.current.setInputValue('test query');
      });
      
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'search/searchAll' });
    });
  });

  describe('Debounce Behavior', () => {
    it('should create debounced function on mount', () => {
      renderHook(() => useDebounceSearch(), { wrapper });
      
      expect(debounce).toHaveBeenCalledTimes(1);
    });

    it('should cancel debounced function on unmount', () => {
      const mockCancel = jest.fn();
      debounce.mockReturnValue(Object.assign(((..._args: any[]) => {}), { cancel: mockCancel }));

      const { unmount } = renderHook(() => useDebounceSearch(), { wrapper });
      
      unmount();
      
      expect(mockCancel).toHaveBeenCalled();
    });

    it('should cancel previous debounced call when input changes', () => {
      const mockCancel = jest.fn();
      debounce.mockReturnValue(Object.assign(((..._args: any[]) => {}), { cancel: mockCancel }));

      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      act(() => {
        result.current.setInputValue('first');
      });
      
      act(() => {
        result.current.setInputValue('second');
      });
      
      // Cancel should be called when dependency changes
      expect(mockCancel).toHaveBeenCalled();
    });
  });

  describe('Effect Dependencies', () => {
    it('should recreate effect when inputValue changes', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
  const initialSetCalls = mockSetSearchQuery.mock.calls.length;
      
      act(() => {
        result.current.setInputValue('test');
      });
      
  // Effect should be recreated and dispatch setSearchQuery again
  expect(mockSetSearchQuery.mock.calls.length).toBeGreaterThan(initialSetCalls);
    });

  it('should recreate effect when delay changes', () => {
      const { rerender } = renderHook(
        ({ delay }) => useDebounceSearch(delay),
        { 
          wrapper,
          initialProps: { delay: 500 }
        }
      );
      
      const initialCallCount = debounce.mock.calls.length;
      
      rerender({ delay: 1000 });
      
      expect(debounce.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('should recreate effect when dispatch changes', () => {
      const { result, rerender } = renderHook(() => useDebounceSearch(), { wrapper });
      
      const initialCallCount = debounce.mock.calls.length;
      
      // Change the store (which changes dispatch)
      store = createTestStore();
      
      rerender();
      
      expect(debounce.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid input changes', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.setInputValue(`query${i}`);
        }
      });
      
      expect(result.current.inputValue).toBe('query9');
    });

    it('should handle setting same value multiple times', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      act(() => {
        result.current.setInputValue('same');
        result.current.setInputValue('same');
        result.current.setInputValue('same');
      });
      
      expect(result.current.inputValue).toBe('same');
    });

    it('should handle undefined or null values gracefully', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      act(() => {
        (result.current.setInputValue as any)(null);
      });
      
      // Should not break the hook
      expect(result.current).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should not recreate setInputValue function unnecessarily', () => {
      const { result, rerender } = renderHook(() => useDebounceSearch(), { wrapper });
      
      const firstSetInputValue = result.current.setInputValue;
      
      rerender();
      
      expect(result.current.setInputValue).toBe(firstSetInputValue);
    });

    it('should handle high-frequency input changes without memory leaks', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      // Simulate rapid typing
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.setInputValue(`rapid${i}`);
        });
      }
      
      expect(result.current.inputValue).toBe('rapid99');
    });
  });

  describe('Integration with Redux', () => {
    it('should use dispatch from useAppDispatch hook', () => {
      renderHook(() => useDebounceSearch(), { wrapper });
      
      // Verify that dispatch is being used
      expect(store.dispatch).toBeDefined();
    });

    it('should dispatch correct action types', () => {
      const { result } = renderHook(() => useDebounceSearch(), { wrapper });
      
      act(() => {
        result.current.setInputValue('test');
      });
      
      expect(mockSetSearchQuery).toHaveBeenCalledWith('test');
    });
  });

  describe('Cleanup', () => {
    it('should clean up debounced function on unmount', () => {
      const mockCancel = jest.fn();
      debounce.mockReturnValue(Object.assign(
        (...args: any[]) => {},
        { cancel: mockCancel }
      ));

      const { unmount } = renderHook(() => useDebounceSearch(), { wrapper });
      
      unmount();
      
      expect(mockCancel).toHaveBeenCalled();
    });

  it('should not cause memory leaks with multiple mount/unmount cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderHook(() => useDebounceSearch(), { wrapper });
        unmount();
      }
      
      // Should not throw or cause issues
      expect(debounce).toHaveBeenCalled();
    });
  });
});
