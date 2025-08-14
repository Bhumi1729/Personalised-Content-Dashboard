import axios from 'axios';
import { MovieItem, NewsApiResponse, NewsItem, OmdbApiResponse, SocialPost } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { apiKeys, isNewsApiKeyValid, isOmdbApiKeyValid } from './apiKeys';

// News API service
const NEWS_API_KEY = apiKeys.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2';

/**
 * Fetches trending news articles using NewsAPI's `everything` endpoint.
 * Articles are sorted by popularity, and can be optionally filtered by date ran    {           { body       { body: 'My code didn\'t work. Then I added a comment and it magically did—still shouting \'magic!\' in my head.', hashtags: '#DeveloperMagic #LOL #CodeHumor', category: 'Humor & Relatable Moments' },  { body: 'When the test suite passes and you whisper, \'I\'m sorry I doubted you\'—bragging rights earned.', hashtags: '#TestingLife #DevLife #RareVictory', category: 'Humor & Relatable Moments' }, { body: 'Opened my project Monday like it\'s a fresh surprise—Friday logic turned into spaghetti code overnight. Debug begins now.', hashtags: '#CodeLife #DevProblems #RealTalk', category: 'Humor & Relatable Moments' }, 'Dusk stroll through cobblestone lanes with lantern glow, distant laughter, and hidden cafes—it\'s magic found on quiet streets.', hashtags: '#UrbanEscape #TravelMoments #EveningWander', category: 'Travel & Lifestyle' }, { body: 'Stumbled upon a local artisan market filled with handcrafted goods and vibrant energy—it\'s amazing what\'s right in our own backyard.', hashtags: '#LocalTravel #SupportLocal #WeekendWander', category: 'Travel & Lifestyle' }, body: 'Tried resistance band circuit—it\'s compact, portable, and hit muscles in ways I hadn\'t expected.', hashtags: '#ResistanceTraining #WorkoutAnywhere #FitLife', category: 'Fitness' },  { body: 'Loved the burn from today\'s squat ladder—challenging, fun, and worth every muscle complaint.', hashtags: '#LegDay #WorkoutMotivation #StrongBody', category: 'Fitness' },body: 'Used a foam roller post-workout and feel less sore today—great recovery means ready for tomorrow\'s session.', hashtags: '#Recovery #FitnessTips #SelfCare', category: 'Fitness' },e.
 * 
 * @param {Object} options - Optional parameters for the API request
 * @param {string} options.q - Optional search keyword(s)
 * @param {string} options.from - Optional ISO 8601 start date
 * @param {string} options.to - Optional ISO 8601 end date
 * @param {string} options.language - Optional language filter (e.g., "en")
 * @param {number} options.pageSize - Number of results per page (max 100)
 * @param {number} options.page - Optional page number for pagination
 * @returns {Promise<NewsItem[]>} Array of news items
 */
export const fetchTrendingNews = async (options: {
  q?: string;
  from?: string;
  to?: string;
  language?: string;
  pageSize?: number;
  page?: number;
} = {}): Promise<NewsItem[]> => {
  try {
    console.log('🔄 Fetching trending news with options:', options);
    
    // Validate API key
    if (!isNewsApiKeyValid()) {
      console.error('News API key is invalid or missing. Please check your environment variables.');
      throw new Error('Invalid or missing News API key');
    }

    const defaultParams = {
      sortBy: 'popularity', // Sort by popularity
      language: 'en',       // Default to English
      pageSize: 20,         // Default page size
      page: 1               // Default to first page
    };

    // Merge default params with user options
    const params = {
      ...defaultParams,
      ...options,
      apiKey: NEWS_API_KEY
    };

    // If no query is provided, use a general query that returns popular news
    if (!params.q) {
      params.q = 'news';
    }
    
    const response = await axios.get<NewsApiResponse>(
      `${NEWS_API_URL}/everything`,
      {
        params,
        timeout: 10000,
      }
    );

    if (!response.data.articles || response.data.articles.length === 0) {
      return [];
    }

    // Validate and sanitize each article before returning
    const validArticles = response.data.articles.filter(article => 
      article.title && 
      article.url && 
      (article.description || article.content)
    );

    // Map response to NewsItem format with added id and category
    return validArticles.map((article) => ({
      ...article,
      id: uuidv4(),
      title: article.title || 'Untitled Article',
      description: article.description || article.content?.substring(0, 160) || 'No description available',
      category: 'trending' // Mark all as trending
    }));
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching trending news:', error.message);
      } else {
        console.error('Error fetching trending news:', error);
      }
      return [];
  }
};

export const fetchNews = async (categories: string[]): Promise<NewsItem[]> => {
  try {
    // Validate API key
    if (!isNewsApiKeyValid()) {
      console.error('News API key is invalid or missing. Please check your environment variables.');
      throw new Error('Invalid or missing News API key');
    }

    // If no categories are selected, fetch all supported categories
    const supportedCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
    
    // Handle invalid categories and fallbacks
    let userCategories: string[] = [];
    
    if (categories && categories.length > 0) {
      // Filter only valid categories
      userCategories = categories.filter(cat => supportedCategories.includes(cat));
      
      // If no valid categories remain, use general as fallback
      if (userCategories.length === 0) {
        userCategories = ['general'];
        console.log('No valid categories selected, falling back to "general"');
      }
    } else {
      // If no categories specified, use all supported categories
      userCategories = supportedCategories;
    }

    // Fetch news for each category in parallel
    const allResults = await Promise.all(
      userCategories.map(async (category) => {
        try {
          const response = await axios.get<NewsApiResponse>(
            `${NEWS_API_URL}/top-headlines`,
            {
              params: {
                apiKey: NEWS_API_KEY,
                country: 'us',
                category,
                pageSize: 100, // Get maximum available articles per category
              },
              timeout: 10000,
            }
          );

          // Handle specific API error responses
          if (response.data.status === 'error') {
            const errorMessage = response.data.message || 'Unknown API error';
            console.error(`News API error for category '${category}':`, errorMessage);
            
            // Log specific error types for debugging
            if (response.data.code === 'rateLimited') {
              console.error('🚨 NEWS API RATE LIMITED: You have exceeded the free tier limit (100 requests/24 hours)');
              console.error('💡 Solutions: 1) Wait for reset 2) Upgrade to paid plan 3) Use mock data');
            }
            
            return [];
          }

          if (!response.data.articles || response.data.articles.length === 0) {
            console.log(`No articles found for category: ${category}`);
            return [];
          }
          
          // Validate and sanitize each article before returning
          const validArticles = response.data.articles.filter(article => 
            article.title && 
            article.url && 
            (article.description || article.content)
          );
          
          // Map response to NewsItem format with added id and category
          return validArticles.map((article) => ({
            ...article,
            id: uuidv4(),
            title: article.title || 'Untitled Article',
            description: article.description || article.content?.substring(0, 160) || 'No description available',
            category, // Store the category with each article
          }));
          } catch (err) {
            console.error(`Error fetching news for category '${category}':`, err);
            // Handle rate limiting errors specifically
            if (
              typeof err === 'object' &&
              err !== null &&
              'response' in err &&
              (err.response as { data?: { code?: string } })?.data?.code === 'rateLimited'
            ) {
              console.error('🚨 NEWS API RATE LIMITED: Free tier limit exceeded');
              console.error('💡 Consider using mock data or upgrading your API plan');
            }
            return [];
        }
      })
    );

    // Flatten and deduplicate articles by url
    const allArticles = allResults.flat();
    const seenUrls = new Set<string>();
    const dedupedArticles: NewsItem[] = [];
    for (const article of allArticles) {
      if (!seenUrls.has(article.url)) {
        seenUrls.add(article.url);
        dedupedArticles.push(article);
      }
    }

    // If no articles were fetched due to rate limiting, return mock data
    if (dedupedArticles.length === 0) {
      console.warn('⚠️ No news articles fetched - API might be rate limited. Using mock data as fallback.');
      return getMockNewsData(userCategories);
    }

    return dedupedArticles;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching news:', error.message);
      } else {
        console.error('Error fetching news:', error);
      }
      // Return mock data as fallback when API fails
      console.warn('⚠️ Using mock news data as fallback due to API errors');
      return getMockNewsData(categories);
  }
};

// Helper function to determine the category of a news article
// Removed unused function: determineCategoryFromArticle

// OMDB API service
const OMDB_API_KEY = apiKeys.OMDB_API_KEY;
const OMDB_API_URL = 'https://www.omdbapi.com/';

export const fetchMovies = async (genres: string[]): Promise<MovieItem[]> => {
  try {
    // Validate API key
    if (!isOmdbApiKeyValid()) {
      console.error('OMDB API key is invalid or missing. Please check your environment variables.');
      throw new Error('Invalid or missing OMDB API key');
    }
    
    // Use genres directly as search terms
    const searchTerms = genres.length > 0 ? genres : ['action', 'comedy', 'drama'];
    
    // Fetch multiple pages of movies for each genre
    const allMoviePromises = searchTerms.map(async (genre) => {
      try {
        // First, get the total number of results to determine how many pages to fetch
        const initialResponse = await axios.get<OmdbApiResponse>(
          OMDB_API_URL,
          {
            params: {
              apikey: OMDB_API_KEY,
              s: genre,
              type: 'movie',
              page: 1
            },
          }
        );

        if (initialResponse.data.Response !== 'True' || !initialResponse.data.Search) {
          return [];
        }

        // Get total results and calculate number of pages (OMDB returns 10 items per page)
  const totalResults = parseInt(initialResponse.data.totalResults || '0', 10);
  // Fetch up to 5 pages per genre (50 movies) to allow more results
  const pagesToFetch = Math.min(5, Math.ceil(totalResults / 10));
        
        // Process first page results
        const firstPageMoviesBasic = initialResponse.data.Search.map((movie) => ({
          id: uuidv4(),
          title: movie.Title,
          year: movie.Year,
          poster: movie.Poster,
          type: movie.Type,
          imdbID: movie.imdbID,
          category: genre,
        }));
        
        // Fetch detailed info for each movie using our new helper function
        const firstPageMoviesDetailed = await Promise.all(
          firstPageMoviesBasic.map(async (movie) => {
            try {
              // Use our new helper function that tries imdbID first, then falls back to title
              const detailedInfo = await fetchFullMovieDetails(movie.imdbID, movie.title);
              
              if (Object.keys(detailedInfo).length > 0) {
                return {
                  ...movie,
                  poster: detailedInfo.Poster || movie.poster,
                  runtime: detailedInfo.Runtime || 'N/A',
                  genre: detailedInfo.Genre || 'N/A',
                  director: detailedInfo.Director || 'N/A',
                  writer: detailedInfo.Writer || 'N/A',
                  actors: detailedInfo.Actors || 'N/A',
                  plot: detailedInfo.Plot || 'No plot available',
                  language: detailedInfo.Language || 'N/A',
                  country: detailedInfo.Country || 'N/A',
                  rated: detailedInfo.Rated || 'N/A',
                  released: detailedInfo.Released || 'N/A',
                  awards: detailedInfo.Awards || 'N/A',
                  ratings: detailedInfo.Ratings || [],
                  imdbRating: detailedInfo.imdbRating || 'N/A',
                  metascore: detailedInfo.Metascore || 'N/A',
                  boxOffice: detailedInfo.BoxOffice || 'N/A',
                };
              }
              
              return movie;
            } catch (error) {
              console.error(`Error fetching details for movie ${movie.title}:`, error);
              return movie;
            }
          })
        );
        
        const firstPageMovies = firstPageMoviesDetailed;

        // If we need more than one page
        if (pagesToFetch > 1) {
          // Create array of page numbers to fetch, starting from page 2
          const additionalPagePromises = Array.from({ length: pagesToFetch - 1 }, (_, i) => i + 2)
            .map(async (page) => {
              const pageResponse = await axios.get<OmdbApiResponse>(
                OMDB_API_URL,
                {
                  params: {
                    apikey: OMDB_API_KEY,
                    s: genre,
                    type: 'movie',
                    page: page, // Specify the page number to get next set of results
                  },
                }
              );

              if (pageResponse.data.Response === 'True' && pageResponse.data.Search) {
                const pageMoviesBasic = pageResponse.data.Search.map((movie) => ({
                  id: uuidv4(),
                  title: movie.Title,
                  year: movie.Year,
                  poster: movie.Poster,
                  type: movie.Type,
                  imdbID: movie.imdbID,
                  category: genre,
                }));
                
                // Fetch detailed info for each movie on additional pages
                const pageMoviesDetailed = await Promise.all(
                  pageMoviesBasic.map(async (movie) => {
                    try {
                      // Use our new helper function that tries imdbID first, then falls back to title
                      const detailedInfo = await fetchFullMovieDetails(movie.imdbID, movie.title);
                      
                      if (Object.keys(detailedInfo).length > 0) {
                        return {
                          ...movie,
                          poster: detailedInfo.Poster || movie.poster,
                          runtime: detailedInfo.Runtime || 'N/A',
                          genre: detailedInfo.Genre || 'N/A',
                          director: detailedInfo.Director || 'N/A',
                          writer: detailedInfo.Writer || 'N/A',
                          actors: detailedInfo.Actors || 'N/A',
                          plot: detailedInfo.Plot || 'No plot available',
                          language: detailedInfo.Language || 'N/A',
                          country: detailedInfo.Country || 'N/A',
                          rated: detailedInfo.Rated || 'N/A',
                          released: detailedInfo.Released || 'N/A',
                          awards: detailedInfo.Awards || 'N/A',
                          ratings: detailedInfo.Ratings || [],
                          imdbRating: detailedInfo.imdbRating || 'N/A',
                          metascore: detailedInfo.Metascore || 'N/A',
                          boxOffice: detailedInfo.BoxOffice || 'N/A',
                        };
                      }
                      
                      return movie;
                    } catch (error) {
                      console.error(`Error fetching details for movie ${movie.title}:`, error);
                      return movie;
                    }
                  })
                );
                
                return pageMoviesDetailed;
              }
              return [];
            });

          // Wait for all additional pages and combine with first page
          const additionalMovies = (await Promise.all(additionalPagePromises)).flat();
          return [...firstPageMovies, ...additionalMovies];
        }

        return firstPageMovies;
      } catch (error) {
        console.error(`Error fetching movies for genre ${genre}:`, error);
        return [];
      }
    });

    // Combine all movie results and limit to a reasonable number in total
    const allMovies = (await Promise.all(allMoviePromises)).flat();
    
    // Sort movies by year in descending order (most recent first)
    const sortedMovies = allMovies.sort((a, b) => {
      // Extract year numbers for comparison
      // Some movies might have year ranges like "2020-2021"
      const yearA = parseInt(a.year.split('-')[0], 10);
      const yearB = parseInt(b.year.split('-')[0], 10);
      
      return yearB - yearA; // Descending order (most recent first)
    });
    
  // Return up to 100 movies total (increased from 60)
  return sortedMovies.slice(0, Math.min(100, sortedMovies.length));
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

// Helper function to map user categories to relevant movie search terms
// Removed unused functions: mapCategoriesToMovieTerms, getCategoryFromSearchTerm

// Mock Social Media API (using JSONPlaceholder)
// Mock Social Media API (using JSONPlaceholder)
export const fetchSocialPosts = async (_: string[] = [], socialCategories: string[] = []): Promise<SocialPost[]> => {
  // Generate more realistic mock social media posts
  const mockUsers = [
    { name: 'Alice Johnson', username: 'alicej', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Bob Smith', username: 'bob_smith', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Carlos Rivera', username: 'carlosr', avatar: 'https://randomuser.me/api/portraits/men/85.jpg' },
    { name: 'Diana Lee', username: 'dianalee', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { name: 'Emily Chen', username: 'emchen', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
  ];

  // Each entry: [body, hashtags, image]
  // Add istrending property to some posts
  const mockPosts: { body: string; hashtags: string; category: string; image: string; istrending?: boolean }[] = [
    // Technology
    { 
      body: 'I automated deployments with GitHub Actions and now a single push to main triggers live updates—dev life simplified with CI/CD magic.', 
      hashtags: '#DevOps #Automation #CodeLife', 
      category: 'Technology', 
      image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Built a VS Code snippet plugin for boilerplate—coding feels faster and cleaner when typing less and creating more.', 
      hashtags: '#DeveloperTools #VSCode #Productivity', 
      category: 'Technology', 
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Refactoring with Redux Toolkit cleaned up all state logic—boilerplate gone, debugging easier than ever before.', 
      hashtags: '#ReactJS #CleanCode #DevUX', 
      category: 'Technology', 
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Testing Localstack for AWS services—just mocked S3 and DynamoDB in under 5 minutes. Speedy backend development FTW.', 
      hashtags: '#Serverless #Testing #Localstack', 
      category: 'Technology', 
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Upgraded error monitoring using Sentry—caught production bugs before they became users\' problems. Proactive dev is best.', 
      hashtags: '#ErrorTracking #SRE #Sentry', 
      category: 'Technology', 
      image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },

    // Health & Wellness
    { 
      body: 'Started each morning with 10-minute mindfulness—focused, calm, and my stress levels have noticeably dropped.', 
      hashtags: '#Mindfulness #SelfCare #MentalHealth', 
      category: 'Health & Wellness', 
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Replaced my afternoon soda with infused water—still refreshing, less sugar, and my energy is more consistent now.', 
      hashtags: '#HealthyHabits #Hydration #Wellness', 
      category: 'Health & Wellness', 
      image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'A quick desk stretch every hour rescued me from shoulder aches—small changes that make big ergonomic difference.', 
      hashtags: '#DeskWellness #Ergonomics #WorkHealth', 
      category: 'Health & Wellness', 
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Took a walk outdoors without my phone—just fresh air and nature. Felt like a reset button for my brain.', 
      hashtags: '#DigitalDetox #MindfulLiving #Nature', 
      category: 'Health & Wellness', 
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Added a sunset meditation session—ended my day with calm breathwork and steadier sleep quality.', 
      hashtags: '#EveningRitual #Relaxation #InnerPeace', 
      category: 'Health & Wellness', 
      image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Swapped late-night snacks for herbal tea—the ritual calms my mind and supports digestion much better.', 
      hashtags: '#HealthySwap #Wellbeing #NightRoutine', 
      category: 'Health & Wellness', 
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Implemented hydration reminders every hour—my concentration and mood have improved, plus skin glows more.', 
      hashtags: '#HydrationHack #DailyWellness #SelfCare', 
      category: 'Health & Wellness', 
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Took a mid-day break for deep breathing—5 minutes of pause helped me reset and overcome mental fatigue.', 
      hashtags: '#MindfulnessBreak #WorkWellness #Calm', 
      category: 'Health & Wellness', 
      image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Started a gratitude journal at night—listing small wins before bed calms my mind and improves sleep.', 
      hashtags: '#Gratitude #MentalHealth #DailyRitual', 
      category: 'Health & Wellness', 
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Swapped one screen hour for reading a physical book every evening—it feels restorative and frees my mind.', 
      hashtags: '#ScreenBreak #SelfCare #PeacefulEvenings', 
      category: 'Health & Wellness', 
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    },

    // Fitness
    { 
      body: 'Crushed a 15-minute HIIT session before breakfast—felt woken up, energized, and ready to take on the day.', 
      hashtags: '#HIIT #HomeWorkout #FitStart', 
      category: 'Fitness', 
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Beat my 5K personal best with consistency in training—progress indeed comes from showing up.', 
      hashtags: '#Running #FitnessGoals #Consistency', 
      category: 'Fitness', 
      image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Sneaked in calf raises while brushing teeth—micro workouts add up when life is busy.', 
      hashtags: '#FitnessHacks #HealthyHabits #EverydayFitness', 
      category: 'Fitness', 
      image: 'https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Used a foam roller post-workout and feel less sore today—great recovery means ready for tomorrow\'s session.', 
      hashtags: '#Recovery #FitnessTips #SelfCare', 
      category: 'Fitness', 
      image: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Yoga flow at lunch break cleared mental clutter and improved posture—flexibility meets focus.', 
      hashtags: '#YogaBreak #WorkWellness #Stretch', 
      category: 'Fitness', 
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Swapped afternoon coffee for green tea—felt calm energy and fewer caffeine jitters.', 
      hashtags: '#HealthyAlternative #FitnessFuel #Wellness', 
      category: 'Fitness', 
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'From zero to consistent push-up sets in a month—strength is built one rep at a time.', 
      hashtags: '#FitnessJourney #BodyweightTraining #Progress', 
      category: 'Fitness', 
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Loved the burn from today\'s squat ladder—challenging, fun, and worth every muscle complaint.', 
      hashtags: '#LegDay #WorkoutMotivation #StrongBody', 
      category: 'Fitness', 
      image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Tried resistance band circuit—its compact, portable, and hit muscles in ways I hadn\'t expected.', 
      hashtags: '#ResistanceTraining #WorkoutAnywhere #FitLife', 
      category: 'Fitness', 
      image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Ended day with a calming stretch sequence—lengthened muscles and calmed my mind after screen time.', 
      hashtags: '#Stretching #EveningRoutine #Wellness', 
      category: 'Fitness', 
      image: 'https://images.unsplash.com/photo-1607914660217-754fdd90041d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },

    // Travel & Lifestyle
    { 
      body: 'Spent my morning writing by a riverside café—coffee, the gentle water flow, and sunlight made productivity feel indulgent.', 
      hashtags: '#CaféVibes #CreativeFlow #CozyMornings', 
      category: 'Travel & Lifestyle', 
      image: 'https://images.unsplash.com/photo-1592809617613-434cd2efab9d?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      istrending: true 
    },
    { 
      body: 'Stumbled upon a local artisan market filled with handcrafted goods and vibrant energy—it\'s amazing what\'s right in our own backyard.', 
      hashtags: '#LocalTravel #SupportLocal #WeekendWander', 
      category: 'Travel & Lifestyle', 
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Rainy night in with tea and poetry—soft lamps, warm mug, and introspection equals the sweetest comfort.', 
      hashtags: '#CozyLife #SelfCare #NightIn', 
      category: 'Travel & Lifestyle', 
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Dusk stroll through cobblestone lanes with lantern glow, distant laughter, and hidden cafes—it\'s magic found on quiet streets.', 
      hashtags: '#UrbanEscape #TravelMoments #EveningWander', 
      category: 'Travel & Lifestyle', 
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Cloud-watching in my backyard with soft music—beautiful reminder that stillness speaks volumes.', 
      hashtags: '#SlowLiving #Mindfulness #NatureTherapy', 
      category: 'Travel & Lifestyle', 
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Staycation turned adventure—discovered a hidden park waterfall a few blocks away. Hidden gems everywhere.', 
      hashtags: '#Staycation #LocalGems #NatureNearby', 
      category: 'Travel & Lifestyle', 
      image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Favorite brunch spot with sunlight streaming in, a book, and perfectly brewed coffee—simple pleasures are everything.', 
      hashtags: '#CaféLife #BrunchVibes #SimpleJoy', 
      category: 'Travel & Lifestyle', 
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Tuned my porch into a zen nook—plants, fairy lights, and a good playlist. Peaceful evenings never looked better.', 
      hashtags: '#OutdoorLiving #CozyCorner #Relax', 
      category: 'Travel & Lifestyle', 
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'City sunset paint the skyline pink—took a moment to freeze beauty before the hustle.', 
      hashtags: '#UrbanBeauty #SunsetChasers #MindfulMoments', 
      category: 'Travel & Lifestyle', 
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Night sky full of stars, polyphonic crickets, and no urban glow—my favorite view yet.', 
      hashtags: '#StarGazing #NatureLove #QuietNights', 
      category: 'Travel & Lifestyle', 
      image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=400&q=80'
    },

    // Humor & Relatable Moments
    { 
      body: 'When your build passes on first try—cue the victory dance and instant confidence boost.', 
      hashtags: '#DeveloperLife #SmallWins #CodeHumor', 
      category: 'Humor & Relatable Moments', 
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Spilled coffee on my keyboard but the build passed anyway—technology loves a good drama.', 
      hashtags: '#RemoteWork #CoffeeFails #DevStruggles', 
      category: 'Humor & Relatable Moments', 
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Debugged a race condition by adding a delay—sometimes the oldest tricks are still the best.', 
      hashtags: '#TechHumor #CodeFix #DevHacks', 
      category: 'Humor & Relatable Moments', 
      image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Restarted computer, restarted dev, restarted life—and somehow things worked after that.', 
      hashtags: '#ITCrowd #TechLife #CoffeeFix', 
      category: 'Humor & Relatable Moments', 
      image: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'When auto-indentation ruins your code but it compiles anyway—embracing chaos, one build at a time.', 
      hashtags: '#FormattingFails #DevMood #LOL', 
      category: 'Humor & Relatable Moments', 
      image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'My code didn\'t work. Then I added a comment and it magically did—still shouting \'magic!\' in my head.', 
      hashtags: '#DeveloperMagic #LOL #CodeHumor', 
      category: 'Humor & Relatable Moments', 
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'Pretended I was debugging but really just timed how long I could stare at the screen—time well wasted.', 
      hashtags: '#Procrastination #DevLife #Relatable', 
      category: 'Humor & Relatable Moments', 
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=400&q=80',
      istrending: true 
    },
    { 
      body: 'When the test suite passes and you whisper, \'I\'m sorry I doubted you\'—bragging rights earned.', 
      hashtags: '#TestingLife #DevLife #RareVictory', 
      category: 'Humor & Relatable Moments', 
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'
    },
    { 
      body: 'Opened my project Monday like it\'s a fresh surprise—Friday logic turned into spaghetti code overnight. Debug begins now.', 
      hashtags: '#CodeLife #DevProblems #RealTalk', 
      category: 'Humor & Relatable Moments', 
      image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=400&q=80'
    },
  ];

  const now = Date.now();
  
  // Filter posts by selected social categories if any are selected
  let filteredPosts = [...mockPosts];
  console.log('Social categories received:', socialCategories);
  console.log('All available post categories:', [...new Set(mockPosts.map(post => post.category))]);
  
  if (socialCategories && socialCategories.length > 0) {
    filteredPosts = mockPosts.filter(post => socialCategories.includes(post.category));
    console.log(`Filtering social posts by categories: ${socialCategories.join(', ')}`);
    console.log(`Found ${filteredPosts.length} posts in selected categories`);
    
    // Debug: Print some sample posts
    if (filteredPosts.length > 0) {
      console.log('Sample filtered posts categories:', filteredPosts.slice(0, 3).map(p => p.category));
    } else {
      console.log('No posts found for selected categories');
    }
  }
  
  const posts: SocialPost[] = filteredPosts.map((post, i) => {
    const user = mockUsers[i % mockUsers.length];
    // Random time within the last 7 days
    const timestamp = new Date(now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString();
    return {
      id: i + 1,
      userId: i % mockUsers.length + 1,
      title: '',
      body: post.body,
      username: user.name,
      handle: `@${user.username}`,
      avatar: user.avatar,
      category: post.category,
      image: post.image, // Use the specific image for this post
      timestamp,
      likes: Math.floor(Math.random() * 1000) + 10,
      comments: Math.floor(Math.random() * 100) + 1,
      shares: Math.floor(Math.random() * 50) + 1,
      istrending: post.istrending || false,
    };
  });
  
  return posts;
};

// Search across all content types
export const searchContent = async (
  query: string,
  _: string[]
): Promise<{
  news: NewsItem[];
  movies: MovieItem[];
  social: SocialPost[];
}> => {
  try {
    const [news, movies, social] = await Promise.all([
      fetchNewsSearch(query),
      fetchMoviesSearch(query),
      fetchSocialSearch(query, _),
    ]);

    return {
      news,
      movies,
      social,
    };
  } catch (error) {
    console.error('Error searching content:', error);
    return { news: [], movies: [], social: [] };
  }
};

// Search news
const fetchNewsSearch = async (query: string): Promise<NewsItem[]> => {
  try {
    if (!isNewsApiKeyValid()) {
      console.error('News API key is invalid or missing. Please check your environment variables.');
      throw new Error('Invalid or missing News API key');
    }
    
    if (!query || query.trim() === '') {
      console.warn('Empty search query provided');
      return [];
    }
    
    const response = await axios.get<NewsApiResponse>(
      `${NEWS_API_URL}/everything`,
      {
        params: {
          apiKey: NEWS_API_KEY,
          q: query,
          language: 'en',
          pageSize: 5,
          sortBy: 'relevancy',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (!response.data.articles || response.data.articles.length === 0) {
      console.log('No search results found for query:', query);
      return [];
    }

    // Validate and sanitize each article before returning
    const validArticles = response.data.articles.filter(article => 
      article.title && 
      article.url && 
      (article.description || article.content)
    );

    return validArticles.map((article) => ({
      ...article,
      id: uuidv4(),
      title: article.title || 'Untitled Article',
      description: article.description || article.content?.substring(0, 160) || 'No description available',
      category: 'search',
    }));
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error searching news:', error.message);
    } else {
      console.error('Error searching news:', error);
    }
    return [];
  }
};

// Helper function to fetch full movie details with fallback mechanisms
const fetchFullMovieDetails = async (imdbID: string, title: string): Promise<Partial<OmdbApiResponse>> => {
  if (!isOmdbApiKeyValid()) {
    console.error('OMDB API key is invalid or missing. Please check your environment variables.');
    throw new Error('Invalid or missing OMDB API key');
  }
  
  // First attempt: Try to fetch by imdbID
  try {
    console.log(`Fetching movie details by imdbID: ${imdbID}`);
    const idResponse = await axios.get<OmdbApiResponse>(OMDB_API_URL, {
      params: {
        apikey: OMDB_API_KEY,
        i: imdbID,
      },
      timeout: 5000, // 5 second timeout
    });
    
    if (idResponse.data.Response === 'True' && 
        idResponse.data.Poster && 
        idResponse.data.Runtime && 
        idResponse.data.Genre && 
        idResponse.data.imdbRating && 
        idResponse.data.Plot) {
      console.log(`Successfully fetched complete details by imdbID for: ${title}`);
      return idResponse.data;
    } else {
      console.log(`Incomplete data returned by imdbID lookup for: ${title}. Missing required fields. Trying title lookup...`);
      throw new Error('Incomplete data');
    }
  } catch {
    // Second attempt: Fall back to fetching by title
    try {
      console.log(`Fetching movie details by title: ${title}`);
      const titleResponse = await axios.get<OmdbApiResponse>(OMDB_API_URL, {
        params: {
          apikey: OMDB_API_KEY,
          t: title,
        },
        timeout: 5000,
      });
      
      if (titleResponse.data.Response === 'True') {
        console.log(`Successfully fetched details by title for: ${title}`);
        return titleResponse.data;
      } else {
        console.log(`Failed to fetch details by title for: ${title}`);
        return {};
      }
    } catch (titleError) {
      console.error(`Error fetching movie details by title for ${title}:`, titleError);
      return {};
    }
  }
};

// Search movies
const fetchMoviesSearch = async (query: string): Promise<MovieItem[]> => {
  try {
    if (!isOmdbApiKeyValid()) {
      console.error('OMDB API key is invalid or missing. Please check your environment variables.');
      throw new Error('Invalid or missing OMDB API key');
    }
    
    const response = await axios.get<OmdbApiResponse>(
      OMDB_API_URL,
      {
        params: {
          apikey: OMDB_API_KEY,
          s: query,
          type: 'movie',
          page: 1
        },
      }
    );

    if (response.data.Response === 'True' && response.data.Search) {
      // Create basic movie items
      const basicMovieResults = response.data.Search.map((movie) => ({
        id: uuidv4(),
        title: movie.Title,
        year: movie.Year,
        poster: movie.Poster,
        type: movie.Type,
        imdbID: movie.imdbID,
        category: 'search',
      }));
      
      // Fetch detailed info for each movie using the new approach
      const detailedMovieResults = await Promise.all(
        basicMovieResults.map(async (movie) => {
          try {
            // Use our new helper function that tries imdbID first, then falls back to title
            const detailedInfo = await fetchFullMovieDetails(movie.imdbID, movie.title);
            
            if (Object.keys(detailedInfo).length > 0) {
              return {
                ...movie,
                poster: detailedInfo.Poster || movie.poster,
                runtime: detailedInfo.Runtime || 'N/A',
                genre: detailedInfo.Genre || 'N/A',
                director: detailedInfo.Director || 'N/A',
                writer: detailedInfo.Writer || 'N/A',
                actors: detailedInfo.Actors || 'N/A',
                plot: detailedInfo.Plot || 'No plot available',
                language: detailedInfo.Language || 'N/A',
                country: detailedInfo.Country || 'N/A',
                rated: detailedInfo.Rated || 'N/A',
                released: detailedInfo.Released || 'N/A',
                awards: detailedInfo.Awards || 'N/A',
                ratings: detailedInfo.Ratings || [],
                imdbRating: detailedInfo.imdbRating || 'N/A',
                metascore: detailedInfo.Metascore || 'N/A',
                boxOffice: detailedInfo.BoxOffice || 'N/A',
              };
            }
            
            return movie;
          } catch (error) {
            console.error(`Error fetching details for movie ${movie.title}:`, error);
            return movie;
          }
        })
      );
      
      // Sort movies by year in descending order (most recent first)
      return detailedMovieResults.sort((a, b) => {
        // Extract year numbers for comparison
        // Some movies might have year ranges like "2020-2021"
        const yearA = parseInt(a.year.split('-')[0], 10);
        const yearB = parseInt(b.year.split('-')[0], 10);
        
        return yearB - yearA; // Descending order (most recent first)
      });
    }
    return [];
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

// Search social posts (mocked with JSONPlaceholder)
const fetchSocialSearch = async (
  query: string,
  categories: string[]
): Promise<SocialPost[]> => {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    const users = await axios.get('https://jsonplaceholder.typicode.com/users');
    
    const filteredPosts = response.data
      .filter((post: SocialPost) => {
        const title = post.title.toLowerCase();
        const body = post.body.toLowerCase();
        const queryLower = query.toLowerCase();
        return title.includes(queryLower) || body.includes(queryLower);
      })
      .slice(0, 5)
      .map((post: SocialPost) => {
        const user = users.data.find((u: SocialPost) => u.id === post.userId);
        return {
          ...post,
          username: user?.name || `User ${post.userId}`,
          category: 'search',
          image: `https://picsum.photos/seed/${post.id}/300/200`,
          timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
          likes: Math.floor(Math.random() * 500) + 5,
          comments: Math.floor(Math.random() * 50) + 1,
          shares: Math.floor(Math.random() * 25) + 1,
        };
      });
      
    return filteredPosts;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error searching social posts:', error.message);
    } else {
      console.error('Error searching social posts:', error);
    }
    return [];
  }
};

// Mock news data generator function as fallback
const getMockNewsData = (categories: string[]): NewsItem[] => {
  const mockArticles = [
    {
      source: { id: 'mock', name: 'Mock News' },
      author: 'Tech Reporter',
      title: 'Major Tech Company Announces Revolutionary AI Platform',
      description: 'A leading technology company has unveiled a groundbreaking artificial intelligence platform that promises to transform how businesses operate.',
      url: 'https://example.com/tech-news-1',
      urlToImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      content: 'This revolutionary platform represents a significant advancement in AI technology...',
      category: 'technology'
    },
    {
      source: { id: 'mock', name: 'Business Daily' },
      author: 'Business Analyst',
      title: 'Stock Market Reaches New Heights Amid Economic Recovery',
      description: 'Global markets continue their upward trajectory as economic indicators show strong recovery across multiple sectors.',
      url: 'https://example.com/business-news-1',
      urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      content: 'The stock market surge is being driven by strong corporate earnings...',
      category: 'business'
    },
    {
      source: { id: 'mock', name: 'Sports Central' },
      author: 'Sports Writer',
      title: 'Championship Finals Set to Break Viewership Records',
      description: 'The upcoming championship game is expected to draw the largest television audience in sports history.',
      url: 'https://example.com/sports-news-1',
      urlToImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&q=80',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      content: 'Anticipation is building as two powerhouse teams prepare for the ultimate showdown...',
      category: 'sports'
    },
    {
      source: { id: 'mock', name: 'Health News' },
      author: 'Medical Correspondent',
      title: 'New Health Study Reveals Benefits of Regular Exercise',
      description: 'Researchers have discovered additional health benefits of maintaining a consistent exercise routine.',
      url: 'https://example.com/health-news-1',
      urlToImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      content: 'The comprehensive study followed participants over five years...',
      category: 'health'
    },
    {
      source: { id: 'mock', name: 'Entertainment Weekly' },
      author: 'Entertainment Reporter',
      title: 'Blockbuster Movie Breaks Opening Weekend Records',
      description: 'The highly anticipated film has shattered previous box office records in its opening weekend.',
      url: 'https://example.com/entertainment-news-1',
      urlToImage: 'https://images.unsplash.com/photo-1489599859473-790b99926305?auto=format&fit=crop&w=400&q=80',
      publishedAt: new Date(Date.now() - 18000000).toISOString(),
      content: 'The film\'s success has exceeded all studio expectations...',
      category: 'entertainment'
    },
    {
      source: { id: 'mock', name: 'Science Today' },
      author: 'Science Writer',
      title: 'Scientists Discover New Species in Deep Ocean',
      description: 'Marine biologists have identified several new species during a recent deep-sea exploration mission.',
      url: 'https://example.com/science-news-1',
      urlToImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=400&q=80',
      publishedAt: new Date(Date.now() - 21600000).toISOString(),
      content: 'The expedition used advanced submersible technology to explore previously unreachable depths...',
      category: 'science'
    },
    {
      source: { id: 'mock', name: 'General News' },
      author: 'News Reporter',
      title: 'Community Initiative Brings Positive Change to Local Area',
      description: 'A grassroots community program has made significant improvements to the quality of life in the neighborhood.',
      url: 'https://example.com/general-news-1',
      urlToImage: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=400&q=80',
      publishedAt: new Date(Date.now() - 25200000).toISOString(),
      content: 'The initiative has brought together residents from all walks of life...',
      category: 'general'
    }
  ];

  // Filter articles based on requested categories
  const filteredArticles = categories.length > 0 
    ? mockArticles.filter(article => categories.includes(article.category))
    : mockArticles;

  // Add unique IDs to each article
  return filteredArticles.map(article => ({
    ...article,
    id: uuidv4()
  }));
};

