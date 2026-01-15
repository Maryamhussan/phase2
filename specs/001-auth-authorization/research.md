# Research: Authentication & Authorization Architecture

**Feature**: Authentication & Authorization for Todo Web Application
**Date**: 2026-01-08
**Status**: Completed

## Overview

This document consolidates research findings and architecture decisions for implementing secure JWT-based authentication in a multi-user todo application. All decisions align with the Phase II constitution principles, particularly Security-First Design and User Data Isolation.

## Decision 1: Authentication Method - JWT vs Session-Based

**Decision**: Use JWT (JSON Web Token) stateless authentication

**Rationale**:
- **Constitutional Requirement**: Technology Stack Constraints mandate "No backend session storage (stateless authentication only)"
- **Scalability**: Stateless design enables horizontal scaling without session synchronization
- **Simplicity**: Single shared secret (BETTER_AUTH_SECRET) for both signing and verification
- **Decoupling**: Frontend and backend can operate independently; JWT is self-contained
- **Better Auth Compatibility**: Better Auth library natively supports JWT issuance

**Alternatives Considered**:
1. **Session-based authentication with cookies**
   - Rejected: Violates constitutional requirement for stateless backend
   - Would require session storage (Redis, database, or in-memory)
   - Adds complexity for horizontal scaling

2. **OAuth2 with external provider (Google, GitHub)**
   - Rejected: Explicitly out of scope per spec.md requirements
   - Adds external dependency and complexity
   - Not needed for basic email/password authentication

**Trade-offs**:
- ✅ **Pros**: Stateless, scalable, simple secret management, Better Auth integration
- ⚠️ **Cons**: Cannot revoke tokens before expiration (mitigated by 24-hour expiry), larger token size than session ID (acceptable for target scale)

**References**:
- JWT RFC 7519: https://tools.ietf.org/html/rfc7519
- FastAPI Security documentation
- Better Auth JWT configuration

---

## Decision 2: JWT Verification Strategy - Middleware vs Dependency Injection

**Decision**: Use FastAPI dependency injection for JWT verification

**Rationale**:
- **Granular Control**: Authentication applied per-endpoint, not globally
- **Explicit Dependencies**: Each protected endpoint declares `current_user: User = Depends(get_current_user)`
- **Testability**: Dependencies are easily mocked in unit tests
- **Clarity**: Code clearly shows which endpoints require authentication
- **FastAPI Best Practice**: Recommended pattern in official FastAPI documentation
- **Flexibility**: Public endpoints (signup, signin) don't need special exclusion logic

**Alternatives Considered**:
1. **Global middleware**
   - Rejected: Would require exclusion list for public endpoints (signup, signin)
   - Less explicit about which endpoints are protected
   - Harder to test individual endpoints in isolation

2. **Manual verification in each endpoint**
   - Rejected: Code duplication across all protected endpoints
   - Error-prone (easy to forget verification)
   - Violates DRY principle

**Implementation Pattern**:
```python
# backend/src/api/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/signin")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        # Fetch user from database
        user = await get_user_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
```

**References**:
- FastAPI Security Tutorial: https://fastapi.tiangolo.com/tutorial/security/
- OAuth2 with Password (and hashing), Bearer with JWT tokens

---

## Decision 3: User Identity Source - JWT Claims vs Client Input

**Decision**: Extract user_id from JWT "sub" (subject) claim; never trust client input

**Rationale**:
- **Security**: User ID comes from cryptographically signed token, preventing impersonation
- **Constitutional Requirement**: FR-011 mandates "extract user ID from validated JWT token, not from request body or URL"
- **Standard Compliance**: "sub" claim is JWT standard (RFC 7519) for subject identifier
- **Tamper-Proof**: Signature validation ensures user_id hasn't been modified
- **Better Auth Compatibility**: Better Auth uses "sub" claim for user identifier

**JWT Payload Structure**:
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "iat": 1704672000,
  "exp": 1704758400
}
```

**Alternatives Considered**:
1. **User ID in URL path** (e.g., `/users/{user_id}/tasks`)
   - Rejected: Massive security vulnerability - allows user impersonation
   - Violates FR-011 constitutional requirement
   - Client controls the user_id value

2. **User ID in request body**
   - Rejected: Same security issue as URL path
   - Violates FR-011 constitutional requirement
   - Client-controlled data cannot be trusted

3. **Custom JWT claim name** (e.g., "user_id" instead of "sub")
   - Rejected: "sub" is standard and Better Auth compatible
   - No benefit to using non-standard claim name

**Security Enforcement Pattern**:
```python
@router.get("/tasks/{task_id}")
async def get_task(task_id: int, current_user: User = Depends(get_current_user)):
    # current_user.id comes from JWT "sub" claim, not client
    task = await db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id  # CRITICAL: user isolation
    ).first()
    if not task:
        # Return 404, not 403, to prevent user enumeration
        raise HTTPException(status_code=404, detail="Task not found")
    return task
```

**References**:
- JWT RFC 7519 Section 4.1.2 (sub claim)
- OWASP Top 10 - Broken Access Control

---

## Decision 4: Token Expiration and Error Handling

**Decision**:
- JWT tokens expire after 24 hours
- Return 401 Unauthorized for expired, invalid, or missing tokens
- No token refresh mechanism in initial implementation

**Rationale**:
- **Security**: 24-hour expiry limits exposure window if token is compromised
- **Simplicity**: No refresh token complexity (YAGNI principle)
- **User Experience**: 24 hours is reasonable for todo app (users typically re-login daily)
- **Constitutional Requirement**: FR-009, FR-010, FR-013 mandate 401 responses
- **Consistent Error Messages**: Prevents user enumeration attacks (FR-015)

**Error Response Format**:
```json
{
  "detail": "Could not validate credentials",
  "status_code": 401
}
```

**Alternatives Considered**:
1. **Refresh tokens**
   - Rejected: Out of scope, adds significant complexity
   - Would require refresh token storage (violates stateless requirement)
   - Not needed for MVP

2. **Longer expiry (7 days)**
   - Rejected: Increases security risk if token is compromised
   - Violates security-first principle

3. **Shorter expiry (1 hour)**
   - Rejected: Poor user experience (frequent re-logins)
   - Not justified for todo app threat model

**Token Expiration Handling**:
- Frontend: Detect 401 response, redirect to signin page
- Backend: Validate `exp` claim during JWT verification
- User Experience: Clear message "Your session has expired. Please sign in again."

**References**:
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- OWASP JWT Cheat Sheet

---

## Decision 5: User Data Isolation Strategy

**Decision**: Always filter database queries by authenticated user ID from JWT; ignore any user_id in URL or request body

**Rationale**:
- **Constitutional Requirement**: Principle IV (User Data Isolation and Ownership) mandates complete data isolation
- **Security**: Prevents user impersonation and data leakage
- **Simplicity**: Single source of truth for user identity (JWT claims)
- **Enforcement**: Database queries automatically scoped to authenticated user

**Implementation Pattern**:
```python
# CORRECT: User ID from JWT only
@router.get("/tasks")
async def get_tasks(current_user: User = Depends(get_current_user)):
    tasks = await db.query(Task).filter(Task.user_id == current_user.id).all()
    return tasks

# WRONG: Never trust user_id from client
@router.get("/users/{user_id}/tasks")  # DON'T DO THIS
async def get_tasks_wrong(user_id: int):
    # SECURITY VULNERABILITY: user_id comes from URL, not JWT
    tasks = await db.query(Task).filter(Task.user_id == user_id).all()
    return tasks
```

**Alternatives Considered**:
1. **Trust user_id in URL path**
   - Rejected: Massive security vulnerability
   - Allows any user to access any other user's data

2. **Match URL user_id against JWT user_id**
   - Rejected: Unnecessary complexity
   - Why include user_id in URL if we're going to ignore it?
   - Just use JWT user_id directly

**Error Handling for Cross-User Access**:
- Return 404 Not Found (not 403 Forbidden) to prevent user enumeration
- Consistent error message: "Task not found"
- Never reveal whether task exists but belongs to another user

**References**:
- OWASP Broken Access Control
- OWASP Insecure Direct Object References (IDOR)

---

## Technology Stack Research

### Backend: FastAPI + SQLModel + PyJWT

**FastAPI**:
- Modern Python web framework with automatic OpenAPI documentation
- Native async/await support for high performance
- Excellent dependency injection system for JWT verification
- Type hints and Pydantic validation built-in

**SQLModel**:
- Combines SQLAlchemy and Pydantic
- Type-safe ORM with Python type hints
- Prevents SQL injection through parameterized queries
- Aligns with constitution requirement

**PyJWT / python-jose**:
- Industry-standard JWT library for Python
- Supports RS256, HS256 algorithms
- Handles signature verification and expiration checking

**Dependencies**:
```txt
fastapi>=0.104.0
sqlmodel>=0.0.14
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
uvicorn[standard]>=0.24.0
```

### Frontend: Next.js 16+ + Better Auth

**Next.js 16+ (App Router)**:
- React framework with server-side rendering
- App Router for modern routing patterns
- Built-in API routes (not used - backend is separate)
- TypeScript support

**Better Auth**:
- Modern authentication library for Next.js
- Native JWT token issuance
- Configurable token expiration
- Session management on frontend

**Dependencies**:
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^18.2.0",
    "better-auth": "^1.0.0",
    "axios": "^1.6.0"
  }
}
```

### Database: Neon Serverless PostgreSQL

**Neon**:
- Serverless PostgreSQL with autoscaling
- Connection pooling built-in
- Branching for development environments
- Compatible with standard PostgreSQL drivers

**Connection**:
- Use SQLModel with asyncpg driver
- Connection string from environment variable
- Connection pooling for performance

---

## Security Considerations

### Password Storage
- Better Auth handles password hashing (bcrypt)
- Never store plaintext passwords
- Minimum 8 character requirement (FR-003)

### JWT Secret Management
- BETTER_AUTH_SECRET environment variable
- Minimum 32 characters, randomly generated
- Same secret shared between frontend and backend
- Never commit to version control

### User Enumeration Prevention
- Consistent error messages for invalid credentials (FR-015)
- "Invalid credentials" for both wrong email and wrong password
- 404 (not 403) for cross-user access attempts

### SQL Injection Prevention
- SQLModel ORM with parameterized queries
- No raw SQL queries
- Input validation via Pydantic models

### XSS Prevention
- React automatically escapes output
- No dangerouslySetInnerHTML usage
- Content-Security-Policy headers (future enhancement)

---

## Performance Considerations

### JWT Validation Latency
- Target: <50ms per request (SC-007)
- Optimization: Cache public key if using RS256 (not needed for HS256)
- Optimization: Connection pooling for database user lookup

### Concurrent Request Handling
- Target: 100 concurrent requests (SC-006)
- FastAPI async/await for non-blocking I/O
- Database connection pooling
- Neon autoscaling handles load

### Token Size
- JWT tokens ~200-300 bytes
- Acceptable overhead for Authorization header
- No performance impact for target scale (<1000 users)

---

## Development Environment Setup

### Required Tools
- Python 3.11+
- Node.js 18+
- PostgreSQL client (for Neon connection)
- Git

### Environment Variables
```bash
# Shared secret (same for frontend and backend)
BETTER_AUTH_SECRET=<32+ character random string>

# Backend
DATABASE_URL=postgresql://user:pass@neon.tech/dbname
API_PORT=8000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Local Development
1. Start backend: `uvicorn main:app --reload`
2. Start frontend: `npm run dev`
3. Access frontend: http://localhost:3000
4. Access API docs: http://localhost:8000/docs

---

## Conclusion

All architecture decisions align with constitutional principles:
- ✅ Security-First Design: JWT verification, user isolation, consistent errors
- ✅ Clear Separation of Concerns: Frontend (Better Auth), Backend (FastAPI), Database (Neon)
- ✅ Spec-Driven Development: Following Agentic Dev Stack workflow
- ✅ User Data Isolation: Database queries filtered by JWT user_id
- ✅ Simplicity: Standard JWT pattern, no premature optimization
- ✅ API Contract Enforcement: RESTful endpoints, OpenAPI documentation

Ready to proceed to Phase 1: data-model.md, contracts/, and quickstart.md generation.
