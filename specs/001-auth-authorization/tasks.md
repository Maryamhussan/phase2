---
description: "Task list for authentication & authorization implementation"
---

# Tasks: Authentication & Authorization for Todo Web Application

**Input**: Design documents from `/specs/001-auth-authorization/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this implementation as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Backend structure: `backend/src/{models,services,api,core}/`
- Frontend structure: `frontend/src/{app,components,lib}/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure (backend/src/{models,services,api,core}/, backend/tests/)
- [x] T002 Create frontend directory structure using Next.js 16+ with App Router
- [x] T003 [P] Create backend requirements.txt with FastAPI, SQLModel, PyJWT, python-jose, passlib, uvicorn
- [x] T004 [P] Create frontend package.json with Next.js 16+, Better Auth, axios dependencies
- [x] T005 [P] Create backend/.env.example with BETTER_AUTH_SECRET, DATABASE_URL, API_PORT
- [x] T006 [P] Create frontend/.env.local.example with BETTER_AUTH_SECRET, NEXT_PUBLIC_API_URL
- [x] T007 Generate BETTER_AUTH_SECRET (32+ character random string) and configure in both .env files
- [x] T008 Configure Neon PostgreSQL connection string in backend/.env
- [x] T009 Install backend dependencies (pip install -r requirements.txt in virtual environment)
- [x] T010 Install frontend dependencies (npm install)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 [P] Create User model in backend/src/models/user.py with UUID, email, hashed_password, timestamps
- [x] T012 [P] Create database migration 001_create_users_table.sql with users table, indexes, triggers
- [x] T013 Run database migration against Neon PostgreSQL to create users table
- [x] T014 [P] Create JWT utilities in backend/src/core/security.py (create_access_token, verify_token, hash_password, verify_password)
- [x] T015 [P] Create config module in backend/src/core/config.py to load environment variables
- [x] T016 Create OAuth2PasswordBearer scheme in backend/src/api/dependencies.py
- [x] T017 Implement get_current_user dependency in backend/src/api/dependencies.py (JWT verification, user extraction)
- [x] T018 Create FastAPI app in backend/src/main.py with CORS middleware and router registration
- [x] T019 [P] Create Pydantic models in backend/src/models/user.py (SignupRequest, SigninRequest, AuthResponse, UserPublic)
- [x] T020 [P] Create Better Auth configuration in frontend/src/lib/auth.ts with JWT issuance settings

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Account Creation (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts with email and password, receive JWT token

**Independent Test**: Submit valid signup credentials, verify account created and JWT token received

### Implementation for User Story 1

- [x] T021 [P] [US1] Create auth router in backend/src/api/auth.py with FastAPI APIRouter
- [x] T022 [US1] Implement POST /auth/signup endpoint in backend/src/api/auth.py (validate email, check uniqueness, hash password, create user, return JWT)
- [x] T023 [US1] Add email validation logic in POST /auth/signup (EmailStr validation, duplicate check)
- [x] T024 [US1] Add password validation logic in POST /auth/signup (minimum 8 characters)
- [x] T025 [US1] Implement consistent error responses in POST /auth/signup (400 for validation, 409 for duplicate email)
- [x] T026 [P] [US1] Create signup page in frontend/src/app/signup/page.tsx
- [x] T027 [P] [US1] Create SignupForm component in frontend/src/components/auth/SignupForm.tsx with email and password fields
- [x] T028 [US1] Add client-side validation to SignupForm (email format, password length)
- [x] T029 [US1] Implement signup form submission in SignupForm.tsx (call POST /auth/signup, store JWT token)
- [x] T030 [P] [US1] Create API client in frontend/src/lib/api-client.ts with axios and JWT token injection
- [x] T031 [US1] Implement JWT token storage in frontend (localStorage or sessionStorage)
- [x] T032 [US1] Add redirect to dashboard after successful signup

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - User Sign In (Priority: P2)

**Goal**: Enable existing users to sign in with email and password, receive JWT token

**Independent Test**: Sign in with valid credentials, verify JWT token issued and stored

### Implementation for User Story 2

- [x] T033 [US2] Implement POST /auth/signin endpoint in backend/src/api/auth.py (validate credentials, return JWT)
- [x] T034 [US2] Add password verification logic in POST /auth/signin (compare hashed password)
- [x] T035 [US2] Implement consistent error messages in POST /auth/signin (same message for wrong email and wrong password)
- [x] T036 [US2] Add 401 Unauthorized response for invalid credentials
- [x] T037 [P] [US2] Create signin page in frontend/src/app/signin/page.tsx
- [x] T038 [P] [US2] Create SigninForm component in frontend/src/components/auth/SigninForm.tsx with email and password fields
- [x] T039 [US2] Implement signin form submission in SigninForm.tsx (call POST /auth/signin, store JWT token)
- [x] T040 [US2] Add redirect to dashboard after successful signin
- [x] T041 [US2] Implement token persistence (user remains signed in after browser close if token valid)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Protected Resource Access (Priority: P3)

**Goal**: Validate JWT tokens on protected endpoints, enforce user data isolation

**Independent Test**: Make API requests with valid/invalid tokens, verify only authenticated user's data returned

### Implementation for User Story 3

- [x] T042 [US3] Implement GET /auth/me endpoint in backend/src/api/auth.py (return current user info)
- [x] T043 [US3] Add get_current_user dependency to GET /auth/me endpoint
- [x] T044 [US3] Test GET /auth/me returns 401 for missing token
- [x] T045 [US3] Test GET /auth/me returns 401 for invalid token
- [x] T046 [US3] Test GET /auth/me returns 401 for expired token
- [x] T047 [P] [US3] Create example protected endpoint GET /tasks in backend/src/api/tasks.py
- [x] T048 [US3] Implement user_id filtering in GET /tasks (filter by current_user.id from JWT)
- [x] T049 [US3] Create example protected endpoint GET /tasks/{task_id} in backend/src/api/tasks.py
- [x] T050 [US3] Implement user isolation in GET /tasks/{task_id} (return 404 if task.user_id != current_user.id)
- [x] T051 [US3] Test cross-user access attempt returns 404 (not 403 to prevent enumeration)
- [x] T052 [P] [US3] Update API client in frontend/src/lib/api-client.ts to include Authorization header with JWT token
- [x] T053 [US3] Test API client automatically includes Bearer token in all requests

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T054 [P] Create backend README.md with setup instructions and API documentation
- [x] T055 [P] Create frontend README.md with setup instructions and development guide
- [x] T056 [P] Create root .env.example with shared BETTER_AUTH_SECRET documentation
- [x] T057 Verify OpenAPI documentation is auto-generated at http://localhost:8000/docs
- [x] T058 Add logging for authentication events (signup, signin, token validation failures)
- [x] T059 Verify all error responses follow consistent format (detail, status_code)
- [x] T060 Verify JWT token expiration is set to 24 hours
- [x] T061 Verify passwords are hashed with bcrypt (never plaintext in database)
- [x] T062 Verify email uniqueness constraint is enforced (case-insensitive)
- [x] T063 Verify user enumeration is prevented (consistent error messages)
- [x] T064 Run quickstart.md validation (verify all setup steps work)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (but typically done after for logical flow)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 (but requires auth to test, so typically done last)

### Within Each User Story

- Backend endpoints before frontend components (API must exist before UI can call it)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T006)
- All Foundational tasks marked [P] can run in parallel within Phase 2 (T011-T012, T014-T015, T019-T020)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each story, tasks marked [P] can run in parallel (frontend and backend work simultaneously)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch backend and frontend work for User Story 1 together:
Task T022-T025: Backend POST /auth/signup implementation
Task T026-T029: Frontend SignupForm component (can work in parallel with backend)

# After both complete:
Task T030-T032: Integration (API client, token storage, redirect)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T020) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T021-T032)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (T021-T032) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (T033-T041) → Test independently → Deploy/Demo
4. Add User Story 3 (T042-T053) → Test independently → Deploy/Demo
5. Add Polish (T054-T064) → Final validation → Production ready
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T020)
2. Once Foundational is done:
   - Developer A: User Story 1 (T021-T032)
   - Developer B: User Story 2 (T033-T041)
   - Developer C: User Story 3 (T042-T053)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests were NOT included as they were not explicitly requested in the specification
- Security review should be performed by auth-engineer agent after implementation
- API standards review should be performed by api-standards-reviewer agent after backend implementation
- Frontend review should be performed by nextjs-frontend-reviewer agent after frontend implementation
- Database review should be performed by db-logging-specialist agent after database implementation
