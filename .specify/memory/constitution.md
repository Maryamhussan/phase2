<!--
Sync Impact Report:
- Version: NEW → 1.0.0 (Initial constitution for Phase II project)
- Ratification: 2026-01-08
- Modified Principles: N/A (new constitution)
- Added Sections: All (initial creation)
- Removed Sections: None
- Templates Status:
  ✅ plan-template.md - Constitution Check section aligns with principles
  ✅ spec-template.md - User story prioritization aligns with spec-driven approach
  ✅ tasks-template.md - Phase organization aligns with incremental development
- Follow-up TODOs: None
-->

# Phase II – Todo Full-Stack Web Application Constitution

## Core Principles

### I. Security-First Full-Stack Design

Security is the foundation of this multi-user application. Every component MUST be designed with security as the primary consideration, not an afterthought.

**Non-Negotiable Rules**:
- Authentication MUST be enforced on every protected endpoint
- JWT tokens MUST be verified before processing any user-specific request
- User ID from token MUST match user ID in request URL/body
- All database queries MUST filter by authenticated user ID
- Secrets MUST NEVER be hardcoded; use environment variables only
- SQL injection MUST be prevented through parameterized queries/ORM
- XSS protection MUST be implemented on all user input

**Rationale**: Multi-user applications require strict security boundaries. A single security flaw can expose all users' data. Security-first design prevents vulnerabilities rather than patching them later.

### II. Clear Separation of Concerns

Frontend, backend, and database MUST remain strictly separated with well-defined boundaries.

**Non-Negotiable Rules**:
- Frontend (Next.js) handles UI/UX and client-side state only
- Backend (FastAPI) handles business logic, validation, and data access
- Database (Neon PostgreSQL) handles data persistence only
- Frontend MUST NOT directly access the database
- Backend MUST NOT contain UI rendering logic
- Each layer communicates only through defined interfaces

**Rationale**: Separation enables independent development, testing, and scaling. It prevents tight coupling that makes the codebase brittle and hard to maintain.

### III. Spec-Driven Development (NON-NEGOTIABLE)

All features MUST be specified before implementation. No coding without a spec.

**Non-Negotiable Rules**:
- Every feature MUST have a spec.md with user stories and acceptance criteria
- Every feature MUST have a plan.md with architecture decisions
- Every feature MUST have a tasks.md with concrete implementation steps
- Implementation MUST follow the Agentic Dev Stack workflow: spec → plan → tasks → implement
- No manual coding allowed; all development through Claude Code
- Changes to requirements MUST update the spec first, then implementation

**Rationale**: Spec-driven development ensures shared understanding, reduces rework, and creates documentation as a natural byproduct. It prevents scope creep and misaligned expectations.

### IV. User Data Isolation and Ownership

Each user's data MUST be completely isolated. Users MUST only access their own data.

**Non-Negotiable Rules**:
- All task data MUST be scoped to the authenticated user
- Database queries MUST include user_id filter on all user-specific tables
- API responses MUST NEVER leak data from other users
- User enumeration attacks MUST be prevented (consistent error messages)
- Audit logs MUST track which user performed which action
- Data deletion MUST cascade properly to maintain referential integrity

**Rationale**: Data isolation is fundamental to multi-user trust. A single data leak can compromise the entire application's credibility and violate user privacy.

### V. Simplicity and Student-Friendly Design

Code MUST be simple, clear, and suitable for student-level understanding.

**Non-Negotiable Rules**:
- Prefer simple solutions over clever ones
- Avoid premature optimization
- Use standard patterns and conventions (RESTful APIs, standard HTTP status codes)
- Code MUST be self-documenting with clear naming
- Complex logic MUST include explanatory comments
- Architecture MUST be straightforward without unnecessary abstractions
- YAGNI principle: implement only what's needed now

**Rationale**: This is a learning project. Complexity hinders understanding and maintenance. Simple code is easier to debug, extend, and learn from.

### VI. API Contract Enforcement

Frontend and backend MUST communicate exclusively through well-defined API contracts.

**Non-Negotiable Rules**:
- All API endpoints MUST be RESTful and follow standard conventions
- Request/response schemas MUST be explicitly defined
- API documentation MUST be auto-generated (OpenAPI/Swagger)
- Breaking changes MUST be versioned
- Error responses MUST follow consistent format with proper HTTP status codes
- API contracts MUST be validated on both sides (request validation, response typing)

**Rationale**: Explicit contracts enable independent frontend/backend development, prevent integration bugs, and serve as living documentation.

## Technology Stack Constraints

**Mandatory Technologies**:
- **Frontend**: Next.js 16+ with App Router (no Pages Router)
- **Backend**: Python FastAPI (no Flask, Django, or other frameworks)
- **ORM**: SQLModel (no raw SQL, no other ORMs)
- **Database**: Neon Serverless PostgreSQL (no other databases)
- **Authentication**: Better Auth with JWT tokens (no custom auth)

**Authentication Architecture**:
- JWT secret MUST be shared via `BETTER_AUTH_SECRET` environment variable
- No backend session storage (stateless authentication only)
- JWT tokens issued by Better Auth on frontend
- Backend verifies JWT signature using shared secret
- Token payload contains user ID, email, and claims

**Environment Configuration**:
- All secrets MUST be in `.env` files (never committed)
- `.env.example` MUST document all required variables
- Different environments (dev, staging, prod) MUST use separate configs

**Rationale**: Standardizing the stack reduces decision fatigue, ensures consistency, and leverages proven technologies suitable for the project scale.

## Development Workflow

**Agentic Dev Stack Process** (MANDATORY):

1. **Specification Phase** (`/sp.specify`):
   - Write spec.md with user stories, priorities, and acceptance criteria
   - Define functional requirements and success criteria
   - Identify key entities and edge cases

2. **Planning Phase** (`/sp.plan`):
   - Generate plan.md with architecture decisions
   - Document technical context and constraints
   - Create research.md, data-model.md, contracts/, quickstart.md
   - Pass Constitution Check before proceeding

3. **Task Breakdown** (`/sp.tasks`):
   - Generate tasks.md organized by user story
   - Each user story MUST be independently implementable
   - Include setup, foundational, and user story phases
   - Mark parallel tasks with [P] flag

4. **Implementation** (`/sp.implement`):
   - Execute tasks via Claude Code with specialized agents
   - Use auth-engineer for authentication work
   - Use nextjs-frontend-reviewer for frontend work
   - Use db-logging-specialist for database work
   - Use api-standards-reviewer for backend API work

5. **Review and Iteration**:
   - Each user story MUST be tested independently
   - Validate against acceptance criteria in spec.md
   - Update specs if requirements change, then re-implement

**Agent Usage** (MANDATORY):
- **auth-engineer**: MUST be used for all authentication/authorization work
- **nextjs-frontend-reviewer**: MUST be used after implementing frontend components
- **db-logging-specialist**: MUST be used for database schema and query work
- **api-standards-reviewer**: MUST be used after implementing API endpoints

**Quality Gates**:
- Constitution Check MUST pass before implementation
- Each user story MUST be independently testable
- API contracts MUST be validated before integration
- Security review MUST occur for all authentication flows

## Governance

**Authority**: This constitution supersedes all other development practices and guidelines for Phase II.

**Amendment Process**:
1. Proposed changes MUST be documented with rationale
2. Impact on existing specs, plans, and tasks MUST be assessed
3. Version MUST be incremented according to semantic versioning:
   - MAJOR: Backward-incompatible principle changes
   - MINOR: New principles or material expansions
   - PATCH: Clarifications, wording fixes, non-semantic changes
4. All dependent templates MUST be updated for consistency
5. Migration plan MUST be provided for existing work

**Compliance**:
- All PRs and code reviews MUST verify compliance with these principles
- Complexity violations MUST be justified in plan.md Complexity Tracking section
- Simpler alternatives MUST be documented when rejecting them
- Constitution violations MUST be escalated and resolved before merging

**Enforcement**:
- Claude Code agents MUST enforce these principles proactively
- Spec-driven workflow MUST NOT be bypassed
- Security principles MUST be validated in every authentication-related change
- Agent usage MUST follow the mandatory guidelines above

**Version**: 1.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-01-08
