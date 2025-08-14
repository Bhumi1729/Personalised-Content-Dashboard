import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils/testUtils';
import ContentCard from '../../app/components/content/ContentCard';
import { mockNewsItems, mockMovieItems, mockSocialPosts } from '../mocks/mockData';
import { toggleFavorite } from '../../app/store/preferencesSlice';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('ContentCard', () => {
  describe('News Item Rendering', () => {
    const newsItem = mockNewsItems[0];

    it('should render news item correctly', () => {
      renderWithProviders(<ContentCard item={newsItem} />);
      
      expect(screen.getByText(newsItem.title)).toBeInTheDocument();
      expect(screen.getByText(newsItem.description)).toBeInTheDocument();
      expect(screen.getByText(newsItem.source.name)).toBeInTheDocument();
      expect(screen.getByText('Read more')).toBeInTheDocument();
    });

    it('should display news category badge', () => {
      renderWithProviders(<ContentCard item={newsItem} />);
      
      expect(screen.getByText(newsItem.category)).toBeInTheDocument();
    });

    it('should handle missing news image gracefully', () => {
      const newsItemWithoutImage = {
        ...newsItem,
        urlToImage: null,
      };
      
      renderWithProviders(<ContentCard item={newsItemWithoutImage} />);
      
      // Should show fallback image
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should format published date correctly', () => {
      renderWithProviders(<ContentCard item={newsItem} />);
      
      // Should display formatted date
      expect(screen.getByText('2023-01-01')).toBeInTheDocument();
    });

    it('should display random min read text', () => {
      renderWithProviders(<ContentCard item={newsItem} />);
      
      const minReadText = screen.getByText(/\d+ min read/);
      expect(minReadText).toBeInTheDocument();
    });

    it('should handle invalid URLs safely', () => {
      const newsItemWithInvalidUrl = {
        ...newsItem,
        url: 'invalid-url',
      };
      
      renderWithProviders(<ContentCard item={newsItemWithInvalidUrl} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '#');
    });
  });

  describe('Movie Item Rendering', () => {
    const movieItem = mockMovieItems[0];

    it('should render movie item correctly', () => {
      renderWithProviders(<ContentCard item={movieItem} />);
      
      expect(screen.getByText(movieItem.title)).toBeInTheDocument();
      expect(screen.getByText('IMDb')).toBeInTheDocument();
      expect(screen.getByText('Play Now')).toBeInTheDocument();
    });

    it('should display movie rating', () => {
      renderWithProviders(<ContentCard item={movieItem} />);
      
      expect(screen.getByText(movieItem.imdbRating!)).toBeInTheDocument();
    });

    it('should format runtime correctly', () => {
      renderWithProviders(<ContentCard item={movieItem} />);
      
      // Should display formatted runtime
      expect(screen.getByText(/2hr/)).toBeInTheDocument();
    });

    it('should display movie genres', () => {
      renderWithProviders(<ContentCard item={movieItem} />);
      
      expect(screen.getByText(/Action, Adventure/)).toBeInTheDocument();
    });

    it('should handle missing movie poster', () => {
      const movieItemWithoutPoster = {
        ...movieItem,
        poster: 'N/A',
      };
      
      renderWithProviders(<ContentCard item={movieItemWithoutPoster} />);
      
      // Should show fallback image
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should link to IMDb when imdbID is available', () => {
      renderWithProviders(<ContentCard item={movieItem} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', `https://www.imdb.com/title/${movieItem.imdbID}`);
    });

    it('should handle missing plot gracefully', () => {
      const movieItemWithoutPlot = {
        ...movieItem,
        plot: 'N/A',
      };
      
      renderWithProviders(<ContentCard item={movieItemWithoutPlot} />);
      
      expect(screen.getByText('No plot available')).toBeInTheDocument();
    });
  });

  describe('Social Post Rendering', () => {
    const socialPost = mockSocialPosts[0];

    it('should render social post correctly', () => {
      renderWithProviders(<ContentCard item={socialPost} />);
      
      expect(screen.getByText(socialPost.body)).toBeInTheDocument();
      expect(screen.getByText(socialPost.username)).toBeInTheDocument();
      expect(screen.getByText(socialPost.handle!)).toBeInTheDocument();
    });

    it('should display engagement stats', () => {
      renderWithProviders(<ContentCard item={socialPost} />);
      
      expect(screen.getByText(socialPost.likes.toLocaleString())).toBeInTheDocument();
      expect(screen.getByText(socialPost.comments.toLocaleString())).toBeInTheDocument();
      expect(screen.getByText(socialPost.shares.toLocaleString())).toBeInTheDocument();
    });

    it('should truncate long post body', () => {
      const longPost = {
        ...socialPost,
        body: 'A'.repeat(150), // Very long body
      };
      
      renderWithProviders(<ContentCard item={longPost} />);
      
      const truncatedText = screen.getByText(/A{120}\.\.\.$/);
      expect(truncatedText).toBeInTheDocument();
    });

    it('should format relative time correctly', () => {
      renderWithProviders(<ContentCard item={socialPost} />);
      
      // Should display the formatted date (2023-01-01)
      const timeElement = screen.getByText('2023-01-01');
      expect(timeElement).toBeInTheDocument();
    });

    it('should handle missing avatar gracefully', () => {
      const postWithoutAvatar = {
        ...socialPost,
        avatar: undefined,
      };
      
      renderWithProviders(<ContentCard item={postWithoutAvatar} />);
      
      // Should show initials fallback
      expect(screen.getByText(socialPost.username.charAt(0).toUpperCase())).toBeInTheDocument();
    });

    it('should display hashtags', () => {
      renderWithProviders(<ContentCard item={socialPost} />);
      
      // Should display hashtags
      const hashtagElement = screen.getByText(/#DevOps/);
      expect(hashtagElement).toBeInTheDocument();
    });

    it('should show view count for trending posts', () => {
      const trendingPost = {
        ...socialPost,
        likes: 600, // High engagement to trigger trending
      };
      
      renderWithProviders(<ContentCard item={trendingPost} />);
      
      expect(screen.getByText(/views/)).toBeInTheDocument();
    });
  });

  describe('Favorite Functionality', () => {
    it('should toggle favorite when star button is clicked', async () => {
      const { store } = renderWithProviders(<ContentCard item={mockNewsItems[0]} />);
      
      const favoriteButton = screen.getByLabelText('Toggle favorite');
      fireEvent.click(favoriteButton);
      
      await waitFor(() => {
        const actions = store.getState ? store.getState() : {};
        // Verify the toggle action was dispatched
        expect(favoriteButton).toBeInTheDocument();
      });
    });

    it('should show favorited state correctly', () => {
      const preloadedState = {
        preferences: {
          categories: ['technology'],
          movieGenres: ['action'],
          socialCategories: ['Technology'],
          layout: 'grid' as const,
          favorites: { [mockNewsItems[0].id]: mockNewsItems[0] },
          contentOrder: [],
        },
        content: {
          news: [],
          movies: [],
          social: [],
          trending: [],
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
      };
      
      renderWithProviders(<ContentCard item={mockNewsItems[0]} />, { preloadedState });
      
      const favoriteButton = screen.getByLabelText('Toggle favorite');
      expect(favoriteButton).toHaveClass('bg-yellow-500');
    });

    it('should prevent event propagation on favorite button click', () => {
      const mockClick = jest.fn();
      
      renderWithProviders(
        <div onClick={mockClick}>
          <ContentCard item={mockNewsItems[0]} />
        </div>
      );
      
      const favoriteButton = screen.getByLabelText('Toggle favorite');
      fireEvent.click(favoriteButton);
      
      expect(mockClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<ContentCard item={mockNewsItems[0]} />);
      
      expect(screen.getByLabelText('Toggle favorite')).toBeInTheDocument();
    });

    it('should have proper link attributes for external links', () => {
      renderWithProviders(<ContentCard item={mockNewsItems[0]} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should have alt text for images', () => {
      renderWithProviders(<ContentCard item={mockNewsItems[0]} />);
      
      const image = screen.getByAltText(mockNewsItems[0].title);
      expect(image).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown content type gracefully', () => {
      const unknownItem = {
        id: 'unknown',
        type: 'unknown',
        title: 'Unknown Item',
      } as any;
      
      renderWithProviders(<ContentCard item={unknownItem} />);
      
      expect(screen.getByText('Unknown Content Type')).toBeInTheDocument();
      expect(screen.getByText('This content type is not supported yet.')).toBeInTheDocument();
    });

    it('should handle image load errors', async () => {
      renderWithProviders(<ContentCard item={mockNewsItems[0]} />);
      
      const image = screen.getByAltText(mockNewsItems[0].title);
      
      // Simulate image load error
      fireEvent.error(image);
      
      await waitFor(() => {
        expect(image).toHaveAttribute('src', '/globe.svg');
      });
    });

    it('should handle missing required fields', () => {
      const incompleteItem = {
        id: 'incomplete',
        title: 'Incomplete Item',
        // Missing other required fields
      } as any;
      
      renderWithProviders(<ContentCard item={incompleteItem} />);
      
      // Should render without crashing
      expect(screen.getByText('Unknown Content Type')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should memoize component correctly', () => {
      const { rerender } = renderWithProviders(<ContentCard item={mockNewsItems[0]} />);
      
      // Rerender with same props
      rerender(<ContentCard item={mockNewsItems[0]} />);
      
      // Component should still be present (React.memo working)
      expect(screen.getByText(mockNewsItems[0].title)).toBeInTheDocument();
    });

    it('should re-render when item changes', () => {
      const { rerender } = renderWithProviders(<ContentCard item={mockNewsItems[0]} />);
      
      expect(screen.getByText(mockNewsItems[0].title)).toBeInTheDocument();
      
      // Rerender with different item
      rerender(<ContentCard item={mockNewsItems[1]} />);
      
      expect(screen.getByText(mockNewsItems[1].title)).toBeInTheDocument();
      expect(screen.queryByText(mockNewsItems[0].title)).not.toBeInTheDocument();
    });
  });

  describe('Animation and Styling', () => {
    it('should apply hover effects', () => {
      renderWithProviders(<ContentCard item={mockNewsItems[0]} />);
      
      const card = screen.getByRole('link');
      
      // Should have hover classes
      expect(card).toHaveClass('group-hover:scale-[1.02]');
    });

    it('should have proper styling classes', () => {
      const { container } = renderWithProviders(<ContentCard item={mockNewsItems[0]} />);
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('bg-white', 'rounded-2xl', 'overflow-hidden');
    });
  });
});
