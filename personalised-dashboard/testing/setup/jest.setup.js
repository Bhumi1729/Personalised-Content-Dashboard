// Jest setup file
import '@testing-library/jest-dom';

// Add custom Jest matchers
expect.extend({
  toBeInTheDocument: (received) => {
    const pass = received !== null && received !== undefined;
    return {
      message: () => 
        pass 
          ? `Expected element not to be in the document`
          : `Expected element to be in the document`,
      pass,
    };
  },
  toHaveAttribute: (received, attr, value) => {
    if (!received || !received.getAttribute) {
      return {
        message: () => `Expected element to have attribute ${attr}`,
        pass: false,
      };
    }
    const actualValue = received.getAttribute(attr);
    const pass = value ? actualValue === value : actualValue !== null;
    return {
      message: () => 
        pass 
          ? `Expected element not to have attribute ${attr}${value ? ` with value ${value}` : ''}`
          : `Expected element to have attribute ${attr}${value ? ` with value ${value}` : ''}`,
      pass,
    };
  },
  toHaveClass: (received, ...classes) => {
    if (!received || !received.classList) {
      return {
        message: () => `Expected element to have classes: ${classes.join(', ')}`,
        pass: false,
      };
    }
    const pass = classes.every(cls => received.classList.contains(cls));
    return {
      message: () => 
        pass 
          ? `Expected element not to have classes: ${classes.join(', ')}`
          : `Expected element to have classes: ${classes.join(', ')}`,
      pass,
    };
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  
  observe() {
    return null;
  }
  
  disconnect() {
    return null;
  }
  
  unobserve() {
    return null;
  }
};

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      replace: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
}));

// Setup global test environment
global.fetch = jest.fn();

// Mock console.error for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Error fetching') ||
       args[0].includes('Error searching'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('⚠️ No news articles fetched') ||
       args[0].includes('Empty search query provided'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
  
  console.log = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Social categories received') ||
       args[0].includes('All available post categories') ||
       args[0].includes('Fetching movie details') ||
       args[0].includes('No search results found'))
    ) {
      return;
    }
    originalLog.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
  console.log = originalLog;
});

// Global test cleanup to prevent async operations from continuing after tests
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
});

// Set a global timeout for all tests
jest.setTimeout(10000);

// Mock axios globally to prevent real HTTP requests
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    create: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ data: {} })),
      post: jest.fn(() => Promise.resolve({ data: {} })),
      put: jest.fn(() => Promise.resolve({ data: {} })),
      delete: jest.fn(() => Promise.resolve({ data: {} })),
    })),
  },
}));
