import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// User type definition
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar: string | null;
  bio: string;
  preferences: {
    theme: string;
    categories: string[];
    language: string;
  };
}

// Mock user database - in production, replace with real database
const users: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeU/.3DhGkT2.Q2K6', // password: demo123
    name: 'Demo User',
    avatar: null,
    bio: 'Welcome to your personalized dashboard!',
    preferences: {
      theme: 'light',
      categories: ['technology', 'business', 'entertainment'],
      language: 'en',
    },
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = users.find((user) => user.email === credentials.email);

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};

// Mock functions for user management
export async function createUser(email: string, password: string, name: string) {
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = {
    id: String(users.length + 1),
    email,
    password: hashedPassword,
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
  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    image: newUser.avatar,
  };
}

export async function getUserById(id: string) {
  return users.find((user) => user.id === id) || null;
}

export async function updateUserProfile(id: string, updates: {
  name?: string;
  bio?: string;
  avatar?: string | null;
  preferences?: User['preferences'];
}) {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) return null;

  const updatedUser: User = {
    ...users[userIndex],
    ...updates,
    preferences: {
      ...users[userIndex].preferences,
      ...updates.preferences,
    },
  };
  
  users[userIndex] = updatedUser;
  return users[userIndex];
}
