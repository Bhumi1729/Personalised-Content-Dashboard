// Simple localStorage-based authentication
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  bio?: string;
  preferences?: {
    theme: string;
    categories?: string[];
    language: string;
  };
}

interface StoredUser extends User {
  password: string;
}

// Mock users database in localStorage
const USERS_STORAGE_KEY = 'dashboard_users';
const CURRENT_USER_KEY = 'dashboard_current_user';

// Initialize with demo user if no users exist
const initializeUsers = () => {
  const existingUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!existingUsers) {
    const demoUser: StoredUser = {
      id: '1',
      email: 'demo@example.com',
      password: 'demo123', // In real app, this should be hashed
      name: 'Demo User',
      avatar: null,
      bio: 'Welcome to your personalized dashboard!',
      preferences: {
        theme: 'light',
        categories: ['technology', 'business', 'entertainment'],
        language: 'en',
      },
    };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([demoUser]));
  }
};

export const authService = {
  // Initialize the auth service
  init() {
    if (typeof window !== 'undefined') {
      initializeUsers();
    }
  },

  // Get all users from localStorage
  getUsers(): StoredUser[] {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  },

  // Save users to localStorage
  saveUsers(users: StoredUser[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    return currentUser ? JSON.parse(currentUser) : null;
  },

  // Set current user
  setCurrentUser(user: User | null) {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  },

  // Sign in user
  async signIn(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      this.setCurrentUser(userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, error: 'Invalid email or password' };
  },

  // Register new user
  async register(email: string, password: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = this.getUsers();
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
      return { success: false, error: 'User already exists' };
    }

    // Create new user
    const newUser: StoredUser = {
      id: String(Date.now()),
      email,
      password,
      name,
      avatar: null,
      bio: '',
      preferences: {
        theme: 'light',
        categories: ['technology', 'business'],
        language: 'en',
      },
    };

    users.push(newUser);
    this.saveUsers(users);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;
    this.setCurrentUser(userWithoutPassword);
    return { success: true, user: userWithoutPassword };
  },

  // Sign out
  signOut() {
    this.setCurrentUser(null);
  },

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    // Update the user
    const currentPrefs = users[userIndex].preferences || { theme: 'light', categories: [], language: 'en' };
    const updatedStoredUser: StoredUser = {
      ...users[userIndex],
      ...updates,
      preferences: {
        theme: updates.preferences?.theme || currentPrefs.theme,
        categories: updates.preferences?.categories || currentPrefs.categories || [],
        language: updates.preferences?.language || currentPrefs.language,
      },
    };

    users[userIndex] = updatedStoredUser;
    this.saveUsers(users);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...updatedUser } = updatedStoredUser;
    this.setCurrentUser(updatedUser);
    return { success: true, user: updatedUser };
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },
};
