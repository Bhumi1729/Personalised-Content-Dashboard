import { NewsItem, MovieItem, SocialPost, UserPreferences } from '../../app/types';

// Mock News Data
export const mockNewsItems: NewsItem[] = [
  {
    id: '1',
    source: { id: 'test-source', name: 'Test News' },
    author: 'Test Author',
    title: 'Test News Article',
    description: 'This is a test news article description',
    url: 'https://test.com/article-1',
    urlToImage: 'https://test.com/image-1.jpg',
    publishedAt: '2023-01-01T00:00:00Z',
    content: 'This is the full content of the test article',
    category: 'technology',
  },
  {
    id: '2',
    source: { id: 'test-source-2', name: 'Test Sports' },
    author: 'Sports Writer',
    title: 'Breaking Sports News',
    description: 'Latest sports update',
    url: 'https://test.com/sports-1',
    urlToImage: 'https://test.com/sports-image.jpg',
    publishedAt: '2023-01-02T00:00:00Z',
    content: 'Sports content here',
    category: 'sports',
  },
];

// Mock Movie Data
export const mockMovieItems: MovieItem[] = [
  {
    id: '1',
    title: 'Test Movie',
    year: '2023',
    poster: 'https://test.com/poster-1.jpg',
    type: 'movie',
    imdbID: 'tt1234567',
    category: 'action',
    runtime: '120 min',
    genre: 'Action, Adventure',
    director: 'Test Director',
    writer: 'Test Writer',
    actors: 'Test Actor 1, Test Actor 2',
    plot: 'This is a test movie plot',
    language: 'English',
    country: 'USA',
    rated: 'PG-13',
    released: '01 Jan 2023',
    awards: 'Test Award',
    ratings: [{ Source: 'IMDb', Value: '8.5/10' }],
    imdbRating: '8.5',
    metascore: '85',
    boxOffice: '$100,000,000',
  },
  {
    id: '2',
    title: 'Test Comedy',
    year: '2023',
    poster: 'https://test.com/poster-2.jpg',
    type: 'movie',
    imdbID: 'tt2345678',
    category: 'comedy',
    runtime: '95 min',
    genre: 'Comedy',
    director: 'Comedy Director',
    plot: 'A funny test movie',
    imdbRating: '7.2',
  },
];

// Mock Social Post Data
export const mockSocialPosts: SocialPost[] = [
  {
    id: 1,
    userId: 1,
    title: '',
    body: 'This is a test social media post about technology',
    image: 'https://test.com/social-1.jpg',
    username: 'Test User',
    category: 'Technology',
    timestamp: '2023-01-01T00:00:00Z',
    avatar: 'https://test.com/avatar-1.jpg',
    handle: '@testuser',
    likes: 150,
    comments: 25,
    shares: 10,
  },
  {
    id: 2,
    userId: 2,
    title: '',
    body: 'Health and wellness tips for developers',
    image: 'https://test.com/social-2.jpg',
    username: 'Health Guru',
    category: 'Health & Wellness',
    timestamp: '2023-01-02T00:00:00Z',
    avatar: 'https://test.com/avatar-2.jpg',
    handle: '@healthguru',
    likes: 89,
    comments: 12,
    shares: 5,
  },
];

// Mock User Preferences
export const mockUserPreferences: UserPreferences = {
  categories: ['technology', 'sports'],
  movieGenres: ['action', 'comedy'],
  socialCategories: ['Technology', 'Health & Wellness'],
  layout: 'grid',
  favorites: {},
  contentOrder: [],
};

// API Response Mocks
export const mockNewsApiResponse = {
  status: 'ok',
  totalResults: 2,
  articles: mockNewsItems.map(({ id, category, ...item }) => item),
};

export const mockOmdbApiResponse = {
  Search: [
    {
      Title: 'Test Movie',
      Year: '2023',
      imdbID: 'tt1234567',
      Type: 'movie',
      Poster: 'https://test.com/poster-1.jpg',
    },
  ],
  totalResults: '1',
  Response: 'True',
};

export const mockOmdbDetailResponse = {
  Title: 'Test Movie',
  Year: '2023',
  Runtime: '120 min',
  Genre: 'Action, Adventure',
  Director: 'Test Director',
  Plot: 'This is a test movie plot',
  imdbRating: '8.5',
  Response: 'True',
};

// Error Response Mocks
export const mockNewsApiErrorResponse = {
  status: 'error',
  code: 'apiKeyInvalid',
  message: 'Your API key is invalid or incorrect.',
};

export const mockOmdbApiErrorResponse = {
  Response: 'False',
  Error: 'Movie not found!',
};

// Utility function to create mock store state
export const createMockStoreState = (overrides = {}) => ({
  preferences: mockUserPreferences,
  content: {
    news: mockNewsItems,
    movies: mockMovieItems,
    social: mockSocialPosts,
    trending: [...mockNewsItems, ...mockMovieItems, ...mockSocialPosts],
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
  ...overrides,
});
