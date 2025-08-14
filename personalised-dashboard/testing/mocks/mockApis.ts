import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

export { mockedAxios };

// API Key Mocks
export const mockValidApiKeys = {
  NEWS_API_KEY: 'test-news-api-key',
  OMDB_API_KEY: 'test-omdb-api-key',
};

export const mockInvalidApiKeys = {
  NEWS_API_KEY: '',
  OMDB_API_KEY: '',
};

// Mock localStorage
export const mockLocalStorage: {
  store: Record<string, string>;
  getItem: jest.Mock<string | null, [string]>;
  setItem: jest.Mock<void, [string, string]>;
  removeItem: jest.Mock<void, [string]>;
  clear: jest.Mock<void, []>;
} = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string): string | null => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key: string, value: string): void => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: jest.fn((key: string): void => {
    delete mockLocalStorage.store[key];
  }),
  clear: jest.fn((): void => {
    mockLocalStorage.store = {};
  }),
};

// Mock window.dispatchEvent
export const mockDispatchEvent = jest.fn();

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

// Mock lodash.debounce
jest.mock('lodash.debounce', () => {
  return jest.fn((fn) => {
    const debounced = (...args: any[]) => fn(...args);
    debounced.cancel = jest.fn();
    return debounced;
  });
});

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}));

// Mock react-beautiful-dnd
jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => children,
  Droppable: ({ children }: { children: any }) => children({
    innerRef: jest.fn(),
    droppableProps: {},
    placeholder: null,
  }),
  Draggable: ({ children }: { children: any }) => children({
    innerRef: jest.fn(),
    draggableProps: {},
    dragHandleProps: {},
  }, {}),
}));

// Mock environment variables
process.env.NEWS_API_KEY = mockValidApiKeys.NEWS_API_KEY;
process.env.OMDB_API_KEY = mockValidApiKeys.OMDB_API_KEY;
