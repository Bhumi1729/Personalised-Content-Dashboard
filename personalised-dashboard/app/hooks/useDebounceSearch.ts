import { useEffect, useState, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { useAppDispatch } from './redux';
import { searchAllContent, setSearchQuery } from '../store/searchSlice';

export const useDebounceSearch = (delay = 500) => {
  const [inputValue, setInputValue] = useState('');
  const dispatch = useAppDispatch();

  // Create a debounced search function using useMemo to ensure it's stable
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      if (query && query.trim().length > 0) {
        dispatch(searchAllContent(query));
      }
    }, delay),
    [delay, dispatch]
  );

  useEffect(() => {
    // Always update the search query in the store
    dispatch(setSearchQuery(inputValue || ''));

    // Only trigger debounced search for non-empty queries
    if (inputValue && inputValue.trim() !== '') {
      debouncedSearch(inputValue);
    }

    return () => {
      // Check if debouncedSearch exists and has cancel method
      if (debouncedSearch && typeof debouncedSearch.cancel === 'function') {
        debouncedSearch.cancel();
      }
    };
  }, [inputValue, debouncedSearch, dispatch]);

  return {
    inputValue: inputValue || '',
    setInputValue,
  };
};
