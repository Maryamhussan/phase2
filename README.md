# Todo Web Application - Authentication & Authorization

This project implements a multi-user todo web application with secure authentication and authorization using JWT tokens and user data isolation.

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 16+ (App Router) with TypeScript
- **Backend**: Python FastAPI with async/await
- **Database**: Neon Serverless PostgreSQL with SQLModel ORM
- **Authentication**: Better Auth with JWT tokens
- **Security**: Bcrypt password hashing, user data isolation

### Key Features
1. **User Registration**: Secure signup with email validation and password hashing
2. **User Authentication**: Signin with JWT token issuance and validation
3. **Protected Resources**: JWT-based access control for all endpoints
4. **User Data Isolation**: Each user can only access their own data
5. **Security-First Design**: Multiple layers of security validation

## Implementation Summary

### Backend Components
- **User Model**: Complete user entity with email, hashed password, timestamps
- **JWT Utilities**: Token creation, verification, and user extraction functions
- **Security Layer**: Password hashing/verification with bcrypt
- **Authentication Endpoints**: `/auth/signup`, `/auth/signin`, `/auth/me`
- **Protected Endpoints**: Example task endpoints with user isolation
- **Database Integration**: SQLModel with Neon PostgreSQL

### Frontend Components
- **Authentication Flow**: Signup and signin pages with form validation
- **JWT Management**: Token storage and automatic header injection
- **Protected Dashboard**: User-specific data access with authentication check
- **API Client**: Axios-based client with error handling and token management

### Security Implementation
- **JWT Tokens**: 24-hour expiration with automatic refresh capability
- **Password Security**: Bcrypt hashing with 12-cost factor
- **Data Isolation**: All queries filtered by authenticated user ID
- **Input Validation**: Pydantic models with email and password constraints
- **Error Handling**: Consistent error messages to prevent user enumeration

## Project Structure
```
phase2/
├── backend/                 # FastAPI application
│   ├── src/
│   │   ├── models/         # SQLModel entities
│   │   ├── api/            # API routers and dependencies
│   │   ├── core/           # Configuration and security utilities
│   │   └── main.py         # FastAPI application entry point
│   ├── migrations/         # Database migration scripts
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities and API clients
│   │   └── app/            # App Router pages
│   └── package.json        # Node.js dependencies
└── specs/001-auth-authorization/  # Complete specification and documentation
    ├── spec.md            # User stories and requirements
    ├── plan.md            # Implementation plan
    ├── data-model.md      # Database schema
    ├── contracts/         # OpenAPI specification
    └── quickstart.md      # Development guide
```

## Security Principles Enforced

1. **Stateless Authentication**: JWT tokens contain all necessary user information
2. **User Data Isolation**: All database queries include user ID filter
3. **Password Security**: Bcrypt hashing with proper salt generation
4. **Token Validation**: All protected endpoints verify JWT signature and expiration
5. **Input Validation**: Server-side validation using Pydantic models
6. **Error Consistency**: Same error messages for different failure modes

## Success Criteria Achieved

- ✅ P1: Account creation with email/password validation
- ✅ P2: Secure sign-in with JWT token issuance
- ✅ P3: Protected resource access with user isolation
- ✅ All 18 functional requirements implemented
- ✅ All 8 success criteria validated
- ✅ Security-first architecture with multiple validation layers

## Getting Started

1. **Environment Setup**:
   - Install Python 3.11+, Node.js 18+, Git
   - Create Neon PostgreSQL database
   - Generate JWT secret (min 32 chars)

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   # Configure .env with DATABASE_URL and BETTER_AUTH_SECRET
   uvicorn src.main:app --reload
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   # Configure .env.local with BETTER_AUTH_SECRET and NEXT_PUBLIC_API_URL
   npm run dev
   ```

## API Documentation

- **Backend API**: http://localhost:8000/docs (when running)
- **Authentication Endpoints**:
  - `POST /auth/signup` - Create user account
  - `POST /auth/signin` - Authenticate user
  - `GET /auth/me` - Get current user
- **Protected Endpoints**:
  - `GET /api/tasks` - Get user's tasks
  - `POST /api/tasks` - Create user's task
  - `GET /api/tasks/{id}` - Get specific task (user isolation enforced)

## Next Steps

The authentication and authorization foundation is complete. Next phases will implement:
- Full todo management features
- Advanced user preferences and settings
- Enhanced security features (MFA, password reset)
- Performance optimizations and monitoring

## Architecture Decision Records

This implementation follows the architectural decisions documented in the specification, including:
- JWT-based stateless authentication
- Dependency injection for authentication validation
- User ID extraction from JWT "sub" claim
- 24-hour token expiration with 401 error handling
- Always using JWT user_id instead of client input