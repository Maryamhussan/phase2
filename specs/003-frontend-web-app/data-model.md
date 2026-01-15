# Data Model: Frontend Web Application for Todo System

**Feature**: Frontend Web Application for Todo System
**Date**: 2026-01-09
**Status**: Ready for Implementation

## Overview

This document defines the frontend data structures, state management, and UI component data models required for the todo web application. The frontend data model reflects the backend API contracts while incorporating client-side state management needs.

## Frontend State Model

### Authentication State
Represents the current authentication status and user information.

**Structure**:
```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface User {
  id: string;
  email: string;
  createdAt: string;
}
```

**Validation Rules**:
- `isAuthenticated` must be boolean
- `user` is required when authenticated
- `token` must be valid JWT string when present
- `isLoading` indicates authentication state transitions
- `error` contains user-friendly error messages

### Theme State
Manages the current theme (light/dark) and user preferences.

**Structure**:
```typescript
type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  currentTheme: Theme;
  isDarkMode: boolean;
  systemTheme: 'light' | 'dark';
}
```

**Validation Rules**:
- `currentTheme` must be one of 'light', 'dark', or 'system'
- `isDarkMode` is computed from current and system themes
- `systemTheme` reflects user's OS preference

### Task State
Manages the list of tasks and loading/error states.

**Structure**:
```typescript
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
}

interface TaskFilters {
  status: 'all' | 'active' | 'completed';
  searchQuery: string;
}
```

**Validation Rules**:
- `tasks` is an array of Task objects
- `loading` indicates data fetch status
- `error` contains user-friendly error messages
- `filters` control task list display

## UI Component Data Models

### Task Card Component
Displays individual tasks with interactive elements.

**Props Interface**:
```typescript
interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: number, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  isLoading?: boolean;
}
```

**State Management**:
- Tracks editing state locally
- Manages optimistic updates
- Handles error states for individual operations

### Task Form Component
Handles task creation and editing with validation.

**Props Interface**:
```typescript
interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: TaskFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

interface TaskFormData {
  title: string;
  description?: string;
  completed: boolean;
}
```

**Validation Rules**:
- `title` is required (1-255 characters)
- `description` is optional (0-1000 characters)
- `completed` is boolean
- Form state tracks validation errors

### API Response Models
Frontend representations of backend API responses.

**Task Response**:
```typescript
interface TaskResponse {
  id: number;
  user_id: string; // UUID
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
```

**Auth Response**:
```typescript
interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    created_at: string;
  };
}
```

## Component State Management

### Dashboard Page State
Manages the main task management interface.

**State Structure**:
```typescript
interface DashboardState {
  // Task list state
  tasks: TaskResponse[];
  filteredTasks: TaskResponse[];
  loading: boolean;
  error: string | null;

  // Form states
  isCreatingTask: boolean;
  isEditingTaskId: number | null;
  taskFormError: string | null;

  // Filter states
  activeFilter: 'all' | 'active' | 'completed';
  searchQuery: string;

  // UI states
  theme: ThemeState;
  auth: AuthState;
}
```

### Authentication Page States
Manages sign-in and sign-up page states.

**Sign-in State**:
```typescript
interface SignInState {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  showPassword: boolean;
}

interface SignUpState {
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string | null;
  showPassword: boolean;
}
```

## Data Flow Patterns

### Authentication Flow
1. User interacts with sign-in form
2. Form state manages input validation
3. API client sends credentials to backend
4. Backend returns JWT token and user data
5. Auth context updates global authentication state
6. User is redirected to dashboard

### Task Management Flow
1. Dashboard component fetches tasks from API
2. Tasks are stored in component state
3. User interacts with task (toggle, edit, delete)
4. API client sends update request with JWT token
5. Backend processes request and returns updated task
6. Component state updates with new data
7. UI reflects updated state

### Theme Management Flow
1. Theme context initializes with system preference
2. User toggles theme preference
3. CSS variables update for all components
4. Preference is stored in localStorage
5. Next page load uses stored preference

## Error Handling Models

### API Error Response
Standardized error response handling.

```typescript
interface ApiErrorResponse {
  detail: string; // User-friendly error message
  status_code: number; // HTTP status code
  timestamp: string; // ISO date string
}
```

### Validation Error Response
Client-side form validation errors.

```typescript
interface ValidationErrorResponse {
  field: string; // Field name with error
  message: string; // User-friendly error message
  code: string; // Validation error code
}
```

## Performance Considerations

### State Optimization
- Use React.memo for component memoization
- Implement useCallback for stable function references
- Use useMemo for expensive calculations
- Implement virtual scrolling for large task lists

### Data Fetching
- Implement optimistic updates for better UX
- Use loading states for immediate feedback
- Implement proper error boundaries
- Cache API responses where appropriate

### Memory Management
- Clean up event listeners
- Cancel ongoing API requests when components unmount
- Implement proper cleanup in useEffect hooks
- Avoid memory leaks in interval/timeouts

## Security Considerations

### Token Management
- JWT tokens stored securely in memory/localStorage
- Automatic token refresh before expiration
- Secure token transmission via HTTPS
- Proper token cleanup on logout

### Input Sanitization
- Client-side validation for immediate feedback
- Input sanitization before API submission
- Proper encoding of user-generated content
- Prevention of XSS attacks

### State Protection
- Authentication state protected from unauthorized access
- User data isolation enforced at component level
- Proper access controls for sensitive operations
- Secure handling of error messages

## Future Extensions

### Potential Additions (Out of Scope)
- **Task Categories**: Category field with category objects
- **Task Priority**: Priority enum with priority objects
- **Due Dates**: Due date field with date objects
- **Subtasks**: Nested task structure with parent-child relationships
- **Tags**: Tag objects with many-to-many relationships
- **Sharing**: Sharing permissions with user relationships

## Validation Against Requirements

- ✅ FR-001: Dashboard Page - State model supports task display
- ✅ FR-002-005: Task Operations - State model supports CRUD operations
- ✅ FR-006: Theme Switching - Theme state model implemented
- ✅ FR-007: Responsive Layout - Component state supports responsive behavior
- ✅ FR-008: API Integration - API response models defined
- ✅ FR-009: Loading States - Loading state properties included
- ✅ FR-010: Error Handling - Error state properties defined
- ✅ FR-011: Authentication Guard - Auth state model implemented
- ✅ FR-012-013: Auth Pages - Auth page state models defined
- ✅ FR-015-017: Task Features - Task state model supports filtering/searching
- ✅ FR-018: Form Validation - Validation models defined
- ✅ FR-019-020: Accessibility & Styling - Component props support accessibility

## Summary

The frontend data model provides a comprehensive foundation for the todo web application with proper state management, validation, and security considerations. The model aligns with the backend API contracts while incorporating client-side state management needs for an optimal user experience.