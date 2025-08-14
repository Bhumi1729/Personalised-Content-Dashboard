// Content Types
export interface NewsItem {
  id: string;
  source: {
    id: string | null;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
  category: string;
}

export interface MovieItem {
  id: string;
  title: string;
  year: string;
  poster: string;
  type: string;
  imdbID: string;
  category: string;
  // Additional fields from detailed API
  runtime?: string;
  genre?: string;
  director?: string;
  writer?: string;
  actors?: string;
  plot?: string;
  language?: string;
  country?: string;
  rated?: string;
  released?: string;
  awards?: string;
  ratings?: Array<{
    Source: string;
    Value: string;
  }>;
  imdbRating?: string;
  metascore?: string;
  boxOffice?: string;
}

export interface SocialPost {
  id: number;
  userId: number;
  title: string;
  body: string;
  image: string;
  username: string;
  category: string;
  timestamp: string;
  avatar?: string;
  handle?: string;
  likes: number;
  comments: number;
  shares: number;
  istrending?: boolean;
}

export type ContentItem = NewsItem | MovieItem | SocialPost;

// User Preference Types
export interface UserPreferences {
  categories: string[];
  movieGenres: string[];
  socialCategories: string[];
  layout: DashboardLayout;
  favorites: Record<string, ContentItem>;
  contentOrder: string[];
}

export type DashboardLayout = 'grid' | 'list';

// API Response Types
export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Omit<NewsItem, 'id' | 'category'>[];
  message?: string;
  code?: string;
}

export interface OmdbApiResponse {
  // Response for search endpoint
  Search?: Array<{
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
  }>;
  totalResults?: string;
  
  // Response for detailed info endpoint
  Title?: string;
  Year?: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Poster?: string;
  Ratings?: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  imdbID?: string;
  Type?: string;
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
  
  // Common fields
  Response: string;
  Error?: string;
}

// State Types
export interface AppState {
  preferences: UserPreferences;
  content: {
    news: NewsItem[];
    movies: MovieItem[];
    social: SocialPost[];
    trending: ContentItem[];
    loading: boolean;
    error: string | null;
  };
  search: {
    query: string;
    results: ContentItem[];
    loading: boolean;
    error: string | null;
  };
}
