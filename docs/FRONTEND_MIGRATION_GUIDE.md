# RCNG Frontend Migration Guide

This guide provides a comprehensive plan for migrating and refactoring the RCNG frontend application.

## Table of Contents
1. [Migration Overview](#migration-overview)
2. [Directory Structure](#directory-structure)
3. [Dependencies](#dependencies)
4. [Authentication Flow](#authentication-flow)
5. [State Management](#state-management)
6. [Component Structure](#component-structure)
7. [Styling Approach](#styling-approach)
8. [Testing Strategy](#testing-strategy)
9. [Performance Optimization](#performance-optimization)
10. [Deployment](#deployment)

## Migration Overview

The goal of this migration is to:
1. Reorganize the frontend codebase for better maintainability
2. Update dependencies to their latest stable versions
3. Implement modern React patterns and best practices
4. Improve performance and user experience
5. Set up proper testing and CI/CD pipelines

## Directory Structure

```
/frontend
  /public                  # Static files
  /src
    /api                   # API service layer
    /assets               # Images, fonts, etc.
    /components           # Reusable UI components
      /ui                 # Basic UI components (buttons, inputs, etc.)
      /layout             # Layout components (header, footer, etc.)
      /forms              # Form components
    /config              # Configuration files
    /contexts            # React contexts
    /hooks               # Custom React hooks
    /layouts             # Page layout components
    /pages               # Page components (Next.js pages)
    /store               # State management
      /slices            # Redux slices
      /selectors         # Redux selectors
      /actions           # Redux actions
    /styles              # Global styles and theme
    /types               # TypeScript type definitions
    /utils               # Utility functions
    /__tests__           # Test files
      /components        # Component tests
      /pages            # Page tests
      /utils            # Utility function tests
    App.tsx             # Main App component
    _app.tsx            # Next.js App component
    _document.tsx       # Next.js Document component
    index.tsx           # Entry point
  .env.development      # Development environment variables
  .env.production       # Production environment variables
  next.config.js        # Next.js configuration
  package.json          # Dependencies and scripts
  tsconfig.json         # TypeScript configuration
  jest.config.js        # Jest configuration
  .eslintrc.js          # ESLint configuration
  .prettierrc          # Prettier configuration
```

## Dependencies

### Core Dependencies
- Next.js 14+ (React 18+)
- TypeScript 5+
- Redux Toolkit
- React Query
- Axios
- Tailwind CSS
- Headless UI
- React Hook Form
- Zod (for schema validation)
- NextAuth.js (for authentication)

### Development Dependencies
- ESLint
- Prettier
- Husky (for Git hooks)
- Jest
- React Testing Library
- Cypress (for E2E testing)
- Storybook

### Installation

```bash
# Create new Next.js app with TypeScript
npx create-next-app@latest frontend --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"

# Install core dependencies
cd frontend
npm install @reduxjs/toolkit react-redux @tanstack/react-query axios @headlessui/react @heroicons/react react-hook-form zod next-auth

# Install dev dependencies
npm install -D @types/node @types/react @types/react-dom @types/jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @storybook/react @storybook/builder-webpack5 @storybook/manager-webpack5 @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/testing-library eslint-config-prettier eslint-plugin-prettier prettier husky lint-staged cypress

# Initialize Redux
mkdir -p src/store/{slices,selectors,actions}
touch src/store/store.ts

# Initialize API layer
mkdir -p src/api
```

## Authentication Flow

### 1. Set Up NextAuth.js

Create `src/pages/api/auth/[...nextauth].ts`:

```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password
          });

          if (data && data.token) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              token: data.token
            };
          }
          return null;
        } catch (error) {
          throw new Error('Authentication failed');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  }
});
```

### 2. Create Auth Context

Create `src/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.name || '',
            email: session.user.email || '',
            role: session.user.role || 'user'
          });
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [status]);

  const login = async (email: string, password: string) => {
    try {
      await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/dashboard'
      });
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 3. Create Protected Route Component

Create `src/components/auth/ProtectedRoute.tsx`:

```typescript
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';

type ProtectedRouteProps = {
  children: ReactNode;
  roles?: string[];
};

export const ProtectedRoute = ({ children, roles = [] }: ProtectedRouteProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (roles.length > 0 && !roles.includes(session.user.role)) {
      router.push('/unauthorized');
    }
  }, [session, status, router, roles]);

  if (status === 'loading' || !session) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (roles.length > 0 && !roles.includes(session.user.role)) {
    return <div>Unauthorized</div>; // Or a custom unauthorized page
  }

  return <>{children}</>;
};
```

## State Management

### 1. Set Up Redux Store

Create `src/store/store.ts`:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './api/authApi';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2. Create Auth Slice

Create `src/store/slices/authSlice.ts`:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(
      state,
      action: PayloadAction<{ user: AuthState['user']; token: string }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
```

### 3. Create API Slices

Create `src/store/api/authApi.ts`:

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getProfile: builder.query({
      query: () => '/auth/me',
    }),
  }),
});

export const { useLoginMutation, useGetProfileQuery } = authApi;
```

## Component Structure

### 1. Create Layout Components

Create `src/components/layouts/MainLayout.tsx`:

```typescript
import { ReactNode } from 'react';
import Head from 'next/head';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { useAuth } from '../../contexts/AuthContext';

type MainLayoutProps = {
  children: ReactNode;
  title?: string;
};

const MainLayout = ({ children, title = 'RCNG' }: MainLayoutProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title} | RCNG</title>
        <meta name="description" content="RCNG Application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isAuthenticated && <Header />}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
```

### 2. Create Reusable UI Components

Create `src/components/ui/Button.tsx`:

```typescript
import { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import { classNames } from '../../utils/classNames';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        (isLoading || disabled) ? 'opacity-70 cursor-not-allowed' : '',
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
```

## Styling Approach

### 1. Tailwind CSS Configuration

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

### 2. Global Styles

Update `src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-bold text-gray-900;
  }
  
  h1 { @apply text-4xl; }
  h2 { @apply text-3xl; }
  h3 { @apply text-2xl; }
  h4 { @apply text-xl; }
  h5 { @apply text-lg; }
  
  a {
    @apply text-primary-600 hover:text-primary-800 transition-colors;
  }
}

@layer components {
  .container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }
  
  .card {
    @apply bg-white rounded-lg shadow p-6;
  }
  
  .input {
    @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm;
  }
  
  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
}
```

## Testing Strategy

### 1. Unit Testing with Jest

Create `src/__tests__/utils/formatDate.test.ts`:

```typescript
import { formatDate } from '@/utils/formatDate';

describe('formatDate', () => {
  it('formats a date string correctly', () => {
    const date = '2023-08-16T14:30:00Z';
    expect(formatDate(date)).toBe('Aug 16, 2023');
  });
  
  it('returns empty string for invalid date', () => {
    expect(formatDate('invalid-date')).toBe('');
  });
});
```

### 2. Component Testing with React Testing Library

Create `src/__tests__/components/Button.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### 3. E2E Testing with Cypress

Create `cypress/e2e/home.cy.ts`:

describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the welcome message', () => {
    cy.contains('h1', 'Welcome to RCNG');
  });
  
  it('navigates to login page', () => {
    cy.get('a[href="/auth/login"]').click();
    cy.url().should('include', '/auth/login');
  });
});
```

## Performance Optimization

### 1. Code Splitting

Use dynamic imports for large components:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Disable server-side rendering if not needed
});
```

### 2. Image Optimization

Use Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Hero"
  width={1200}
  height={630}
  priority
  className="rounded-lg"
/>
```

### 3. Bundle Analysis

Add script to `package.json`:

```json
"scripts": {
  "analyze": "ANALYZE=true next build"
}
```

Install dependencies:
```bash
npm install --save-dev @next/bundle-analyzer
```

Create `next.config.js`:

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-image-domain.com'],
  },
});
```

## Deployment

### 1. Vercel Deployment

1. Push your code to a Git repository
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy!

### 2. Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=https://api.rcng.example.com
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

### 3. CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Next Steps

1. Set up Storybook for component development
2. Implement error boundaries
3. Add performance monitoring (Sentry, LogRocket)
4. Set up internationalization (i18n)
5. Implement PWA features
6. Add service worker for offline support
7. Set up analytics (Google Analytics, Mixpanel)
8. Implement feature flags
9. Set up A/B testing
10. Monitor Core Web Vitals
