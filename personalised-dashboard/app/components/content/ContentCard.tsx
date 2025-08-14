'use client';

import React from 'react';
import Image from 'next/image';
import { FiStar, FiExternalLink, FiHeart, FiMessageCircle, FiShare, FiPlay, FiClock } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { ContentItem, MovieItem, NewsItem, SocialPost } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleFavorite } from '../../store/preferencesSlice';

// Helper function to format dates in a deterministic way for SSR/CSR consistency
const formatPublishedDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 10);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

// Function to ensure URL is valid and safe
const getSafeUrl = (url: string | null | undefined): string => {
  if (!url) return '#';
  try {
    new URL(url);
    return url;
  } catch {
    console.warn('Invalid URL detected:', url);
    return '#';
  }
};

interface ContentCardProps { item: ContentItem; isTrendingTab?: boolean; }

const ContentCard: React.FC<ContentCardProps> = ({ item, isTrendingTab }) => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state: { preferences: { favorites: Record<string, unknown> } }) => state.preferences.favorites);
  const isFavorite = favorites[item.id] !== undefined;

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(item));
  };

  const renderContent = () => {
    if ('url' in item && 'urlToImage' in item) {
      const newsItem = item as NewsItem;
      return (
        <a href={getSafeUrl(newsItem.url)} target="_blank" rel="noopener noreferrer" className="flex flex-col h-full group-hover:scale-[1.02] transition-transform duration-300">
          <div className="relative overflow-hidden" style={{ height: '200px' }}>
            {newsItem.urlToImage ? (
              <Image
                src={newsItem.urlToImage}
                alt={newsItem.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => {}}
                sizes="100vw"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <Image src="/globe.svg" alt="News" width={48} height={48} className="object-contain opacity-30" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex space-x-2">
              {isTrendingTab ? (
                <span className="flex items-center px-3 py-1.5 text-xs font-semibold text-white rounded-full shadow-sm"
                  style={{
                    background: 'linear-gradient(90deg, #ff512f 0%, #f09819 100%)',
                    boxShadow: '0 2px 8px 0 rgba(255, 81, 47, 0.15)'
                  }}>
                  <FaFire className="mr-1" size={14} /> Trending
                </span>
              ) : (
                <span className="px-3 py-1.5 text-xs font-medium bg-white/50 text-black rounded-full backdrop-blur-sm border border-gray-200/50 shadow-sm">{(item as NewsItem).category}</span>
              )}
            </div>
            <button onClick={handleToggleFavorite} className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm border border-gray-200/50 transition-all duration-200 ${isFavorite ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white/90 text-gray-600 hover:bg-gray-100'}`} aria-label="Toggle favorite">
              <FiStar size={16} className={isFavorite ? 'fill-current' : ''} />
            </button>
          </div>
          <div className="flex-1 flex flex-col px-6 py-4">
            <div className="flex-1">
              {/* Reverted title classes */}
              <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight">{newsItem.title}</h3>
              {/* Reduced description text size */}
              <p className="text-sm text-gray-700 mt-3 mb-1.5 line-clamp-3 leading-tight">{newsItem.description || 'No description available'}</p>
              {/* Random min read text below description with extra space */}
              <span className="flex items-center text-xs text-blue-800 font-semibold mb-0 mt-5">
                <FiClock className="mr-1" size={14} />
                {`${Math.floor(Math.random() * 3) + 2} min read`}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                {/* News source logo using favicon */}
                {newsItem.url && (
                    <Image
                      src={`https://www.google.com/s2/favicons?domain=${(() => { try { return new URL(newsItem.url).hostname; } catch { return ''; } })()}&sz=64`}
                      alt={newsItem.source?.name || 'Source'}
                      width={36}
                      height={36}
                      className="rounded mr-2"
                    />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-gray-900 truncate">{newsItem.source?.name || 'News Source'}</span>
                  <span className="text-xs text-gray-500">{formatPublishedDate(newsItem.publishedAt)}</span>
                </div>
              </div>
              <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0">
                <span>Read more</span>
                <FiExternalLink size={14} className="ml-1" />
              </div>
            </div>
          </div>
        </a>
      );
    }
    else if ('imdbID' in item && 'poster' in item) {
      const movieItem = item as MovieItem;
      
      // Format runtime in hours and minutes (e.g., "2hr 15min")
      let formattedRuntime = '';
      if (movieItem.runtime && movieItem.runtime !== 'N/A') {
        const runtimeMinutes = parseInt(movieItem.runtime.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(runtimeMinutes)) {
          const hours = Math.floor(runtimeMinutes / 60);
          const minutes = runtimeMinutes % 60;
          formattedRuntime = (hours > 0 ? `${hours}hr ` : '') + (minutes > 0 ? `${minutes}min` : '');
        } else {
          formattedRuntime = movieItem.runtime.replace('min', '').trim();
        }
      }
      
      const formattedGenres = movieItem.genre && movieItem.genre !== 'N/A' ? movieItem.genre : '';
      const runtimeAndGenre = [
        formattedRuntime,
        formattedGenres
      ].filter(Boolean).join(' • ');
      
      // Get IMDb rating - ensure it's a valid number
      const imdbRating = movieItem.imdbRating && 
                        movieItem.imdbRating !== 'N/A' && 
                        !isNaN(parseFloat(movieItem.imdbRating)) ? 
                        movieItem.imdbRating : null;
      
      return (
        <a href={movieItem.imdbID ? `https://www.imdb.com/title/${movieItem.imdbID}` : '#'} target="_blank" rel="noopener noreferrer" className="flex flex-col h-full group-hover:scale-[1.02] transition-transform duration-300">
          <div className="relative overflow-hidden" style={{ height: '200px' }}>
            {movieItem.poster && movieItem.poster !== 'N/A' ? (
              <Image
                src={movieItem.poster}
                alt={movieItem.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => {}}
                sizes="100vw"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <Image src="/file.svg" alt="Movie" width={48} height={48} className="object-contain opacity-30" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex space-x-2">
              {isTrendingTab ? (
                <span className="flex items-center px-3 py-1.5 text-xs font-semibold text-white rounded-full shadow-sm"
                  style={{
                    background: 'linear-gradient(90deg, #ff512f 0%, #f09819 100%)',
                    boxShadow: '0 2px 8px 0 rgba(255, 81, 47, 0.15)'
                  }}>
                  <FaFire className="mr-1" size={14} /> Trending
                </span>
              ) : (
                <span className="px-3 py-1.5 text-xs font-medium bg-white/50 text-black rounded-full backdrop-blur-sm border border-gray-200/50 shadow-sm">
                  {movieItem.rated && movieItem.rated !== 'N/A' ? movieItem.rated : movieItem.category}
                </span>
              )}
            </div>
            <button onClick={handleToggleFavorite} className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm border border-gray-200/50 transition-all duration-200 ${isFavorite ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white/90 text-gray-600 hover:bg-gray-100'}`} aria-label="Toggle favorite">
              <FiStar size={16} className={isFavorite ? 'fill-current' : ''} />
            </button>
            <div className="absolute bottom-4 left-4">
              <span className="text-white text-sm font-medium bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                {movieItem.year} • {movieItem.type || 'movie'}
              </span>
            </div>
          </div>
          <div className="flex-1 flex flex-col px-6 py-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 leading-tight flex-1">{movieItem.title}</h3>
                {imdbRating && (
                  <div className="flex items-center bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-md text-sm font-bold ml-2">
                    <FiStar size={14} className="mr-1 fill-current" /> {imdbRating}
                  </div>
                )}
              </div>
              {runtimeAndGenre && (
                <p className="text-gray-600 text-sm leading-relaxed mb-2">{runtimeAndGenre}</p>
              )}
              {movieItem.plot && movieItem.plot !== 'N/A' ? (
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">{movieItem.plot}</p>
              ) : (
                <p className="text-gray-500 text-sm italic line-clamp-2">No plot available</p>
              )}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">🎬</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate">IMDb</span>
                  <span className="text-xs text-gray-500">
                    {movieItem.director && movieItem.director !== 'N/A' ? `Dir: ${movieItem.director.split(',')[0]}` : 'Movie Database'}
                  </span>
                </div>
              </div>
              <div className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm py-2 px-4 rounded-full transition-all duration-200 flex-shrink-0">
                <FiPlay size={16} className="mr-2" />
                <span>Play Now</span>
              </div>
            </div>
          </div>
        </a>
      );
    }
    else if ('body' in item && 'username' in item) {
      const socialPost = item as SocialPost;
      
      // Format timestamp as relative time
      const getRelativeTime = (timestamp: string) => {
        const now = new Date();
        const postDate = new Date(timestamp);
        const diffMs = now.getTime() - postDate.getTime();
        const diffSecs = Math.round(diffMs / 1000);
        const diffMins = Math.round(diffSecs / 60);
        const diffHours = Math.round(diffMins / 60);
        const diffDays = Math.round(diffHours / 24);
        
        if (diffSecs < 60) return `${diffSecs} sec ago`;
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hr ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return formatPublishedDate(timestamp);
      };
      
      // Check if post is trending
      const isTrending = socialPost.likes > 500 || socialPost.comments > 50;
      
      return (
  <div className="flex flex-col h-full group-hover:scale-[1.02] transition-transform duration-300">
          {/* Header with avatar and user info */}
          <div className="flex items-center px-6 pt-4 pb-3">
            {socialPost.avatar ? (
              <Image src={socialPost.avatar} alt={socialPost.username} width={40} height={40} className="rounded-full border-2 border-gray-200 object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">{socialPost.username.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="ml-3 flex flex-col min-w-0 flex-grow">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 truncate">{socialPost.username}</span>
                <button onClick={handleToggleFavorite} className={`p-1.5 rounded-full transition-all duration-200 ${isFavorite ? 'bg-yellow-500 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-100'}`} aria-label="Toggle favorite">
                  <FiStar size={14} className={isFavorite ? 'fill-current' : ''} />
                </button>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 truncate">{socialPost.handle || `@${socialPost.username.toLowerCase().replace(/\s/g, '')}`}</span>
                <span className="mx-1 text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{getRelativeTime(socialPost.timestamp)}</span>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="relative overflow-hidden" style={{ height: '200px' }}>
            {socialPost.image ? (
              <Image
                src={socialPost.image}
                alt={socialPost.body.slice(0, 20) || 'Social Post'}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => {}}
                sizes="100vw"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <Image src="/window.svg" alt="Social Post" width={48} height={48} className="object-contain opacity-30" />
              </div>
            )}
            {/* Category badge */}
            <div className="absolute top-4 left-4 flex space-x-2">
              {isTrendingTab ? (
                <span className="flex items-center px-3 py-1.5 text-xs font-semibold text-white rounded-full shadow-sm"
                  style={{
                    background: 'linear-gradient(90deg, #ff512f 0%, #f09819 100%)',
                    boxShadow: '0 2px 8px 0 rgba(255, 81, 47, 0.15)'
                  }}>
                  <FaFire className="mr-1" size={14} /> Trending
                </span>
              ) : (
                <span className="px-3 py-1.5 text-xs font-medium bg-white/50 text-black rounded-full backdrop-blur-sm border border-gray-200/50 shadow-sm">
                  {socialPost.category}
                </span>
              )}
            </div>
          </div>
          
          {/* Post caption/body */}
          <div className="px-6 py-3 flex-1">
            {/* Truncate body to 120 chars with ellipsis if too long */}
            <p className="text-gray-800 text-sm leading-relaxed">
              {socialPost.body.length > 120 ? `${socialPost.body.slice(0, 120)}...` : socialPost.body}
            </p>
            {/* Hashtags on next line, matched by post id (1-based) */}
            <p className="text-blue-700 text-xs mt-1 whitespace-pre-line">
              {/* Hashtags lookup, must match mockPosts order in api.ts */}
              {(() => {
                const hashtagsArr = [
                  '#DevOps #Automation #CodeLife',
                  '#DeveloperTools #VSCode #Productivity',
                  '#ReactJS #CleanCode #DevUX',
                  '#Serverless #Testing #Localstack',
                  '#ErrorTracking #SRE #Sentry',
                  '#GraphQL #API #DeveloperJourney',
                  '#Webpack #BuildTools #Speed',
                  '#Monitoring #UX #FrontendTools',
                  '#Docker #Kubernetes #Scalability',
                  '#TypeScript #StaticTyping #DevBestPractices',
                  '#Mindfulness #SelfCare #MentalHealth',
                  '#HealthyHabits #Hydration #Wellness',
                  '#DeskWellness #Ergonomics #WorkHealth',
                  '#DigitalDetox #MindfulLiving #Nature',
                  '#EveningRitual #Relaxation #InnerPeace',
                  '#HealthySwap #Wellbeing #NightRoutine',
                  '#HydrationHack #DailyWellness #SelfCare',
                  '#MindfulnessBreak #WorkWellness #Calm',
                  '#Gratitude #MentalHealth #DailyRitual',
                  '#ScreenBreak #SelfCare #PeacefulEvenings',
                  '#HIIT #HomeWorkout #FitStart',
                  '#Running #FitnessGoals #Consistency',
                  '#Recovery #FitnessTips #SelfCare',
                  '#FitnessHacks #HealthyHabits #EverydayFitness',
                  '#YogaBreak #WorkWellness #Stretch',
                  '#HealthyAlternative #FitnessFuel #Wellness',
                  '#FitnessJourney #BodyweightTraining #Progress',
                  '#LegDay #WorkoutMotivation #StrongBody',
                  '#ResistanceTraining #WorkoutAnywhere #FitLife',
                  '#Stretching #EveningRoutine #Wellness',
                  '#CaféVibes #CreativeFlow #CozyMornings',
                  '#LocalTravel #SupportLocal #WeekendWander',
                  '#CozyLife #SelfCare #NightIn',
                  '#UrbanEscape #TravelMoments #EveningWander',
                  '#SlowLiving #Mindfulness #NatureTherapy',
                  '#Staycation #LocalGems #NatureNearby',
                  '#CaféLife #BrunchVibes #SimpleJoy',
                  '#OutdoorLiving #CozyCorner #Relax',
                  '#UrbanBeauty #SunsetChasers #MindfulMoments',
                  '#StarGazing #NatureLove #QuietNights',
                  '#DeveloperLife #SmallWins #CodeHumor',
                  '#RemoteWork #CoffeeFails #DevStruggles',
                  '#CodeLife #DevProblems #RealTalk',
                  '#ProgrammerHumor #BugHunt #LOL',
                  '#TestingLife #DevLife #RareVictory',
                  '#TechHumor #CodeFix #DevHacks',
                  '#ITCrowd #TechLife #CoffeeFix',
                  '#FormattingFails #DevMood #LOL',
                  '#DeveloperMagic #LOL #CodeHumor',
                  '#Procrastination #DevLife #Relatable',
                ];
                return hashtagsArr[(socialPost.id - 1) % hashtagsArr.length];
              })()}
            </p>
          </div>
          
          {/* Engagement stats */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <div className="flex items-center space-x-5">
              <button className="flex items-center space-x-1.5 text-gray-600 hover:text-red-500 transition-colors duration-200 group">
                <FiHeart size={16} className="group-hover:fill-current" />
                <span className="text-xs font-medium">{(socialPost.likes || 0).toLocaleString()}</span>
              </button>
              <button className="flex items-center space-x-1.5 text-gray-600 hover:text-blue-500 transition-colors duration-200">
                <FiMessageCircle size={16} />
                <span className="text-xs font-medium">{(socialPost.comments || 0).toLocaleString()}</span>
              </button>
              <button className="flex items-center space-x-1.5 text-gray-600 hover:text-green-500 transition-colors duration-200">
                <FiShare size={16} />
                <span className="text-xs font-medium">{(socialPost.shares || 0).toLocaleString()}</span>
              </button>
            </div>
            
            {/* View count for trending posts */}
            {isTrending && (
              <div className="text-xs text-gray-500">
                <span>{Math.floor(Math.random() * 50000 + 10000).toLocaleString()} views</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col h-full justify-center items-center p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl text-center">
          <h3 className="font-medium mb-2">Unknown Content Type</h3>
          <p className="text-sm opacity-80">This content type is not supported yet.</p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white dark:bg-card-custom rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ height: '420px' }}
    >
      {renderContent()}
    </motion.div>
  );
};

// Use React.memo with custom equality function to prevent unnecessary re-renders
export default React.memo(ContentCard, (prevProps, nextProps) => {
  // Only re-render if the item ID changes or if the content itself changes
  return (
    prevProps.item.id === nextProps.item.id && 
    JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item)
  );
});
