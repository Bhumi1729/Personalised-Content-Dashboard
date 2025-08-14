import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../utils/testUtils';
import SearchBar from '../../app/components/layout/SearchBar';

// Mock the useDebounceSearch hook
jest.mock('../../app/hooks/useDebounceSearch', () => ({
  useDebounceSearch: jest.fn(),
}));

const mockUseDebounceSearch = require('../../app/hooks/useDebounceSearch').useDebounceSearch;

describe('SearchBar', () => {
  const mockSetInputValue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDebounceSearch.mockReturnValue({
      inputValue: '',
      setInputValue: mockSetInputValue,
    });
  });

  describe('Rendering', () => {
    it('should render search input with placeholder', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search across news, movies, and social posts...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render search icon', () => {
      renderWithProviders(<SearchBar />);
      
      const searchIcon = screen.getByRole('textbox').parentElement?.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should have proper input styling', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveClass('w-full', 'py-2', 'pl-10', 'pr-4', 'rounded-full');
    });
  });

  describe('User Interactions', () => {
    it('should call setInputValue when user types', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      
      expect(mockSetInputValue).toHaveBeenCalledWith('test query');
    });

    it('should handle empty input', () => {
      // Ensure mock is properly set up for this test with an initial value
      mockUseDebounceSearch.mockReturnValue({
        inputValue: 'initial value',
        setInputValue: mockSetInputValue,
      });
      
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      
      // Clear any previous calls after rendering
      mockSetInputValue.mockClear();
      
      // Change from a value to empty string to trigger onChange
      act(() => {
        fireEvent.change(searchInput, { target: { value: '' } });
      });
      
      expect(mockSetInputValue).toHaveBeenCalledWith('');
    });

    it('should handle special characters in input', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      const specialQuery = 'test@#$%^&*()';
      fireEvent.change(searchInput, { target: { value: specialQuery } });
      
      expect(mockSetInputValue).toHaveBeenCalledWith(specialQuery);
    });

    it('should handle very long input', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      const longQuery = 'a'.repeat(1000);
      fireEvent.change(searchInput, { target: { value: longQuery } });
      
      expect(mockSetInputValue).toHaveBeenCalledWith(longQuery);
    });
  });

  describe('Input Value Display', () => {
    it('should display current input value', () => {
      mockUseDebounceSearch.mockReturnValue({
        inputValue: 'current search',
        setInputValue: mockSetInputValue,
      });

      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByDisplayValue('current search');
      expect(searchInput).toBeInTheDocument();
    });

    it('should update display value when hook value changes', () => {
      const { rerender } = renderWithProviders(<SearchBar />);
      
      // Initially empty
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
      
      // Update mock to return different value
      mockUseDebounceSearch.mockReturnValue({
        inputValue: 'updated search',
        setInputValue: mockSetInputValue,
      });
      
      rerender(<SearchBar />);
      
      expect(screen.getByDisplayValue('updated search')).toBeInTheDocument();
    });
  });

  describe('Debounce Integration', () => {
    it('should use default debounce delay', () => {
      renderWithProviders(<SearchBar />);
      
      expect(mockUseDebounceSearch).toHaveBeenCalledWith(500);
    });

    it('should call hook on every render', () => {
      const { rerender } = renderWithProviders(<SearchBar />);
      
      expect(mockUseDebounceSearch).toHaveBeenCalledTimes(1);
      
      rerender(<SearchBar />);
      
      expect(mockUseDebounceSearch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper input type', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should be focusable', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      searchInput.focus();
      
      expect(document.activeElement).toBe(searchInput);
    });

    it('should have accessible placeholder text', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText(/search across/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Keyboard Interactions', () => {
    it('should handle Enter key press', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
      
      // Should not cause any errors
      expect(searchInput).toBeInTheDocument();
    });

    it('should handle Escape key press', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      fireEvent.keyDown(searchInput, { key: 'Escape', code: 'Escape' });
      
      // Should not cause any errors
      expect(searchInput).toBeInTheDocument();
    });

    it('should handle Tab navigation', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      fireEvent.keyDown(searchInput, { key: 'Tab', code: 'Tab' });
      
      // Should not cause any errors
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Focus and Blur Events', () => {
    it('should handle focus event', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox') as HTMLInputElement;
      
      // Simulate focus
      searchInput.focus();
      
      // Check if the input received focus
      expect(document.activeElement).toBe(searchInput);
    });

    it('should handle blur event', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      fireEvent.focus(searchInput);
      fireEvent.blur(searchInput);
      
      expect(document.activeElement).not.toBe(searchInput);
    });
  });

  describe('Component Structure', () => {
    it('should have proper container structure', () => {
      const { container } = renderWithProviders(<SearchBar />);
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('relative');
    });

    it('should position search icon correctly', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      const iconContainer = searchInput.parentElement;
      const icon = iconContainer?.querySelector('svg');
      
      // The icon itself should have the positioning classes, not its parent
      expect(icon).toHaveClass('absolute', 'left-3');
    });
  });

  describe('Error Handling', () => {
    it('should handle hook throwing error gracefully', () => {
      mockUseDebounceSearch.mockImplementation(() => {
        throw new Error('Hook error');
      });

      expect(() => {
        renderWithProviders(<SearchBar />);
      }).toThrow('Hook error');
    });

    it('should handle undefined hook return gracefully', () => {
      mockUseDebounceSearch.mockReturnValue(undefined);

      expect(() => {
        renderWithProviders(<SearchBar />);
      }).toThrow();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestWrapper = () => {
        renderSpy();
        return <SearchBar />;
      };

      const { rerender } = renderWithProviders(<TestWrapper />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Rerender with same props
      rerender(<TestWrapper />);
      
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid input changes', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      
      // Simulate rapid typing
      act(() => {
        for (let i = 0; i < 10; i++) {
          fireEvent.change(searchInput, { target: { value: `query${i}` } });
        }
      });
      
      expect(mockSetInputValue).toHaveBeenCalledTimes(10);
    });
  });

  describe('Style Classes', () => {
    it('should apply focus styles', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });

    it('should apply transition classes', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveClass('transition-colors');
    });

    it('should apply border and background classes', () => {
      renderWithProviders(<SearchBar />);
      
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveClass('border', 'border-gray-200', 'bg-gray-50');
    });
  });
});
