---
id: 0001
title: Create Phase II Constitution
stage: constitution
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "governance", "principles", "security", "spec-driven"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

Project: Phase II – Todo Full-Stack Web Application (Spec-Driven Development)

Core principles:
- Security-first full-stack design
- Clear separation of concerns (frontend, backend, database)
- Spec-driven and incremental development
- User data isolation and ownership enforcement
- Simplicity and clarity suitable for student-level projects

Key standards:
- All features must be defined through specs before implementation
- Backend APIs must be RESTful and documented
- Authentication must be enforced on every protected endpoint
- All task data must be scoped to the authenticated user
- Frontend and backend must communicate only via API contracts

Constraints:
- Frontend: Next.js 16+ with App Router
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth with JWT
- JWT secret shared via environment variable (BETTER_AUTH_SECRET)
- No backend session storage (stateless auth only)

Success criteria:
- Multi-user support with secure authentication
- Each user can only access their own tasks
- All 5 basic-level todo features implemented via web UI
- Frontend is responsive and usable
- Backend persists data reliably in PostgreSQL
- Project can be extended in future phases without redesign

## Response snapshot

Created Phase II Todo Full-Stack Web Application Constitution v1.0.0 with six core principles:

1. Security-First Full-Stack Design - Authentication enforcement, JWT verification, user data isolation
2. Clear Separation of Concerns - Frontend (Next.js), Backend (FastAPI), Database (Neon PostgreSQL) boundaries
3. Spec-Driven Development (NON-NEGOTIABLE) - spec → plan → tasks → implement workflow
4. User Data Isolation and Ownership - Complete data isolation per user
5. Simplicity and Student-Friendly Design - YAGNI, clear code, standard patterns
6. API Contract Enforcement - RESTful APIs, OpenAPI documentation, explicit schemas

Technology Stack Constraints section defines mandatory technologies and authentication architecture (Better Auth + JWT with stateless backend).

Development Workflow section mandates Agentic Dev Stack process with specialized agent usage:
- auth-engineer for authentication work
- nextjs-frontend-reviewer for frontend components
- db-logging-specialist for database operations
- api-standards-reviewer for backend APIs

Governance section establishes amendment process, compliance requirements, and enforcement mechanisms.

## Outcome

- ✅ Impact: Established foundational governance document for Phase II project. All future development must follow these principles and the spec-driven workflow.
- 🧪 Tests: N/A - Constitution is a governance document
- 📁 Files: Created/updated 1 file (.specify/memory/constitution.md)
- 🔁 Next prompts: /sp.specify to create first feature specification, or begin with authentication feature spec
- 🧠 Reflection: Constitution successfully captures security-first approach, mandatory spec-driven workflow, and clear technology constraints. Agent usage is explicitly mandated to ensure quality gates are enforced.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution created successfully with all placeholders filled
- Graders run and results (PASS/FAIL): N/A - governance document
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
