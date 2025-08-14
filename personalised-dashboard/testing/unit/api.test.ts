// Mock axios first with a jest.fn() directly
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// Mock the API keys module
jest.mock('../../app/services/apiKeys', () => ({
  apiKeys: {
    NEWS_API_KEY: 'test-news-key',
    OMDB_API_KEY: 'test-omdb-key',
  },
  isNewsApiKeyValid: jest.fn(() => true),
  isOmdbApiKeyValid: jest.fn(() => true),
}));

// Import after mocking
import axios from 'axios';
import { 
  fetchNews, 
  fetchMovies, 
  fetchSocialPosts, 
  searchContent 
} from '../../app/services/api';
import { 
  mockNewsApiResponse, 
  mockOmdbApiResponse, 
  mockOmdbDetailResponse 
} from '../mocks/mockData';

// Get the mocked axios
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Define mock responses
const mockNewsResponse = {
  data: mockNewsApiResponse,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
};

const mockMovieSearchResponse = {
  data: mockOmdbApiResponse,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
};

const mockMovieDetailResponse = {
  data: mockOmdbDetailResponse,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
};

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockReset();
  });

  describe('fetchNews', () => {
    it('should fetch news successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockNewsResponse);
      
      const result = await fetchNews(['technology']);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://newsapi.org/v2/top-headlines',
        expect.objectContaining({
          params: expect.objectContaining({
            category: 'technology',
            country: 'us',
            pageSize: 100,
          }),
        })
      );
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle API error gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await fetchNews(['technology']);
      
      // fetchNews falls back to mock data when API fails
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty categories array', async () => {
      const result = await fetchNews([]);
      
      // fetchNews returns all supported categories when given empty array
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      // Should not call axios since it uses mock data fallback
    });
  });

  describe('fetchMovies', () => {
    it('should fetch movies successfully', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockMovieSearchResponse)
        .mockResolvedValueOnce(mockMovieDetailResponse);
      
      const result = await fetchMovies(['action']);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.omdbapi.com/',
        expect.objectContaining({
          params: expect.objectContaining({
            s: 'action',
            type: 'movie',
            page: 1,
          }),
        })
      );
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle movie API error gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Movie API Error'));
      
      const result = await fetchMovies(['action']);
      
      expect(result).toEqual([]);
    });

    it('should handle empty genres array', async () => {
      const result = await fetchMovies([]);
      
      expect(result).toEqual([]);
    });
  });

  describe('fetchSocialPosts', () => {
    it('should fetch social posts successfully', async () => {
      // fetchSocialPosts generates mock data directly, doesn't use axios
      const result = await fetchSocialPosts(['Technology']);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check that the posts have the expected structure
      if (result.length > 0) {
        const post = result[0];
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('body');
        expect(post).toHaveProperty('username');
        expect(post).toHaveProperty('category');
      }
    });

    it('should handle social posts API error gracefully', async () => {
      // Even though fetchSocialPosts generates mock data, test empty categories
      const result = await fetchSocialPosts(['NonExistentCategory']);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty categories array', async () => {
      const result = await fetchSocialPosts([]);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('searchContent', () => {
    it('should search content across multiple sources', async () => {
      // Mock all API responses for search
      mockedAxios.get
        .mockResolvedValueOnce(mockNewsResponse) // News search
        .mockResolvedValueOnce(mockMovieSearchResponse) // Movie search
        .mockResolvedValueOnce(mockMovieDetailResponse); // Movie details
      
      const result = await searchContent('test query', ['technology']);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('news');
      expect(result).toHaveProperty('movies');
      expect(result).toHaveProperty('social');
      expect(Array.isArray(result.news)).toBe(true);
      expect(Array.isArray(result.movies)).toBe(true);
      expect(Array.isArray(result.social)).toBe(true);
    });

    it('should handle search error gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Search Error'));
      
      const result = await searchContent('test query', ['technology']);
      
      expect(result).toEqual({ news: [], movies: [], social: [] });
    });

    it('should handle empty query', async () => {
      const result = await searchContent('', ['technology']);
      
      expect(result).toEqual({ news: [], movies: [], social: [] });
    });

    it('should handle empty categories', async () => {
      const result = await searchContent('test query', []);
      
      expect(result).toEqual({ news: [], movies: [], social: [] });
    });
  });

  describe('Error scenarios', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.get.mockRejectedValueOnce(networkError);
      
      const result = await fetchNews(['technology']);
      
      // fetchNews falls back to mock data when API fails
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle API rate limiting', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { message: 'Rate limit exceeded' },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(rateLimitError);
      
      const result = await fetchNews(['technology']);
      
      // fetchNews falls back to mock data when rate limited
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle invalid API responses', async () => {
      const invalidResponse = {
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      mockedAxios.get.mockResolvedValueOnce(invalidResponse);
      
      const result = await fetchNews(['technology']);
      
      // fetchNews falls back to mock data when response is invalid
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('API parameter validation', () => {
    it('should call news API with correct parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockNewsResponse);
      
      await fetchNews(['technology', 'sports']);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://newsapi.org/v2/top-headlines',
        expect.objectContaining({
          params: expect.objectContaining({
            apiKey: 'test-news-key',
            country: 'us',
            pageSize: 100,
          }),
        })
      );
    });

    it('should call movie API with correct parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockMovieSearchResponse);
      
      await fetchMovies(['action']);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.omdbapi.com/',
        expect.objectContaining({
          params: expect.objectContaining({
            apikey: 'test-omdb-key',
            s: 'action',
            type: 'movie',
            page: 1,
          }),
        })
      );
    });

    it('should not call external APIs for social posts', async () => {
      // fetchSocialPosts generates mock data internally
      const result = await fetchSocialPosts(['Technology']);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Axios should not be called for social posts
      expect(mockedAxios.get).not.toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/posts'
      );
    });
  });
});
