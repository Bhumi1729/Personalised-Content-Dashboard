/**
 * API Keys management for the dashboard application
 * This file centralizes access to API keys and provides validation functions
 */

// Get API keys from environment variables
const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;

// API key validation functions
export const isNewsApiKeyValid = (): boolean => {
  if (!NEWS_API_KEY) {
    console.warn('News API key is not set. Check your .env file.');
    return false;
  }
  
  // Basic validation - should have a reasonable length
  if (NEWS_API_KEY.length < 20) {
    console.warn('News API key appears to be invalid (too short).');
    return false;
  }
  
  return true;
};

export const isOmdbApiKeyValid = (): boolean => {
  if (!OMDB_API_KEY) {
    console.warn('OMDB API key is not set. Check your .env file.');
    return false;
  }
  
  // OMDB API keys are typically 8 characters
  if (OMDB_API_KEY.length !== 8) {
    console.warn('OMDB API key appears to be invalid (wrong length).');
    return false;
  }
  
  return true;
};

// Function to check all API keys at once
export const validateAllApiKeys = (): {
  news: boolean;
  omdb: boolean;
} => {
  return {
    news: isNewsApiKeyValid(),
    omdb: isOmdbApiKeyValid()
  };
};

// Export keys for use in API service
export const apiKeys = {
  NEWS_API_KEY,
  OMDB_API_KEY
};

export default apiKeys;
