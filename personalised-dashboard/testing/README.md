# Test Suite Documentation

This comprehensive test suite covers all major functionalities of the Personalized Dashboard application. The tests are organized into unit tests and integration tests to ensure complete coverage of edge cases and business logic flows.

## Test Structure

```
testing/
├── unit/                     # Unit tests for individual components and functions
│   ├── api.test.ts          # API service tests
│   ├── preferencesSlice.test.ts # Redux preferences slice tests
│   ├── searchSlice.test.ts  # Redux search slice tests
│   ├── ContentCard.test.tsx # ContentCard component tests
│   ├── SearchBar.test.tsx   # SearchBar component tests
│   └── useDebounceSearch.test.tsx # Custom hook tests
├── integration/             # Integration tests for component interactions
│   └── contentFlow.test.tsx # End-to-end content flow tests
├── mocks/                   # Mock data and API responses
│   ├── mockData.ts         # Test data fixtures
│   └── mockApis.ts         # Mock API implementations
├── utils/                   # Test utilities and helpers
│   └── testUtils.tsx       # Custom render functions and test helpers
└── setup/                   # Jest configuration
    ├── jest.setup.js       # Jest setup and global mocks
    └── jest-matchers.d.ts  # TypeScript declarations for custom matchers
```

## Test Coverage Areas

### 1. API Services (`api.test.ts`)
- **News API Integration**
  - Fetching news by categories
  - Handling API rate limiting
  - Error handling and fallbacks
  - Invalid data filtering
  
- **Movie API Integration**
  - Movie search and details fetching
  - Genre-based filtering
  - Movie data enrichment
  - Error handling for missing data
  
- **Social Media API**
  - Mock social post generation
  - Category-based filtering
  - Engagement metrics
  
- **Search Functionality**
  - Cross-content type searching
  - Query validation
  - Result aggregation

### 2. Redux State Management

#### Preferences Slice (`preferencesSlice.test.ts`)
- **User Preferences**
  - Category selection and persistence
  - Movie genre preferences
  - Social category preferences
  - Layout preferences (grid/list)
  
- **Favorites Management**
  - Adding/removing favorites
  - Persistence across sessions
  - Multiple content type support
  
- **Content Ordering**
  - Drag-and-drop order persistence
  - Custom content arrangement
  
- **Local Storage Integration**
  - Preference persistence
  - Error handling for storage failures
  - Initial state loading

#### Search Slice (`searchSlice.test.ts`)
- **Search Query Management**
  - Query state updates
  - Search clearing
  - Empty query handling
  
- **Async Search Operations**
  - Multi-content type search
  - Loading states
  - Error handling
  - Result aggregation
  
- **Redux Integration**
  - Action dispatching
  - State transitions
  - Error states

### 3. Component Testing

#### ContentCard Component (`ContentCard.test.tsx`)
- **Multi-Content Type Rendering**
  - News articles with source info
  - Movies with ratings and details
  - Social posts with engagement metrics
  
- **User Interactions**
  - Favorite toggling
  - Link navigation
  - Image error handling
  
- **Accessibility**
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
  
- **Performance**
  - Component memoization
  - Render optimization

#### SearchBar Component (`SearchBar.test.tsx`)
- **User Input Handling**
  - Text input management
  - Special character support
  - Input validation
  
- **Debounce Integration**
  - Search delay functionality
  - Rapid input handling
  - Cleanup on unmount
  
- **Accessibility**
  - Focus management
  - Keyboard navigation
  - Input labeling

### 4. Custom Hooks Testing

#### useDebounceSearch Hook (`useDebounceSearch.test.tsx`)
- **Debounce Functionality**
  - Search delay implementation
  - Cancel previous searches
  - Performance optimization
  
- **Redux Integration**
  - Action dispatching
  - State management
  - Hook lifecycle
  
- **Edge Cases**
  - Rapid input changes
  - Empty queries
  - Component unmounting

### 5. Integration Testing

#### Content Flow Integration (`contentFlow.test.tsx`)
- **User Preference Integration**
  - Content filtering by preferences
  - Favorite persistence
  - Order management
  
- **Search Integration**
  - Cross-content search
  - Result filtering
  - State management
  
- **Theme Integration**
  - Dark/light mode support
  - Style application
  
- **Performance Integration**
  - Large content handling
  - Memoization effectiveness
  - Render optimization

## Test Data and Mocks

### Mock Data (`mockData.ts`)
- Realistic test data for all content types
- Edge case data scenarios
- Error response simulations
- Store state fixtures

### API Mocks (`mockApis.ts`)
- Axios mock implementations
- Environment variable mocking
- Third-party library mocks
- Local storage simulation

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests in CI environment
npm run test:ci
```

## Test Scenarios Covered

### Edge Cases
1. **API Failures**
   - Network timeouts
   - Invalid API keys
   - Rate limiting
   - Malformed responses

2. **Data Validation**
   - Missing required fields
   - Invalid URLs
   - Corrupted images
   - Empty responses

3. **User Input**
   - Special characters
   - Very long strings
   - Empty inputs
   - Rapid input changes

4. **State Management**
   - Undefined initial states
   - Invalid state transitions
   - Concurrent actions
   - Storage failures

### Performance Tests
1. **Large Data Sets**
   - 100+ content items
   - Rapid state updates
   - Memory leak prevention
   - Render performance

2. **Component Optimization**
   - Memoization effectiveness
   - Unnecessary re-renders
   - Event handler optimization

### Accessibility Tests
1. **Screen Reader Support**
   - ARIA labels
   - Semantic HTML
   - Focus management

2. **Keyboard Navigation**
   - Tab order
   - Enter/Space interactions
   - Escape key handling

### Security Tests
1. **Input Sanitization**
   - XSS prevention
   - URL validation
   - Safe image loading

2. **Data Protection**
   - Local storage security
   - API key protection
   - Error message sanitization

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Next.js integration
- TypeScript support
- Module path mapping
- Coverage collection
- Test environment setup

### Setup Files (`jest.setup.js`)
- Testing Library Jest DOM
- Global mocks
- Custom matchers
- Environment configuration

## Continuous Integration

The test suite is designed to run in CI environments with:
- Deterministic test execution
- No external dependencies
- Comprehensive error reporting
- Coverage reporting integration

## Maintenance Guidelines

1. **Adding New Tests**
   - Follow existing patterns
   - Include edge cases
   - Test user interactions
   - Verify accessibility

2. **Updating Mocks**
   - Keep mock data realistic
   - Update when APIs change
   - Maintain backward compatibility

3. **Performance Monitoring**
   - Track test execution time
   - Monitor coverage metrics
   - Identify slow tests

This test suite ensures the reliability, performance, and accessibility of the Personalized Dashboard application across all major user flows and edge cases.
