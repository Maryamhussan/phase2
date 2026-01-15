# Research: Backend REST API & Database Architecture Decisions

**Feature**: Backend REST API & Database for Todo Web Application
**Date**: 2026-01-09
**Status**: Ready for Implementation

## Overview

This document outlines the key architecture decisions made for the backend REST API and database implementation, including rationale, alternatives considered, and implementation details.

## Architecture Decision 1: SQLModel Schema Design for Task Entity

### Decision
Use SQLModel for the Task entity with a foreign key relationship to the User entity.

### Rationale
- Maintains consistency with the existing User model from phase 1
- Provides type safety and validation through Pydantic integration
- Enables automatic schema generation and database migrations
- Supports both SQLModel's SQL capabilities and Pydantic's validation features

### Alternative Considered
Pure SQLAlchemy ORM without SQLModel
- Rejected because: Would require separate validation layer and lose Pydantic integration

### Implementation Details
```python
class Task(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id")
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Impact
Critical - affects database schema, API responses, and data access patterns.

## Architecture Decision 2: User Identity and Task Ownership Relationship

### Decision
Extract user ID from the JWT "sub" claim and use it to enforce task ownership at the query level.

### Rationale
- Leverages the existing authentication system from phase 1
- Ensures user identity comes from a trusted, verified source
- Enforces ownership at the database query level for security
- Prevents clients from manipulating user identity in requests

### Alternative Considered
Passing user ID in request body or headers (other than JWT)
- Rejected because: Could be manipulated by malicious clients

### Implementation Details
- Use the existing `get_current_user` dependency from auth system
- Include user_id filter in all task queries: `where(Task.user_id == current_user.id)`
- Return 404 for any task not belonging to authenticated user

### Impact
Security-critical - affects all data access and isolation mechanisms.

## Architecture Decision 3: Database Connection Strategy for Neon Serverless PostgreSQL

### Decision
Use SQLModel's engine and session patterns with connection pooling optimized for serverless.

### Rationale
- Neon Serverless has connection pooling considerations
- SQLModel provides built-in connection management
- FastAPI dependency injection works seamlessly with SQLModel sessions
- Proper session lifecycle management prevents connection leaks

### Alternative Considered
Direct psycopg2 connections without ORM
- Rejected because: Would lose ORM benefits and require manual connection management

### Implementation Details
- Create global engine in `backend/src/core/database.py`
- Use dependency injection for session management in endpoints
- Configure appropriate connection timeouts for serverless environment

### Impact
Performance-critical - affects scalability and resource utilization.

## Architecture Decision 4: Where to Enforce Ownership Checks

### Decision
Enforce ownership checks at the database query level in all API endpoints.

### Rationale
- Provides defense-in-depth security
- Prevents accidental data exposure even if business logic has bugs
- Ensures consistency across all operations
- Makes it impossible to accidentally return other users' data

### Alternative Considered
Enforce ownership checks in a service layer
- Rejected because: Still requires query-level filtering for security

### Implementation Details
- Every query includes: `where(Task.user_id == current_user.id)`
- No direct access to tasks without user_id filter
- Both single-item and list queries enforce user isolation

### Impact
Security-critical - affects all data access patterns and query construction.

## Architecture Decision 5: Error-Handling Strategy for Missing or Unauthorized Resources

### Decision
Return 404 Not Found for unauthorized resource access (instead of 403 Forbidden) to prevent user enumeration.

### Rationale
- Prevents attackers from determining if resources exist
- Maintains privacy by not revealing resource existence
- Follows security best practices for multi-tenant systems
- Consistent with industry standards for user-isolated data

### Alternative Considered
Return 403 Forbidden for unauthorized access
- Rejected because: Reveals resource exists but access is denied

### Implementation Details
- Attempt to query with user_id filter
- Return 404 if no matching record found
- Same behavior for both non-existent and unauthorized resources

### Impact
Security - affects all resource access patterns and error responses.

## Technical Research Findings

### Neon Serverless PostgreSQL Specifics
- Connection pooling behaves differently than traditional PostgreSQL
- Serverless may have warm-up time for initial connections
- Connection limits may apply based on plan
- SSL required for all connections

### FastAPI Integration Points
- Dependency injection perfect for database session management
- Automatic OpenAPI documentation generation
- Pydantic validation integrated with request/response handling
- Background tasks available if needed for future features

### SQLModel Capabilities
- Seamless integration with FastAPI and Pydantic
- Automatic schema generation from model definitions
- Support for relationships and foreign keys
- Transaction management capabilities

## Validation Strategy

### Against Success Criteria
- All REST endpoints: Verified through FastAPI's route registration
- Data persistence: Verified through database schema and CRUD operations
- User ownership: Verified through JWT integration and query filters
- Access control: Verified through 404 responses for unauthorized access
- Data integrity: Verified through SQLModel validation and constraints

### Security Validation
- Cross-user access prevention tested with multiple user scenarios
- JWT validation verified through dependency injection
- Input validation verified through Pydantic models
- Error message consistency verified through unified error handling

## Implementation Considerations

### Performance Optimization
- Proper indexing on user_id for efficient filtering
- Connection pooling configuration for serverless environment
- Query optimization for common access patterns
- Caching considerations for future enhancements

### Scalability Factors
- Neon Serverless auto-scaling capabilities
- Connection pooling efficiency
- Query performance with increasing data volume
- Concurrent user access patterns

This research provides the foundation for implementing a secure, efficient, and maintainable backend API for task management with proper user isolation.