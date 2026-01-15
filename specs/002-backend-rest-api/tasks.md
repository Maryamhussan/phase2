---
description: "Task list for backend REST API & database implementation"
---

# Tasks: Backend REST API & Database for Todo Web Application

**Input**: Design documents from `/specs/002-backend-rest-api/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this implementation as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`
- Backend structure: `backend/src/{models,services,api,core}/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for task management

- [x] T001 Create task model in backend/src/models/task.py with id, user_id, title, description, completed, timestamps
- [x] T002 Create database migration 002_create_tasks_table.sql with tasks table, indexes, foreign key to users
- [x] T003 Apply database migration against Neon PostgreSQL to create tasks table
- [x] T004 [P] Create Pydantic models in backend/src/models/task.py (TaskCreate, TaskUpdate, TaskPublic)
- [x] T005 Create task API router in backend/src/api/tasks.py with FastAPI APIRouter
- [x] T006 Register task router in backend/src/main.py with proper prefix
- [x] T007 Update requirements.txt if any new dependencies are needed
- [x] T008 Verify database connection works with new tasks table

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 [US1] Implement GET /api/tasks endpoint in backend/src/api/tasks.py (return user's tasks)
- [x] T010 [US1] Implement POST /api/tasks endpoint in backend/src/api/tasks.py (create new task)
- [x] T011 [US1] Implement GET /api/tasks/{id} endpoint in backend/src/api/tasks.py (return specific task)
- [x] T012 [US1] Implement PUT /api/tasks/{id} endpoint in backend/src/api/tasks.py (update specific task)
- [x] T013 [US1] Implement DELETE /api/tasks/{id} endpoint in backend/src/api/tasks.py (delete specific task)
- [x] T014 [US1] Add authentication dependency to all task endpoints
- [x] T015 [US1] Add user ID validation to all task endpoints (ensure user can only access own tasks)
- [x] T016 [US1] Add proper HTTP status codes to all task endpoints
- [x] T017 [US1] Add comprehensive error handling to all task endpoints

**Checkpoint**: Core CRUD operations ready - advanced features can now begin

---

## Phase 3: User Story 1 - Task Management (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to create, read, update, and delete their personal tasks.

**Independent Test**: Given I am authenticated with a valid JWT token, when I POST to `/api/tasks` with valid task data, then a new task is created and assigned to my user ID, and when I GET `/api/tasks`, then I receive only tasks that belong to my user ID.

### Implementation for User Story 1

- [x] T018 [P] [US1] Create Task model with proper SQLModel configuration in backend/src/models/task.py
- [x] T019 [P] [US1] Create Pydantic models (TaskCreate, TaskUpdate, TaskPublic) in backend/src/models/task.py
- [x] T020 [US1] Implement GET /api/tasks endpoint with user filtering in backend/src/api/tasks.py
- [x] T021 [US1] Implement POST /api/tasks endpoint with user assignment in backend/src/api/tasks.py
- [x] T022 [US1] Implement GET /api/tasks/{id} endpoint with user validation in backend/src/api/tasks.py
- [x] T023 [US1] Implement PUT /api/tasks/{id} endpoint with user validation in backend/src/api/tasks.py
- [x] T024 [US1] Implement DELETE /api/tasks/{id} endpoint with user validation in backend/src/api/tasks.py
- [x] T025 [US1] Add authentication validation to all endpoints using existing JWT utilities
- [x] T026 [US1] Add proper response models and status codes to all endpoints

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Task Organization (Priority: P2)

**Goal**: Allow authenticated users to organize their tasks with titles, descriptions, and completion status.

**Independent Test**: Given I am authenticated with a valid JWT token, when I create a task with title, description, and completion status, then the task is stored with all provided attributes, and when I update a task's completion status, then the change is persisted and returned in subsequent queries.

### Implementation for User Story 2

- [x] T027 [P] [US2] Add title validation to Task model (min 1, max 255 chars) in backend/src/models/task.py
- [x] T028 [P] [US2] Add description validation to Task model (optional, max 1000 chars) in backend/src/models/task.py
- [x] T029 [US2] Add completion status validation to Task model in backend/src/models/task.py
- [x] T030 [US2] Update POST /api/tasks endpoint to validate task attributes in backend/src/api/tasks.py
- [x] T031 [US2] Update PUT /api/tasks/{id} endpoint to validate task updates in backend/src/api/tasks.py
- [x] T032 [US2] Add attribute validation to Pydantic models (TaskCreate, TaskUpdate) in backend/src/models/task.py
- [x] T033 [US2] Test task attribute persistence and retrieval functionality

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Secure Access Control (Priority: P3)

**Goal**: Ensure that users can only access their own tasks so that data privacy and security are maintained.

**Independent Test**: Given I am authenticated with a valid JWT token, when I attempt to access another user's task via GET `/api/tasks/{id}`, then I receive a 404 Not Found response, and when I attempt to access any task endpoint without a valid JWT token, then I receive a 401 Unauthorized response.

### Implementation for User Story 3

- [x] T034 [US3] Implement user ID filtering in all GET queries (user isolation) in backend/src/api/tasks.py
- [x] T035 [US3] Implement user ID validation in all UPDATE operations in backend/src/api/tasks.py
- [x] T036 [US3] Implement user ID validation in all DELETE operations in backend/src/api/tasks.py
- [x] T037 [US3] Ensure all unauthorized access attempts return 404 instead of 403 in backend/src/api/tasks.py
- [x] T038 [US3] Add comprehensive JWT token validation to all endpoints in backend/src/api/tasks.py
- [x] T039 [US3] Test cross-user access prevention with multiple user accounts
- [x] T040 [US3] Test authentication enforcement without valid tokens

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T041 [P] Update API documentation with new task endpoints in backend/src/main.py
- [x] T042 [P] Add comprehensive error responses following consistent format in backend/src/api/tasks.py
- [x] T043 [P] Add database indexes for improved performance (user_id, user_id+completed) in migration script
- [x] T044 Add database constraints for data integrity (title length, etc.) in migration script
- [x] T045 Verify OpenAPI documentation includes all task endpoints
- [x] T046 Add logging for task operations (create, read, update, delete) in backend/src/api/tasks.py
- [x] T047 Verify all error responses follow consistent format (detail, status_code)
- [x] T048 Verify user enumeration is prevented (consistent 404 responses)
- [x] T049 Run quickstart.md validation (verify all setup steps work)

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 components but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1/US2 but should be independently testable

### Within Each User Story

- Models before services (if any)
- Services before endpoints (if any)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T004: Pydantic models can be developed in parallel with API endpoints
- T018-T019: Model and Pydantic model creation can run in parallel
- T027-T029: Attribute validations can be implemented in parallel
- T034-T036: Security validations can be implemented in parallel
- T041-T042: Documentation updates can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch model and Pydantic model creation together:
Task T018: Create Task model with proper SQLModel configuration in backend/src/models/task.py
Task T019: Create Pydantic models (TaskCreate, TaskUpdate, TaskPublic) in backend/src/models/task.py

# Launch all endpoints together after models are ready:
Task T020: Implement GET /api/tasks endpoint with user filtering in backend/src/api/tasks.py
Task T021: Implement POST /api/tasks endpoint with user assignment in backend/src/api/tasks.py
Task T022: Implement GET /api/tasks/{id} endpoint with user validation in backend/src/api/tasks.py
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T17) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T018-T026)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (T018-T026) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (T027-T033) → Test independently → Deploy/Demo
4. Add User Story 3 (T034-T040) → Test independently → Deploy/Demo
5. Add Polish (T041-T049) → Final validation → Production ready
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T17)
2. Once Foundational is done:
   - Developer A: User Story 1 (T018-T026)
   - Developer B: User Story 2 (T027-T033)
   - Developer C: User Story 3 (T034-T040)
3. Stories complete and integrate independently

---

## Notes

- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests were NOT included as they were not explicitly requested in the specification
- Security review should be performed by auth-engineer agent after implementation
- API standards review should be performed by api-standards-reviewer agent after backend implementation
- Database review should be performed by db-logging-specialist agent after database implementation