import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { searchContent } from '../services/api';
import { ContentItem } from '../types';

export const searchAllContent = createAsyncThunk(
  'search/searchAll',
  async (
    query: string,
    { rejectWithValue }
  ) => {
    if (!query.trim()) {
      return { results: [], query: '' };
    }
    
    try {
      // Note: categories are available in state but not used by current search implementation
      // const state = getState() as { preferences: { categories: string[] } };
      // const categories = state.preferences.categories;

  const { news, movies, social } = await searchContent(query, []);

      // Combine all results into a single array
      const results: ContentItem[] = [...news, ...movies, ...social];

      return { results, query };
    } catch {
      return rejectWithValue('Failed to search content');
    }
  }
);

interface SearchState {
  query: string;
  results: ContentItem[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  query: '',
  results: [],
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchAllContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        searchAllContent.fulfilled,
        (state, action: PayloadAction<{ results: ContentItem[]; query: string }>) => {
          state.loading = false;
          state.results = action.payload.results;
          state.query = action.payload.query;
        }
      )
      .addCase(searchAllContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Preserve the original query on error
        if (action.meta.arg) {
          state.query = action.meta.arg;
        }
      });
  },
});

export const { clearSearch, setSearchQuery } = searchSlice.actions;
export default searchSlice.reducer;
