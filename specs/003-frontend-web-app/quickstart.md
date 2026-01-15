# Quickstart: Frontend Web Application for Todo System

**Feature**: Frontend Web Application for Todo System
**Date**: 2026-01-09
**Status**: Ready for Implementation

## Overview

This guide provides step-by-step instructions for setting up and implementing the frontend web application for the todo system using Next.js 16+ with App Router, including authentication integration and responsive design.

## Prerequisites

### Required Software
- **Node.js 18+**: Runtime environment for Next.js
- **npm 8+ or yarn**: Package manager
- **Git**: Version control system
- **Modern Browser**: For development and testing (Chrome, Firefox, Safari)

### Accounts Required
- **GitHub/GitLab/Bitbucket**: For version control (if using CI/CD)
- **Vercel (optional)**: For Next.js deployment

### Backend Dependencies
- **Backend API**: Running at configured endpoint (from Phase 2)
- **JWT Secret**: Shared with backend (from Phase 1)
- **Database**: PostgreSQL with users and tasks tables (from Phase 2)

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd phase2
git checkout 003-frontend-web-app
```

### 2. Navigate to Frontend Directory
```bash
cd frontend
```

### 3. Install Dependencies
```bash
# If using npm
npm install

# If using yarn
yarn install
```

### 4. Configure Environment Variables
Create `.env.local` file in the frontend root:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=xbIE11IAdIVuKJeVg_oYme19Is38bVtvP_IBcIvxbXI
```

**Environment Variables Explanation**:
- `NEXT_PUBLIC_API_URL`: Backend API base URL (from Phase 2)
- `NEXT_PUBLIC_BETTER_AUTH_URL`: Frontend application URL
- `BETTER_AUTH_SECRET`: JWT secret shared with backend (from Phase 1)

## Development Setup

### 1. Project Structure
The Next.js application follows the App Router convention:

```
frontend/
├── app/                    # Next.js 16+ App Router pages
│   ├── (auth)/            # Authentication pages (sign-in, sign-up)
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/         # Protected dashboard page
│   │   └── page.tsx
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base components (Button, Input, etc.)
│   ├── auth/             # Authentication components
│   ├── tasks/            # Task management components
│   └── theme/            # Theme components
├── lib/                  # Utility functions and clients
│   ├── auth.ts          # Better Auth configuration
│   ├── api-client.ts    # API client with JWT handling
│   ├── theme.ts         # Theme context and utilities
│   └── types.ts         # Type definitions
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

### 2. Core Configuration Files

#### Next.js Configuration (`next.config.js`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['gravatar.com'], // For user avatars if implemented
  },
};

module.exports = nextConfig;
```

#### Tailwind CSS Configuration (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
};
```

## Implementation Steps

### Phase 1: Setup (T001-T010)

#### T001: Create Next.js 16+ Project
```bash
# Create Next.js app with TypeScript and App Router
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Navigate to frontend directory
cd frontend
```

#### T002: Configure Tailwind CSS
```bash
# Install Tailwind CSS dependencies (already done by create-next-app)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### T003: Set Up Theme Context
Create `frontend/lib/theme.ts`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const currentTheme = savedTheme || 'system';
    setTheme(currentTheme);

    // Apply theme class to document
    const root = window.document.documentElement;

    if (currentTheme === 'system') {
      setIsDarkMode(systemPrefersDark);
      root.classList.toggle('dark', systemPrefersDark);
    } else {
      setIsDarkMode(currentTheme === 'dark');
      root.classList.toggle('dark', currentTheme === 'dark');
    }
  }, []);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    const root = window.document.documentElement;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (newTheme === 'system') {
      setIsDarkMode(systemPrefersDark);
      root.classList.toggle('dark', systemPrefersDark);
    } else {
      setIsDarkMode(newTheme === 'dark');
      root.classList.remove('dark', newTheme === 'light');
      root.classList.add('dark', newTheme === 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

#### T004: Create Theme Toggle Component
Create `frontend/components/theme/theme-toggle.tsx`:

```typescript
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme, isDarkMode } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className={`h-5 w-5 rotate-0 scale-100 transition-all ${isDarkMode ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      <Moon className={`absolute h-5 w-5 rotate-90 scale-0 transition-all ${isDarkMode ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
    </Button>
  );
}
```

#### T005: Set Up API Client
Create `frontend/lib/api-client.ts`:

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add JWT token to requests
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Handle token expiration and refresh
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth token and redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/signin';
        }
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
```

### Phase 2: Core Components (T011-T020)

#### T011: Create Base Button Component
Create `frontend/components/ui/button.tsx`:

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### Phase 3: Authentication Integration (T021-T030)

#### T021: Configure Better Auth
Create `frontend/lib/auth.ts`:

```typescript
import { betterAuth } from 'better-auth/client';

export const authClient = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  fetchOptions: {
    credentials: 'include',
  },
});

export const {
  useSession,
  signIn,
  signOut,
  useAuth,
  getSession,
} = authClient;
```

## Running the Application

### Development Mode
```bash
# Start development server
npm run dev

# Or with yarn
yarn dev
```

The application will be available at:
- Frontend: http://localhost:3000
- API Documentation: http://localhost:8000/docs (when backend running)

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Testing the Implementation

### Manual Testing

#### Authentication Flow:
1. Visit http://localhost:3000
2. Verify redirect to sign-in page
3. Test sign-in with valid credentials
4. Verify redirect to dashboard
5. Test sign-out functionality

#### Task Management:
1. Create a new task
2. Verify task appears in list
3. Toggle task completion status
4. Edit task details
5. Delete a task
6. Verify all operations sync with backend

#### Theme Functionality:
1. Toggle between light/dark themes
2. Verify theme persists across page reloads
3. Test system preference detection

#### Responsive Design:
1. Resize browser window
2. Verify layout adapts appropriately
3. Test on mobile device emulators

### Automated Testing
```bash
# Run unit tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Verification Checklist

### Frontend Implementation Verification
- [ ] Next.js 16+ App Router structure implemented
- [ ] Responsive design works across devices
- [ ] Light/dark theme toggle functions correctly
- [ ] Authentication flow works with backend
- [ ] Task CRUD operations work with backend
- [ ] API calls include JWT tokens automatically
- [ ] Loading states displayed during operations
- [ ] Error handling works appropriately
- [ ] Protected routes redirect unauthenticated users
- [ ] Form validation works correctly
- [ ] Accessibility features implemented

### Security Verification
- [ ] JWT tokens stored securely
- [ ] Tokens automatically included in API requests
- [ ] Unauthorized access redirects to sign-in
- [ ] Error messages don't leak sensitive information
- [ ] Input validation prevents XSS attacks

### Performance Verification
- [ ] Page load times under 3 seconds
- [ ] Smooth UI interactions (60fps)
- [ ] Optimized bundle sizes
- [ ] Proper image optimization
- [ ] Efficient state management

## Troubleshooting

### Common Issues

**Issue**: `NEXT_PUBLIC_API_URL` not working
- **Solution**: Verify environment variable is prefixed with `NEXT_PUBLIC_`
- **Check**: Ensure backend is running at specified URL

**Issue**: Authentication not working
- **Solution**: Verify BETTER_AUTH_SECRET matches backend
- **Check**: Ensure JWT token is being stored and sent correctly

**Issue**: Theme not persisting
- **Solution**: Check localStorage permissions
- **Check**: Verify ThemeProvider is wrapped around all components

**Issue**: API calls failing with 401
- **Solution**: Verify JWT token is valid and not expired
- **Check**: Ensure Authorization header is properly formatted

**Issue**: Components not rendering in dark mode
- **Solution**: Verify Tailwind darkMode is set to 'class'
- **Check**: Ensure CSS classes include dark: variants

## Next Steps

After completing the frontend implementation:

1. **Integration Testing**: Test complete flow from authentication to task management
2. **User Acceptance Testing**: Validate with real users
3. **Performance Optimization**: Optimize bundle sizes and loading times
4. **Accessibility Testing**: Ensure WCAG compliance
5. **Security Review**: Validate all security measures
6. **Deployment Preparation**: Set up production environment

## Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Better Auth: https://better-auth.com
- Tailwind CSS: https://tailwindcss.com
- React: https://react.dev

### API Contracts
- OpenAPI Spec: `specs/003-frontend-web-app/contracts/frontend-api-contracts.yaml`
- Interactive Docs: http://localhost:8000/docs (when backend running)

### Architecture Documents
- Specification: `specs/003-frontend-web-app/spec.md`
- Implementation Plan: `specs/003-frontend-web-app/plan.md`
- Data Model: `specs/003-frontend-web-app/data-model.md`

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review architecture documents in `specs/003-frontend-web-app/`
3. Consult API documentation at http://localhost:8000/docs
4. Review constitution principles in `.specify/memory/constitution.md`