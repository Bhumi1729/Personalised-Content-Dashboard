# 🎯 Personalized Dashboard Application

> *A modern, feature-rich dashboard built with Next.js 15, TypeScript, and cutting-edge web technologies*

![Dashboard Preview](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2.8.2-purple?style=for-the-badge&logo=redux)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-teal?style=for-the-badge&logo=tailwindcss)

## 🌟 Overview

A comprehensive, customizable dashboard application that aggregates content from multiple APIs including news, movies, and social media. Built with modern React patterns, comprehensive testing infrastructure, and production-ready features.

## ✨ Key Features

### 🎨 **User Experience**
- 🎯 **Content Aggregation**: Pulls data from News API, OMDB, and mock social media feeds
- 🎛️ **Personalization**: User preferences for content categories and layout
- 📱 **Responsive Design**: Works seamlessly on all device sizes
- 🌓 **Dark/Light Mode**: Toggle between color schemes with system preference detection
- 🔍 **Advanced Search**: Real-time search across all content types with debouncing
- ❤️ **Favorites System**: Save and manage favorite content items
- 🎪 **Drag and Drop**: Intuitive card reordering with smooth animations
- 📊 **API Status Monitor**: Real-time API connectivity status monitoring

### 🛠️ **Technical Features**
- 🔐 **Authentication**: Secure user authentication with NextAuth.js
- 🧪 **Comprehensive Testing**: 196+ tests with Jest and Testing Library
- 🎭 **Error Boundaries**: Graceful error handling and recovery
- ⚡ **Performance Optimized**: Code splitting, lazy loading, and memoization
- 🔒 **Type Safety**: Full TypeScript implementation with strict typing
- 📡 **API Integration**: Robust API services with error handling and fallbacks

### 🎮 **Interactive Features**
- 🖱️ **Drag & Drop Interface**: Reorder content cards with visual feedback
- 🔄 **State Persistence**: User preferences saved across browser sessions
- 🎬 **Multi-Content Types**: News, movies, and social posts in unified interface
- 🎨 **Category Filtering**: Dynamic content filtering by categories
- 📈 **Loading States**: Beautiful loading animations and transitions

## 🚀 Quick Start

### 📋 Prerequisites

Ensure you have the following installed:
- 📦 **Node.js** (v18.0.0 or higher)
- 📦 **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- 🌐 **Git** for version control

### 🏗️ Installation

1. **📂 Clone the repository:**
   ```bash
   # Using HTTPS
   git clone https://github.com/your-username/personalised-dashboard.git
   
   # Using SSH
   git clone git@github.com:your-username/personalised-dashboard.git
   
   # Navigate to project directory
   cd personalised-dashboard
   ```

2. **📦 Install dependencies:**
   ```bash
   # Using npm (recommended)
   npm install
   
   # Or using yarn
   yarn install
   
   # Or using pnpm
   pnpm install
   ```

3. **🔑 Environment Setup:**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # Create environment file
   touch .env.local
   ```
   
   Add your API keys:
   ```env
   # Required API Keys
   NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key_here
   NEXT_PUBLIC_OMDB_API_KEY=your_omdb_api_key_here
   
   # Optional: Authentication (if using NextAuth)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   
   # Optional: Database (if using authentication)
   DATABASE_URL="your_database_url_here"
   ```

4. **🔗 Get API Keys:**
   
   📰 **News API Key:**
   - Visit [newsapi.org](https://newsapi.org/register)
   - Sign up for a free account
   - Copy your API key
   
   🎬 **OMDB API Key:**
   - Visit [omdbapi.com](http://www.omdbapi.com/apikey.aspx)
   - Choose a plan (free tier available)
   - Copy your API key

5. **🏃‍♂️ Start the development server:**
   ```bash
   # Start development server with Turbopack (fastest)
   npm run dev
   
   # Or with traditional Webpack
   npm run dev --no-turbopack
   
   # Or using yarn
   yarn dev
   
   # Or using pnpm
   pnpm dev
   ```

6. **🌐 Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see your dashboard!

## 📁 Project Structure

```
personalised-dashboard/
├── 📁 app/                          # Next.js 15 App Router
│   ├── 📄 globals.css              # Global styles and CSS variables
│   ├── 📄 layout.tsx               # Root layout with providers
│   ├── 📄 page.tsx                 # Home page
│   ├── 📄 theme.css                # Theme-specific styles
│   │
│   ├── 📁 api/                     # API routes
│   │   ├── 📁 auth/                # Authentication endpoints
│   │   ├── 📁 placeholder-image/   # Image placeholder service
│   │   └── 📁 profile/             # User profile endpoints
│   │
│   ├── 📁 auth/                    # Authentication pages
│   │   └── 📁 signin/              # Sign-in page
│   │
│   ├── 📁 components/              # React components
│   │   ├── 📁 content/             # Content display components
│   │   │   ├── 📄 ContentCard.tsx           # Individual content card
│   │   │   ├── 📄 ContentFeed.tsx           # Main content feed
│   │   │   ├── 📄 CategorizedContentFeed.tsx # Category-filtered feed
│   │   │   ├── 📄 DragDropWrapper.tsx       # Drag & drop container
│   │   │   └── 📄 SimpleDragDropFeed.tsx    # Demo drag & drop
│   │   │
│   │   ├── 📁 layout/              # Layout components
│   │   │   ├── 📄 Header.tsx               # Application header
│   │   │   ├── 📄 Navigation.tsx           # Navigation menu
│   │   │   └── 📄 Sidebar.tsx              # Sidebar component
│   │   │
│   │   ├── 📁 providers/           # Context providers
│   │   │   ├── 📄 ReduxProvider.tsx        # Redux store provider
│   │   │   └── 📄 ThemeProvider.tsx        # Theme context provider
│   │   │
│   │   └── 📁 ui/                  # Reusable UI components
│   │       ├── 📄 Button.tsx               # Button component
│   │       ├── 📄 Modal.tsx                # Modal component
│   │       └── 📄 SearchBar.tsx            # Search input component
│   │
│   ├── 📁 dashboard/               # Dashboard pages
│   │   └── 📄 page.tsx             # Main dashboard page
│   │
│   ├── 📁 hooks/                   # Custom React hooks
│   │   ├── 📄 redux.ts             # Redux typed hooks
│   │   ├── 📄 useApiData.ts        # API data fetching hook
│   │   ├── 📄 useCategorizedNews.ts # News categorization hook
│   │   ├── 📄 useDebounce.ts       # General debounce hook
│   │   ├── 📄 useDebounceSearch.ts # Search-specific debounce
│   │   ├── 📄 useDndKit.ts         # DnD Kit implementation
│   │   ├── 📄 useDragAndDrop.ts    # Drag & drop logic
│   │   └── 📄 useMovieSearch.ts    # Movie search functionality
│   │
│   ├── 📁 lib/                     # Utility libraries
│   │   ├── 📄 auth.ts              # Authentication configuration
│   │   └── 📄 authService.ts       # Authentication service
│   │
│   ├── 📁 services/                # API services
│   │   ├── 📄 api.ts               # Main API service
│   │   ├── 📄 apiKeys.ts           # API key management
│   │   ├── 📄 mockApi.ts           # Mock API for development
│   │   └── 📄 movieAPI.ts          # Movie-specific API calls
│   │
│   ├── 📁 store/                   # Redux store
│   │   ├── 📄 index.ts             # Store configuration
│   │   ├── 📄 authSlice.ts         # Authentication state
│   │   ├── 📄 contentSlice.ts      # Content management state
│   │   ├── 📄 errorSlice.ts        # Error handling state
│   │   ├── 📄 preferencesSlice.ts  # User preferences state
│   │   ├── 📄 searchSlice.ts       # Search functionality state
│   │   └── 📄 themeSlice.ts        # Theme management state
│   │
│   ├── 📁 types/                   # TypeScript type definitions
│   │   └── 📄 index.ts             # Global type definitions
│   │
│   └── 📁 utils/                   # Utility functions
│       ├── 📄 dateUtils.ts         # Date formatting utilities
│       ├── 📄 imageUtils.ts        # Image processing utilities
│       └── 📄 validation.ts        # Input validation helpers
│
├── 📁 testing/                     # Comprehensive testing suite
│   ├── 📄 README.md               # Testing documentation
│   ├── 📁 data/                   # Mock API responses
│   ├── 📁 mocks/                  # Mock implementations
│   ├── 📁 setup/                  # Jest configuration
│   ├── 📁 unit/                   # Unit tests
│   └── 📁 utils/                  # Testing utilities
│
├── 📁 cypress/                     # E2E testing
│   ├── 📁 e2e/                    # End-to-end tests
│   ├── 📁 fixtures/               # Test data
│   └── 📁 support/                # Cypress support files
│
├── 📁 public/                      # Static assets
│   ├── 📄 favicon.ico             # Site favicon
│   └── 🖼️ *.svg                   # SVG icons and images
│
├── 📄 package.json                # Dependencies and scripts
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 tailwind.config.ts          # TailwindCSS configuration
├── 📄 next.config.ts              # Next.js configuration
├── 📄 jest.config.js              # Jest testing configuration
├── 📄 cypress.config.ts           # Cypress E2E configuration
├── 📄 eslint.config.mjs           # ESLint configuration
└── 📄 .env.local                  # Environment variables (create this)
```

## 🎯 Available Scripts & Commands

### 🔧 **Development Commands**
```bash
# 🚀 Start development server (with Turbopack - faster)
npm run dev

# 🚀 Start development server (traditional Webpack)
npm run dev --no-turbopack

# 🏗️ Build for production
npm run build

# 🌟 Start production server
npm run start

# 🔍 Run ESLint linting
npm run lint

# 🔧 Fix ESLint issues automatically
npm run lint --fix
```

### 🧪 **Testing Commands**
```bash
# 🧪 Run all tests
npm run test

# 👀 Run tests in watch mode
npm run test:watch

# 📊 Generate test coverage report
npm run test:coverage

# 🤖 Run tests for CI/CD (no watch mode)
npm run test:ci

# 🎭 Run end-to-end tests with Cypress
npx cypress open

# 🎭 Run Cypress tests in headless mode
npx cypress run
```

### 🛠️ **Development Utilities**
```bash
# 📦 Install new dependency
npm install <package-name>

# 📦 Install new dev dependency
npm install --save-dev <package-name>

# 🔄 Update all dependencies
npm update

# 🧹 Clean node_modules and reinstall
rm -rf node_modules package-lock.json && npm install

# 📋 List installed packages
npm list

# 🔍 Check for outdated packages
npm outdated

# 🔒 Audit for security vulnerabilities
npm audit

# 🔧 Fix security vulnerabilities
npm audit fix
```

### 🎨 **Styling & Build Commands**
```bash
# 🎨 Build TailwindCSS
npx tailwindcss -i ./app/globals.css -o ./dist/output.css --watch

# 🔍 Analyze bundle size
npm run build && npx @next/bundle-analyzer

# 🧹 Clean build files
rm -rf .next

# 📏 Format code with Prettier (if configured)
npx prettier --write .

# 🔍 Check TypeScript errors
npx tsc --noEmit
```

## 🎪 Content Cards & Features

### 📰 **News Cards**
- 📰 **Headlines**: Eye-catching titles and descriptions
- 🖼️ **Images**: High-quality thumbnails with fallbacks
- 👤 **Author Information**: Bylines and publication details
- 📅 **Publication Dates**: Human-readable timestamps
- 🔗 **Source Links**: Direct links to original articles
- 🏷️ **Categories**: Technology, Business, Sports, Entertainment

### 🎬 **Movie Cards**
- 🎬 **Title & Year**: Movie titles with release years
- 🖼️ **Posters**: High-resolution movie posters
- ⭐ **Ratings**: IMDb ratings and review scores
- 🎭 **Genres**: Action, Drama, Comedy, Sci-Fi, etc.
- 📝 **Plot Summaries**: Brief movie descriptions
- 🎯 **Quick Actions**: Add to favorites, view details

### 📱 **Social Media Cards**
- 👤 **User Profiles**: User avatars and display names
- 📝 **Post Content**: Text content with rich formatting
- 🖼️ **Media Attachments**: Images and media previews
- 📅 **Timestamps**: Relative time formatting
- 💬 **Engagement**: Likes, shares, comments (mock data)
- 🏷️ **Hashtags**: Trending topics and tags

## 📡 API Status Monitor

### 🚨 **Real-time Monitoring**
Located in the bottom-right corner, the API status monitor provides:

- 🟢 **Green**: All APIs operational
- 🟡 **Yellow**: Some APIs experiencing issues
- 🔴 **Red**: Critical API failures
- 📊 **Detailed Status**: Click to view individual API health
- 🔧 **Troubleshooting**: Guided help for common issues

### 🛠️ **Troubleshooting Guide**
```bash
# Check API key validity
curl -H "X-API-Key: YOUR_NEWS_API_KEY" \
     "https://newsapi.org/v2/top-headlines?country=us"

# Test OMDB API
curl "http://www.omdbapi.com/?i=tt3896198&apikey=YOUR_OMDB_KEY"

# Verify environment variables
echo $NEXT_PUBLIC_NEWS_API_KEY
echo $NEXT_PUBLIC_OMDB_API_KEY
```

## 🚨 Error Handling & Recovery

### 🛡️ **Comprehensive Error Management**
- 🚫 **Invalid API Keys**: Automatic detection with helpful messages
- 🌐 **Network Errors**: Retry mechanisms with exponential backoff
- 🖼️ **Image Fallbacks**: Default images for missing content
- ⏳ **Loading States**: Elegant loading animations and skeletons
- 🔄 **Auto-retry**: Automatic retry for failed requests
- 📝 **Error Logging**: Detailed error tracking for debugging

### 🎭 **Error Boundaries**
```typescript
// Graceful error handling at component level
<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

## 🛠️ Technology Stack

### 🏗️ **Core Framework**
- ⚛️ **Next.js 15.4.6** - React framework with App Router
- ⚛️ **React 18.3.1** - UI library with concurrent features
- 📘 **TypeScript 5.0** - Static type checking
- 🎨 **TailwindCSS 4.1.11** - Utility-first CSS framework

### 🔄 **State Management**
- 🗃️ **Redux Toolkit 2.8.2** - Predictable state container
- 🔗 **React Redux 9.2.0** - React bindings for Redux
- 💾 **localStorage** - Client-side persistence

### 🎪 **Animations & Interactions**
- 🎭 **Framer Motion 12.23.12** - Advanced animations
- 🖱️ **React Beautiful DnD 13.1.1** - Drag and drop functionality
- 🎨 **Smooth transitions** - Custom CSS animations

### 🌐 **API & Data Fetching**
- 📡 **Axios 1.11.0** - HTTP client with interceptors
- 🔄 **Custom hooks** - Reusable data fetching logic
- ⏱️ **Debouncing** - Optimized search performance

### 🔐 **Authentication & Security**
- 🔒 **NextAuth.js 4.24.11** - Authentication for Next.js
- 🔐 **bcryptjs 3.0.2** - Password hashing
- 🛡️ **Input validation** - XSS and injection protection

### 🧪 **Testing Infrastructure**
- 🧪 **Jest 30.0.5** - JavaScript testing framework
- 🎭 **Testing Library** - Simple and complete testing utilities
- 🤖 **Cypress 14.5.4** - End-to-end testing
- 📊 **Coverage reporting** - Code coverage metrics

### 🛠️ **Development Tools**
- 📝 **ESLint** - Code linting and formatting
- 🔧 **TypeScript ESLint** - TypeScript-specific linting
- ⚡ **Turbopack** - Fast bundler for development
- 🔍 **Type checking** - Compile-time error detection

## 🎮 Drag & Drop Features

### ✨ **Interactive Experience**
- 🖱️ **Smooth Dragging**: Fluid drag animations with visual feedback
- 🎯 **Drop Zones**: Clear visual indicators for valid drop areas
- 🔄 **Auto-Save**: Preferences automatically saved to localStorage
- 📱 **Touch Support**: Full mobile and tablet compatibility
- ♿ **Accessibility**: Keyboard navigation and screen reader support

### 🎨 **Visual Feedback**
```typescript
// Visual transformations during drag
🔄 Rotation: 1-2 degrees for natural feel
📏 Scale: 1.02-1.05x for emphasis
🌟 Shadow: Dynamic shadow depth
✨ Opacity: Smooth transparency effects
🎯 Indicators: Real-time drag status
```

### 🧪 **Test Pages**
```bash
# 🔧 Debug drag functionality
http://localhost:3000/debug-drag

# 🎮 Full drag & drop demo
http://localhost:3000/drag-drop-demo

# 🏠 Main dashboard with integrated DnD
http://localhost:3000/dashboard
```

## 🧪 Testing Infrastructure

### 📊 **Test Coverage Statistics**
- 🎯 **196 Total Tests** across 9 test suites
- ✅ **134 Passing Tests** (68% pass rate)
- 📈 **14.49% Code Coverage** with detailed reporting
- 🔧 **134 Unit Tests** for components and logic
- 🎭 **E2E Tests** for critical user flows

### 🏗️ **Testing Architecture**
```
testing/
├── 📁 data/          # Mock API responses and test data
├── 📁 mocks/         # Mock implementations for APIs
├── 📁 setup/         # Jest configuration and globals
├── 📁 unit/          # Component and logic unit tests
├── 📁 utils/         # Testing utilities and helpers
└── 📄 README.md      # Testing documentation
```

### 🧪 **Test Categories**
- ✅ **Component Tests**: UI component behavior and rendering
- ✅ **Hook Tests**: Custom React hooks functionality
- ✅ **Redux Tests**: State management and actions
- ✅ **API Tests**: Service layer and data fetching
- ✅ **Integration Tests**: Component interaction testing
- ✅ **E2E Tests**: Complete user flow validation

## 🚀 Deployment & Production

### 🌍 **Deployment Options**
```bash
# 🏗️ Build for production
npm run build

# 🚀 Start production server
npm run start

# 📊 Analyze bundle size
npm run build && npx @next/bundle-analyzer

# 🔍 Performance audit
npx lighthouse http://localhost:3000
```

### 🏢 **Platform Deployment**
```bash
# 🌍 Deploy to Vercel (recommended)
npx vercel

# 🐳 Docker deployment
docker build -t personalised-dashboard .
docker run -p 3000:3000 personalised-dashboard

# 📦 Static export (if needed)
npm run build && npm run export
```

### ⚙️ **Production Environment Variables**
```env
# Production API keys
NEXT_PUBLIC_NEWS_API_KEY=prod_news_api_key
NEXT_PUBLIC_OMDB_API_KEY=prod_omdb_api_key

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_production_secret

# Database (if using auth)
DATABASE_URL=your_production_database_url

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## 🔧 Configuration Files

### 📄 **Key Configuration Files**
```typescript
// next.config.ts - Next.js configuration
export default {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  }
}

// tailwind.config.ts - TailwindCSS configuration
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)'
      }
    }
  }
}

// jest.config.js - Testing configuration
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/testing/setup/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/app/$1'
  }
}
```

## 🎯 Performance Optimization

### ⚡ **Built-in Optimizations**
- 🎯 **Code Splitting**: Automatic route-based splitting
- 🖼️ **Image Optimization**: Next.js Image component
- 🗂️ **Tree Shaking**: Unused code elimination
- 💾 **Caching**: Intelligent caching strategies
- ⚡ **Turbopack**: Fast development bundling
- 🔄 **Lazy Loading**: Component and image lazy loading

### 📊 **Performance Metrics**
```bash
# 📊 Lighthouse audit
npx lighthouse http://localhost:3000 --output html

# 📈 Bundle analyzer
npm run build && npx @next/bundle-analyzer

# ⏱️ Performance profiling
npm run dev -- --profile

# 🔍 Type checking performance
npx tsc --noEmit --incremental
```

## 🔒 Security Features

### 🛡️ **Security Measures**
- 🔐 **Environment Variables**: Secure API key storage
- 🚫 **Input Validation**: XSS and injection prevention
- 🔒 **HTTPS Enforcement**: Secure connections only
- 🛡️ **CSRF Protection**: Cross-site request forgery prevention
- 🔑 **Authentication**: Secure user authentication
- 📝 **Content Security Policy**: CSP headers

### 🔐 **API Security**
```typescript
// API key validation
const validateApiKey = (key: string): boolean => {
  return key && key.length > 10 && !key.includes('demo');
};

// Request sanitization
const sanitizeInput = (input: string): string => {
  return input.replace(/<script[^>]*>.*?<\/script>/gi, '');
};
```

## 🐛 Troubleshooting

### 🔧 **Common Issues & Solutions**

#### 🚫 **API Key Issues**
```bash
# Problem: "Invalid API key" error
# Solution: Check environment variables
echo "News API Key: $NEXT_PUBLIC_NEWS_API_KEY"
echo "OMDB API Key: $NEXT_PUBLIC_OMDB_API_KEY"

# Verify API key format
curl -H "X-API-Key: $NEXT_PUBLIC_NEWS_API_KEY" \
     "https://newsapi.org/v2/top-headlines?country=us"
```

#### 🌐 **Network Issues**
```bash
# Problem: API requests failing
# Solution: Check network connectivity
ping newsapi.org
ping omdbapi.com

# Test API endpoints
curl "https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_KEY"
curl "http://www.omdbapi.com/?i=tt3896198&apikey=YOUR_KEY"
```

#### 🏗️ **Build Issues**
```bash
# Problem: Build failing
# Solution: Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Verify dependencies
npm audit
npm outdated
```

#### 🧪 **Test Issues**
```bash
# Problem: Tests failing
# Solution: Update snapshots and clear cache
npm run test -- --updateSnapshot
npm run test -- --clearCache

# Run specific test suite
npm run test -- --testNamePattern="SearchBar"

# Debug test environment
npm run test -- --verbose
```

### 📞 **Getting Help**
- 📖 **Documentation**: Check the `/testing/README.md` for detailed testing info
- 🐛 **Issues**: Report bugs in the GitHub issues section
- 💬 **Discussions**: Join community discussions
- 📧 **Contact**: Reach out to the development team

## 📈 Future Enhancements

### 🔮 **Planned Features**
- 🎨 **Custom Themes**: User-created color schemes
- 📊 **Analytics Dashboard**: Usage metrics and insights
- 🔔 **Push Notifications**: Real-time content updates
- 🌍 **Internationalization**: Multi-language support
- 📱 **PWA Features**: Offline functionality
- 🤖 **AI Recommendations**: Personalized content suggestions

### 🛠️ **Technical Improvements**
- ⚡ **Performance**: Further optimization and caching
- 🧪 **Testing**: Increase coverage to 90%+
- ♿ **Accessibility**: Enhanced accessibility features
- 🔒 **Security**: Additional security measures
- 📱 **Mobile**: Enhanced mobile experience
- 🌐 **SEO**: Search engine optimization

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Personalized Dashboard

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### 👥 **How to Contribute**
1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔀 Open a Pull Request

### 📋 **Development Guidelines**
- ✅ Follow TypeScript best practices
- 🧪 Write tests for new features
- 📝 Update documentation
- 🎨 Follow the existing code style
- 🔍 Run linting before submitting

---

## 🎉 Acknowledgments

- 🙏 **Next.js Team** - For the amazing React framework
- 🎨 **Tailwind CSS** - For the utility-first CSS framework
- 🗃️ **Redux Toolkit** - For simplified state management
- 🧪 **Testing Library** - For simple and complete testing utilities
- 📰 **News API** - For providing news data
- 🎬 **OMDB API** - For movie information
- 👥 **Open Source Community** - For inspiration and contributions

---

<div align="center">

### 🚀 **Ready to build something amazing?**

**Star ⭐ this repo if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/your-username/personalised-dashboard?style=social)](https://github.com/your-username/personalised-dashboard)
[![GitHub forks](https://img.shields.io/github/forks/your-username/personalised-dashboard?style=social)](https://github.com/your-username/personalised-dashboard/fork)

</div>