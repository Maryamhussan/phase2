# Implementation Plan: Authentication & Authorization

**Branch**: `001-auth-authorization` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-auth-authorization/spec.md`

**Note**: This plan follows the Agentic Dev Stack workflow: spec → plan → tasks → implement

## Summary

Implement secure authentication and authorization for the multi-user todo web application using Better Auth (frontend) and JWT token validation (backend). Users will sign up and sign in through the Next.js frontend, receiving JWT tokens that are validated by the FastAPI backend on every protected request. The system enforces strict user data isolation, ensuring each user can only access their own tasks.

**Key Technical Approach**:
- Frontend: Better Auth library handles signup/signin and JWT token issuance
- Backend: FastAPI dependency injection validates JWT tokens and extracts user identity
- Security: Stateless JWT-based authentication with shared secret (BETTER_AUTH_SECRET)
- Data Isolation: All database queries filtered by authenticated user ID from JWT claims

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/JavaScript (frontend with Next.js 16+)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, PyJWT, python-jose, passlib
- Frontend: Next.js 16+ (App Router), Better Auth, React
**Storage**: Neon Serverless PostgreSQL (user accounts and authentication data)
**Testing**: pytest (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web application (browser client + server API)
**Project Type**: Web application (frontend + backend separation)
**Performance Goals**:
- JWT validation: <50ms per request
- Signup completion: <30 seconds
- Signin completion: <15 seconds
- Support 100 concurrent authentication requests
**Constraints**:
- Stateless authentication only (no backend sessions)
- JWT tokens expire after 24 hours
- Shared secret via BETTER_AUTH_SECRET environment variable
- User ID must be extracted from JWT, never from client input
**Scale/Scope**: Multi-user application, foundational authentication for all future features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Security-First Full-Stack Design ✅ PASS

**Compliance**:
- ✅ Authentication enforced on every protected endpoint (FR-008, FR-013)
- ✅ JWT tokens verified before processing requests (FR-008, FR-009, FR-010)
- ✅ User ID extracted from token, not client input (FR-011)
- ✅ Database queries filtered by authenticated user ID (FR-012)
- ✅ Secrets in environment variables only (FR-018: BETTER_AUTH_SECRET)
- ✅ SQL injection prevented via SQLModel ORM (constitution requirement)
- ✅ Consistent error messages prevent user enumeration (FR-015)

**Rationale**: This feature IS the security foundation. Every requirement explicitly addresses security concerns.

### Principle II: Clear Separation of Concerns ✅ PASS

**Compliance**:
- ✅ Frontend (Next.js + Better Auth): UI, signup/signin forms, JWT storage
- ✅ Backend (FastAPI): JWT validation, user data access, business logic
- ✅ Database (Neon PostgreSQL): User account persistence
- ✅ No direct database access from frontend
- ✅ No UI rendering in backend
- ✅ Communication via RESTful API contracts only

**Rationale**: Architecture explicitly separates authentication concerns across layers.

### Principle III: Spec-Driven Development ✅ PASS

**Compliance**:
- ✅ spec.md created with user stories and acceptance criteria
- ✅ plan.md (this file) documents architecture decisions
- ✅ tasks.md will be generated next via /sp.tasks
- ✅ Following Agentic Dev Stack workflow
- ✅ No manual coding - all via Claude Code

**Rationale**: Currently in planning phase of the mandated workflow.

### Principle IV: User Data Isolation and Ownership ✅ PASS

**Compliance**:
- ✅ All task data scoped to authenticated user (FR-012, FR-014)
- ✅ Database queries include user_id filter (FR-012)
- ✅ API responses never leak other users' data (FR-014, SC-005: 0% leakage)
- ✅ User enumeration prevented (FR-015)
- ✅ User Story 3 explicitly tests data isolation

**Rationale**: User isolation is a core functional requirement of this feature.

### Principle V: Simplicity and Student-Friendly Design ✅ PASS

**Compliance**:
- ✅ Standard JWT pattern (industry-standard approach)
- ✅ RESTful API conventions (constitution requirement)
- ✅ No premature optimization (basic auth only, no OAuth/2FA/RBAC)
- ✅ Clear naming and standard patterns
- ✅ YAGNI: Out of Scope section excludes 13 unnecessary features

**Rationale**: Design uses proven patterns without unnecessary complexity.

### Principle VI: API Contract Enforcement ✅ PASS

**Compliance**:
- ✅ RESTful endpoints planned (signup, signin, protected resources)
- ✅ Request/response schemas will be defined in contracts/
- ✅ OpenAPI/Swagger documentation (FastAPI auto-generates)
- ✅ Consistent error responses (401 Unauthorized, proper status codes)
- ✅ Phase 1 will generate explicit API contracts

**Rationale**: API-first design with explicit contracts planned for Phase 1.

### Constitution Check Result: ✅ ALL GATES PASSED

No violations detected. Feature aligns perfectly with all six constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-authorization/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   ├── auth-api.yaml    # Authentication endpoints OpenAPI spec
│   └── schemas.yaml     # Request/response schemas
├── checklists/
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)

backend/
├── src/
│   ├── models/
│   │   └── user.py              # User entity (SQLModel)
│   ├── services/
│   │   └── auth_service.py      # Authentication business logic
│   ├── api/
│   │   ├── dependencies.py      # JWT validation dependency
│   │   ├── auth.py              # Auth endpoints (signup, signin)
│   │   └── tasks.py             # Protected task endpoints (future)
│   ├── core/
│   │   ├── config.py            # Environment config
│   │   └── security.py          # JWT utilities
│   └── main.py                  # FastAPI app entry point
├── tests/
│   ├── test_auth.py             # Auth endpoint tests
│   ├── test_jwt.py              # JWT validation tests
│   └── test_user_isolation.py  # Data isolation tests
├── .env.example                 # Environment variables template
├── requirements.txt             # Python dependencies
└── README.md                    # Backend setup instructions

frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── signup/
│   │   │   │   └── page.tsx     # Signup page
│   │   │   └── signin/
│   │   │       └── page.tsx     # Signin page
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignupForm.tsx   # Signup form component
│   │   │   └── SigninForm.tsx   # Signin form component
│   │   └── ui/                  # Shared UI components
│   ├── lib/
│   │   ├── auth.ts              # Better Auth configuration
│   │   └── api-client.ts        # API client with JWT injection
│   └── types/
│       └── auth.ts              # TypeScript types for auth
├── tests/
│   └── auth.test.tsx            # Auth component tests
├── .env.local.example           # Frontend environment variables
├── package.json                 # Node dependencies
└── README.md                    # Frontend setup instructions

.env.example                     # Root environment variables (shared secret)
docker-compose.yml               # Local development setup (optional)
README.md                        # Project overview and setup
```

**Structure Decision**: Selected Web application structure (Option 2) because the feature requires both Next.js frontend and FastAPI backend with clear separation. Frontend handles authentication UI and JWT storage, backend handles validation and data access. This aligns with Constitution Principle II (Clear Separation of Concerns).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. This section is intentionally empty as all constitutional principles are satisfied.

## Architecture Decisions

### Decision 1: JWT vs Session-Based Authentication

**Decision**: Use JWT (JSON Web Token) stateless authentication

**Rationale**:
- **Stateless**: Backend doesn't store session data, aligning with constitution requirement
- **Scalability**: No session storage means easier horizontal scaling
- **Simplicity**: Single shared secret (BETTER_AUTH_SECRET) for signing and verification
- **Frontend-Backend Decoupling**: JWT can be verified independently by any service
- **Constitution Compliance**: Explicitly required by Technology Stack Constraints

**Alternatives Considered**:
- Session-based auth with cookies: Rejected because constitution mandates "No backend session storage (stateless auth only)"
- OAuth2 with external provider: Out of scope per spec.md requirements

**Trade-offs**:
- ✅ Pro: Stateless, scalable, simple secret management
- ✅ Pro: Better Auth library handles JWT issuance on frontend
- ⚠️ Con: Cannot revoke tokens before expiration (mitigated by 24-hour expiry)
- ⚠️ Con: Token size larger than session ID (acceptable for <100 concurrent users)

### Decision 2: JWT Verification Location (Middleware vs Dependency)

**Decision**: Use FastAPI dependency injection for JWT verification

**Rationale**:
- **Granular Control**: Apply authentication per-endpoint, not globally
- **Explicit Dependencies**: Each protected endpoint declares `current_user: User = Depends(get_current_user)`
- **Testability**: Easy to mock dependencies in tests
- **Clarity**: Clear which endpoints require authentication
- **FastAPI Best Practice**: Recommended pattern in FastAPI documentation

**Alternatives Considered**:
- Global middleware: Rejected because some endpoints (signup, signin) must be public
- Manual verification in each endpoint: Rejected due to code duplication and error-prone

**Implementation**:
```python
# backend/src/api/dependencies.py
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # Verify JWT signature, expiration
    # Extract user_id from claims
    # Return User object
```

### Decision 3: User Identity Derivation from JWT

**Decision**: Extract user_id from JWT "sub" (subject) claim, validate signature first

**Rationale**:
- **Security**: User ID comes from cryptographically signed token, not client input
- **Standard**: "sub" claim is JWT standard for subject identifier
- **Constitution Compliance**: FR-011 mandates "extract user ID from validated JWT token, not from request body or URL"
- **Tamper-Proof**: Signature validation ensures user_id hasn't been modified

**JWT Payload Structure**:
```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "iat": 1704672000,
  "exp": 1704758400
}
```

**Alternatives Considered**:
- User ID in URL path: Rejected - violates FR-011, allows impersonation
- User ID in request body: Rejected - violates FR-011, client-controlled
- Custom claim name: Rejected - "sub" is standard and Better Auth compatible

### Decision 4: Token Expiry and Invalid Token Handling

**Decision**:
- Tokens expire after 24 hours (configurable via Better Auth)
- Return 401 Unauthorized for expired/invalid/missing tokens
- No token refresh mechanism in initial implementation

**Rationale**:
- **Security**: 24-hour expiry limits exposure if token is compromised
- **Simplicity**: No refresh token complexity (YAGNI principle)
- **User Experience**: 24 hours is reasonable for a todo app (users re-login daily)
- **Constitution Compliance**: FR-009, FR-010, FR-013 mandate 401 responses

**Error Response Format**:
```json
{
  "detail": "Could not validate credentials",
  "status_code": 401
}
```

**Alternatives Considered**:
- Refresh tokens: Out of scope (adds complexity, not in requirements)
- Longer expiry (7 days): Rejected - increases security risk
- Shorter expiry (1 hour): Rejected - poor UX for todo app use case

### Decision 5: JWT User ID Matching Strategy

**Decision**: Always use user_id from JWT claims, ignore any user_id in URL/body

**Rationale**:
- **Security**: Prevents user impersonation attacks
- **Constitution Compliance**: FR-011, FR-012, FR-014 mandate this approach
- **Implementation**: Database queries always filter by `user_id = current_user.id`

**Example Endpoint Pattern**:
```python
@router.get("/tasks")
async def get_tasks(current_user: User = Depends(get_current_user)):
    # current_user.id comes from JWT, not client
    tasks = await db.query(Task).filter(Task.user_id == current_user.id).all()
    return tasks

@router.get("/tasks/{task_id}")
async def get_task(task_id: int, current_user: User = Depends(get_current_user)):
    task = await db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id  # CRITICAL: user isolation
    ).first()
    if not task:
        raise HTTPException(status_code=404)  # 404, not 403, to prevent enumeration
    return task
```

**Alternatives Considered**:
- Trust user_id in URL: Rejected - massive security vulnerability
- Match URL user_id against JWT user_id: Rejected - unnecessary complexity, just use JWT

## Testing Strategy

### Validation Against Success Criteria

**SC-001: Users can complete account creation in under 30 seconds**
- Test: Measure time from form submission to JWT receipt
- Method: Frontend integration test with timer
- Pass Criteria: 95th percentile < 30 seconds

**SC-002: Users can sign in in under 15 seconds**
- Test: Measure time from signin submission to JWT receipt
- Method: Frontend integration test with timer
- Pass Criteria: 95th percentile < 15 seconds

**SC-003: 100% of API requests with valid JWT tokens are successfully authenticated**
- Test: Send 100 requests with valid tokens to protected endpoints
- Method: Backend integration test
- Pass Criteria: All 100 requests return 200 OK (not 401)

**SC-004: 100% of API requests without valid JWT tokens are rejected with 401**
- Test: Send requests without token, with expired token, with tampered token
- Method: Backend integration test
- Pass Criteria: All return 401 Unauthorized

**SC-005: 100% of attempts to access another user's data are blocked (0% data leakage)**
- Test: User A tries to access User B's task by ID
- Method: Backend integration test with two test users
- Pass Criteria: Returns 404 Not Found (not 403, to prevent enumeration)

**SC-006: Authentication flow handles 100 concurrent signup/signin requests**
- Test: Concurrent load test with 100 simultaneous requests
- Method: pytest with asyncio or locust load testing
- Pass Criteria: All requests complete without errors

**SC-007: JWT token validation adds less than 50ms latency**
- Test: Measure time for JWT verification in dependency
- Method: Backend unit test with timing
- Pass Criteria: Average < 50ms, 95th percentile < 75ms

**SC-008: 95% of users successfully complete signup on first attempt**
- Test: Submit valid signup forms, measure success rate
- Method: Frontend integration test with various valid inputs
- Pass Criteria: Success rate ≥ 95%

### Test Categories

**Unit Tests** (backend/tests/):
- JWT signature verification
- Token expiration validation
- User model validation
- Password hashing (via Better Auth)

**Integration Tests** (backend/tests/):
- Signup endpoint creates user and returns JWT
- Signin endpoint validates credentials and returns JWT
- Protected endpoints reject invalid tokens
- User isolation: User A cannot access User B's data

**Contract Tests** (backend/tests/):
- API responses match OpenAPI schema
- Error responses follow consistent format
- JWT payload structure matches specification

**Frontend Tests** (frontend/tests/):
- Signup form validation
- Signin form validation
- JWT storage and retrieval
- API client includes Authorization header

## Implementation Phases

### Phase 0: Research & Architecture (Completed in this plan)
- ✅ JWT vs session decision
- ✅ Verification location decision
- ✅ User identity derivation strategy
- ✅ Token expiry handling
- ✅ User ID matching strategy

### Phase 1: Foundation Setup
**Goal**: Set up project structure and shared configuration

**Tasks**:
1. Initialize backend FastAPI project structure
2. Initialize frontend Next.js 16+ project with App Router
3. Configure BETTER_AUTH_SECRET in .env files
4. Set up Neon PostgreSQL connection
5. Install dependencies (FastAPI, SQLModel, PyJWT, Better Auth)

**Deliverables**:
- Backend and frontend project scaffolding
- Environment configuration
- Database connection established

### Phase 2: User Model & Database
**Goal**: Create User entity and database schema

**Tasks**:
1. Define User model with SQLModel (id, email, hashed_password, created_at)
2. Create database migration for users table
3. Implement email uniqueness constraint
4. Add indexes for email lookups

**Deliverables**:
- backend/src/models/user.py
- Database schema with users table

### Phase 3: Backend JWT Utilities
**Goal**: Implement JWT verification and user extraction

**Tasks**:
1. Create JWT verification utility (verify signature, check expiration)
2. Implement get_current_user dependency
3. Create security utilities (password hashing via passlib)
4. Configure FastAPI security scheme (OAuth2PasswordBearer)

**Deliverables**:
- backend/src/core/security.py
- backend/src/api/dependencies.py

### Phase 4: Backend Authentication Endpoints
**Goal**: Implement signup and signin API endpoints

**Tasks**:
1. POST /auth/signup - Create user, return JWT
2. POST /auth/signin - Validate credentials, return JWT
3. Implement consistent error responses
4. Add request validation (email format, password length)

**Deliverables**:
- backend/src/api/auth.py
- OpenAPI documentation auto-generated

### Phase 5: Frontend Better Auth Integration
**Goal**: Set up Better Auth and authentication UI

**Tasks**:
1. Configure Better Auth with JWT issuance
2. Create signup form component
3. Create signin form component
4. Implement JWT storage (localStorage or sessionStorage)
5. Create API client with Authorization header injection

**Deliverables**:
- frontend/src/lib/auth.ts
- frontend/src/components/auth/SignupForm.tsx
- frontend/src/components/auth/SigninForm.tsx
- frontend/src/lib/api-client.ts

### Phase 6: User Isolation Enforcement
**Goal**: Ensure all queries filter by authenticated user

**Tasks**:
1. Create example protected endpoint (GET /tasks)
2. Implement user_id filtering in database queries
3. Test cross-user access attempts (should return 404)
4. Add logging for authentication events

**Deliverables**:
- backend/src/api/tasks.py (example protected endpoint)
- User isolation verified

### Phase 7: Testing & Validation
**Goal**: Validate all success criteria

**Tasks**:
1. Write unit tests for JWT verification
2. Write integration tests for signup/signin
3. Write integration tests for user isolation
4. Perform load testing (100 concurrent requests)
5. Measure JWT validation latency

**Deliverables**:
- backend/tests/test_auth.py
- backend/tests/test_jwt.py
- backend/tests/test_user_isolation.py
- Test coverage report

### Phase 8: Documentation & Hardening
**Goal**: Finalize documentation and security review

**Tasks**:
1. Generate OpenAPI documentation
2. Write quickstart.md for local development
3. Create .env.example files
4. Security review (auth-engineer agent)
5. Update README files

**Deliverables**:
- specs/001-auth-authorization/quickstart.md
- .env.example files
- Security review completed

## Next Steps

1. **Generate Phase 0 artifacts**: research.md (architecture decisions documented above)
2. **Generate Phase 1 artifacts**: data-model.md, contracts/, quickstart.md
3. **Run /sp.tasks**: Generate tasks.md organized by user story
4. **Run /sp.implement**: Execute tasks with specialized agents
5. **Security Review**: Invoke auth-engineer agent after implementation

## Notes

- This plan follows the Agentic Dev Stack workflow mandated by the constitution
- All architecture decisions align with constitutional principles
- Implementation will use specialized agents (auth-engineer, api-standards-reviewer, db-logging-specialist, nextjs-frontend-reviewer)
- Security is the primary concern throughout all phases
- User data isolation is enforced at every layer (frontend, backend, database)
