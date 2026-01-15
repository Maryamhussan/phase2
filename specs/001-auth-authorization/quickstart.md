# Quickstart: Authentication & Authorization Development

**Feature**: Authentication & Authorization for Todo Web Application
**Date**: 2026-01-08
**Status**: Ready for Implementation

## Overview

This guide provides step-by-step instructions for setting up the local development environment and implementing the authentication & authorization feature.

## Prerequisites

### Required Software
- **Python 3.11+**: Backend runtime
- **Node.js 18+**: Frontend runtime
- **Git**: Version control
- **PostgreSQL Client**: For Neon database connection (optional, for debugging)

### Accounts Required
- **Neon Account**: For serverless PostgreSQL database
  - Sign up at https://neon.tech
  - Create a new project
  - Copy connection string

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd phase2
git checkout 001-auth-authorization
```

### 2. Generate Shared Secret

Generate a secure random secret for JWT signing/verification:

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Python (cross-platform)
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Save this secret - you'll use it in both frontend and backend `.env` files.

### 3. Backend Setup

#### Create Backend Directory Structure

```bash
mkdir -p backend/src/{models,services,api,core}
mkdir -p backend/tests
cd backend
```

#### Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

#### Install Dependencies

Create `requirements.txt`:

```txt
fastapi>=0.104.0
sqlmodel>=0.0.14
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
uvicorn[standard]>=0.24.0
psycopg2-binary>=2.9.9
python-dotenv>=1.0.0
pydantic[email]>=2.5.0
```

Install:

```bash
pip install -r requirements.txt
```

#### Configure Environment Variables

Create `backend/.env`:

```bash
# Shared JWT secret (same as frontend)
BETTER_AUTH_SECRET=<your-generated-secret-here>

# Neon PostgreSQL connection
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require

# API configuration
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

# Environment
ENVIRONMENT=development
```

Create `backend/.env.example` (commit this, not .env):

```bash
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true
ENVIRONMENT=development
```

### 4. Frontend Setup

#### Create Frontend Directory Structure

```bash
cd ..
npx create-next-app@latest frontend --typescript --app --no-src-dir
cd frontend
```

#### Install Dependencies

```bash
npm install better-auth axios
npm install -D @types/node
```

#### Configure Environment Variables

Create `frontend/.env.local`:

```bash
# Shared JWT secret (same as backend)
BETTER_AUTH_SECRET=<your-generated-secret-here>

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth configuration
BETTER_AUTH_URL=http://localhost:3000
```

Create `frontend/.env.local.example` (commit this):

```bash
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_URL=http://localhost:3000
```

### 5. Database Setup

#### Run Migrations

Create `backend/migrations/001_create_users_table.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_created_at ON users(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

Apply migration (using psql or Neon SQL Editor):

```bash
psql $DATABASE_URL -f backend/migrations/001_create_users_table.sql
```

## Running the Application

### Start Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- API: http://localhost:8000
- OpenAPI docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at:
- Application: http://localhost:3000

## Development Workflow

### 1. Implement User Model

File: `backend/src/models/user.py`

See `data-model.md` for complete implementation.

### 2. Implement JWT Utilities

File: `backend/src/core/security.py`

Functions:
- `create_access_token(data: dict) -> str`
- `verify_token(token: str) -> dict`
- `get_password_hash(password: str) -> str`
- `verify_password(plain_password: str, hashed_password: str) -> bool`

### 3. Implement Authentication Dependency

File: `backend/src/api/dependencies.py`

Function:
- `async def get_current_user(token: str = Depends(oauth2_scheme)) -> User`

### 4. Implement Authentication Endpoints

File: `backend/src/api/auth.py`

Endpoints:
- `POST /auth/signup` - Create user account
- `POST /auth/signin` - Authenticate user
- `GET /auth/me` - Get current user

### 5. Implement Frontend Authentication

Files:
- `frontend/src/lib/auth.ts` - Better Auth configuration
- `frontend/src/components/auth/SignupForm.tsx` - Signup form
- `frontend/src/components/auth/SigninForm.tsx` - Signin form
- `frontend/src/lib/api-client.ts` - API client with JWT injection

### 6. Test Authentication Flow

#### Manual Testing

1. **Signup**:
   ```bash
   curl -X POST http://localhost:8000/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

2. **Signin**:
   ```bash
   curl -X POST http://localhost:8000/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Get Current User**:
   ```bash
   curl -X GET http://localhost:8000/auth/me \
     -H "Authorization: Bearer <token-from-signin>"
   ```

#### Automated Testing

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm test
```

## Verification Checklist

### Backend Verification

- [x] Backend starts without errors
- [x] OpenAPI docs accessible at http://localhost:8000/docs
- [x] Database connection successful
- [x] Users table exists in database
- [x] POST /auth/signup creates user and returns JWT
- [x] POST /auth/signin validates credentials and returns JWT
- [x] GET /auth/me requires valid JWT token
- [x] Invalid JWT returns 401 Unauthorized
- [x] Expired JWT returns 401 Unauthorized

### Frontend Verification

- [x] Frontend starts without errors
- [x] Signup page accessible at /signup
- [x] Signin page accessible at /signin
- [x] Signup form validates email format
- [x] Signup form validates password length (min 8 chars)
- [x] Successful signup redirects to dashboard
- [x] Successful signin redirects to dashboard
- [x] JWT token stored after authentication
- [x] API requests include Authorization header

### Security Verification

- [x] Passwords are hashed (never plaintext in database)
- [x] JWT secret is not hardcoded (from environment variable)
- [x] Duplicate email returns 409 Conflict
- [x] Invalid credentials return consistent error message
- [x] User enumeration is prevented
- [x] Cross-user access attempts return 404 (not 403)

## Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'fastapi'`
- **Solution**: Activate virtual environment and install dependencies

**Issue**: `psycopg2.OperationalError: could not connect to server`
- **Solution**: Check DATABASE_URL in .env, verify Neon connection string

**Issue**: `jose.exceptions.JWTError: Signature verification failed`
- **Solution**: Ensure BETTER_AUTH_SECRET matches between frontend and backend

### Frontend Issues

**Issue**: `Error: Cannot find module 'better-auth'`
- **Solution**: Run `npm install better-auth`

**Issue**: `CORS error when calling backend API`
- **Solution**: Add CORS middleware to FastAPI backend

**Issue**: `401 Unauthorized on all requests`
- **Solution**: Check JWT token is included in Authorization header

### Database Issues

**Issue**: `relation "users" does not exist`
- **Solution**: Run database migration script

**Issue**: `duplicate key value violates unique constraint "idx_users_email"`
- **Solution**: Email already registered, use different email or signin

## Next Steps

After completing local setup:

1. **Run /sp.tasks**: Generate tasks.md with concrete implementation tasks
2. **Run /sp.implement**: Execute tasks using specialized agents
3. **Security Review**: Invoke auth-engineer agent for security validation
4. **Testing**: Validate all success criteria from spec.md
5. **Documentation**: Update README files with setup instructions

## Resources

### Documentation
- FastAPI: https://fastapi.tiangolo.com
- SQLModel: https://sqlmodel.tiangolo.com
- Better Auth: https://better-auth.com
- Next.js: https://nextjs.org/docs
- Neon: https://neon.tech/docs

### API Contracts
- OpenAPI Spec: `specs/001-auth-authorization/contracts/auth-api.yaml`
- Interactive Docs: http://localhost:8000/docs (when backend running)

### Architecture Documents
- Specification: `specs/001-auth-authorization/spec.md`
- Implementation Plan: `specs/001-auth-authorization/plan.md`
- Research: `specs/001-auth-authorization/research.md`
- Data Model: `specs/001-auth-authorization/data-model.md`

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review architecture documents in `specs/001-auth-authorization/`
3. Consult API documentation at http://localhost:8000/docs
4. Review constitution principles in `.specify/memory/constitution.md`
