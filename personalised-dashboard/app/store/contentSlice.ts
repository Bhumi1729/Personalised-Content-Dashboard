import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchNews, fetchMovies, fetchSocialPosts } from '../services/api';
import { ContentItem, MovieItem, NewsItem, SocialPost } from '../types';

export const fetchAllContent = createAsyncThunk(
  'content/fetchAll',
  async (categories: string[] = [], { rejectWithValue }) => {
    try {
      // ...existing code...
      // If no categories provided, use default categories
      const defaultCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
      const categoriesToUse = categories.length > 0 ? categories : defaultCategories;

      const [news, movies, social] = await Promise.all([
        fetchNews(categoriesToUse),
        fetchMovies(['action', 'comedy', 'drama']),
        fetchSocialPosts([]),
      ]);

      return { news, movies, social };
    } catch {
      return rejectWithValue('Failed to fetch content');
    }
  }
);

// Define the input parameters interface for fetchTrending
interface FetchTrendingParams {
  timeWindow?: number;
  language?: string;
}

export const fetchTrending = createAsyncThunk<NewsItem[], FetchTrendingParams | number | undefined>(
  'content/fetchTrending',
  async (params = 7, { rejectWithValue }) => {
    try {
      // ...existing code...
      // Import the fetchTrendingNews function
      const { fetchTrendingNews } = await import('../services/api');
      let timeWindow = 7;
      let language = 'en';
      if (typeof params === 'number') {
        timeWindow = params;
      } else if (typeof params === 'object') {
        timeWindow = params.timeWindow || 7;
        language = params.language || 'en';
      }
      const toDate = new Date().toISOString().split('T')[0];
      const daysInMs = Number(timeWindow) * 24 * 60 * 60 * 1000;
      const fromDate = new Date(Date.now() - daysInMs).toISOString().split('T')[0];
      const trendingNews = await fetchTrendingNews({
        from: fromDate,
        to: toDate,
        language,
        pageSize: 20,
        page: 1
      });
      return trendingNews;
    } catch {
      return rejectWithValue('Failed to fetch trending content');
    }
  }
);

interface ContentState {
  news: NewsItem[];
  movies: MovieItem[];
  social: SocialPost[];
  trending: ContentItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ContentState = {
  news: [],
  movies: [],
  social: [],
  trending: [],
  loading: false,
  error: null,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchAllContent
      .addCase(fetchAllContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllContent.fulfilled,
        (state, action: PayloadAction<{ news: NewsItem[]; movies: MovieItem[]; social: SocialPost[] }>) => {
          state.loading = false;
          state.news = action.payload.news;
          state.movies = action.payload.movies;
          state.social = action.payload.social;
        }
      )
      .addCase(fetchAllContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetchTrending
      .addCase(fetchTrending.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrending.fulfilled, (state, action: PayloadAction<ContentItem[]>) => {
        state.loading = false;
        state.trending = action.payload;
      })
      .addCase(fetchTrending.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default contentSlice.reducer;
