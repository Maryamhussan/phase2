# Data Model: Backend REST API & Database for Todo Web Application

**Feature**: Backend REST API & Database for Todo Web Application
**Date**: 2026-01-01-09
**Status**: Ready for Implementation

## Overview

This document defines the data entities required for the task management system, building on the existing User entity from phase 1. The model enforces user data isolation through foreign key relationships and ownership constraints.

## Entity: Task

### Purpose
Represents a user's personal task with title, description, and completion status. Each task belongs to exactly one user and can only be accessed by that user.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-generated | Unique identifier for the task |
| user_id | UUID | Foreign Key, Not Null | Reference to the owning user |
| title | String | Not Null, Min 1 char, Max 255 chars | Task title/description |
| description | String (Optional) | Max 1000 chars | Detailed task description |
| completed | Boolean | Not Null, Default: false | Completion status |
| created_at | DateTime | Not Null, Default: now() | Timestamp when task was created |
| updated_at | DateTime | Not Null, Default: now() | Timestamp of last update |

### Validation Rules

**Title** (FR-011):
- Must be non-empty string
- Maximum length: 255 characters
- Required field

**Description** (FR-012):
- Optional field
- Maximum length: 1000 characters
- Can be null/empty

**Completion Status** (FR-013):
- Boolean value (true/false)
- Default value: false
- Required field

**Ownership** (FR-009):
- user_id must reference a valid user in the users table
- Each task belongs to exactly one user
- Foreign key constraint prevents orphaned tasks

### Indexes

```sql
-- Primary key index (automatic)
CREATE INDEX idx_tasks_id ON tasks(id);

-- User ID for efficient filtering (critical for user isolation)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Combined index for common query pattern: user's incomplete tasks
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);

-- Index for creation date sorting
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

### Relationships

**Task → User** (Required):
- Many-to-One relationship
- `tasks.user_id` references `users.id`
- Cascading rules: When user is deleted, their tasks are also deleted

**User → Task** (Inverse):
- One-to-Many relationship
- One user can own many tasks
- Access pattern: User retrieves all their tasks via user_id filter

### SQLModel Implementation

```python
# backend/src/models/task.py
from datetime import datetime
from typing import Optional
from uuid import UUID
from sqlmodel import Field, SQLModel, Relationship
from pydantic import BaseModel, Field as PydanticField

class Task(SQLModel, table=True):
    """
    Task entity representing a user's personal task.

    Each task belongs to a specific user and can only be accessed by that user.
    The model enforces data isolation through foreign key relationships.
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
        description="Reference to the user who owns this task"
    )

    title: str = Field(
        min_length=1,
        max_length=255,
        nullable=False,
        description="Task title (required, 1-255 characters)"
    )

    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional task description (0-1000 characters)"
    )

    completed: bool = Field(
        default=False,
        nullable=False,
        description="Task completion status (default: false)"
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Timestamp when task was created"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Timestamp of last task update"
    )

    # Relationship to User (optional, for ORM operations)
    # user: User = Relationship(back_populates="tasks")


class TaskCreate(BaseModel):
    """Request body for creating a new task"""
    title: str = PydanticField(
        ...,
        min_length=1,
        max_length=255,
        description="Task title (required, 1-255 characters)"
    )
    description: Optional[str] = PydanticField(
        None,
        max_length=1000,
        description="Optional task description (0-1000 characters)"
    )
    completed: bool = PydanticField(
        default=False,
        description="Initial completion status (default: false)"
    )

    class Config:
        schema_extra = {
            "example": {
                "title": "Complete project documentation",
                "description": "Write comprehensive documentation for the API",
                "completed": false
            }
        }


class TaskUpdate(BaseModel):
    """Request body for updating an existing task"""
    title: Optional[str] = PydanticField(
        None,
        min_length=1,
        max_length=255,
        description="Updated task title (1-255 characters)"
    )
    description: Optional[str] = PydanticField(
        None,
        max_length=1000,
        description="Updated task description (0-1000 characters)"
    )
    completed: Optional[bool] = PydanticField(
        None,
        description="Updated completion status"
    )

    class Config:
        schema_extra = {
            "example": {
                "title": "Update project documentation",
                "completed": true
            }
        }


class TaskPublic(BaseModel):
    """Public response model for task data"""
    id: int
    user_id: UUID
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": 1,
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Complete project documentation",
                "description": "Write comprehensive documentation for the API",
                "completed": false,
                "created_at": "2026-01-09T10:00:00Z",
                "updated_at": "2026-01-09T10:00:00Z"
            }
        }
```

### Database Migration

```sql
-- Migration: 002_create_tasks_table.sql
-- Description: Create tasks table with user ownership and indexes

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL CHECK (LENGTH(title) > 0),
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Entity: User (Extended for Task Relationships)

### Extended Attributes for Task Management

```python
# Additional relationship in User model (from phase 1)
from sqlmodel import Relationship

class User(SQLModel, table=True):
    # ... existing attributes from phase 1 ...

    # Relationship to tasks (for ORM operations)
    tasks: List["Task"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
```

## Data Isolation Strategy

### User Data Ownership
Every task record includes a `user_id` field that establishes ownership:
- All queries for tasks must filter by the authenticated user's ID
- Cross-user access attempts return 404 (not 403) to prevent enumeration
- Foreign key constraint ensures referential integrity

### Query Patterns

**Retrieve All User Tasks**:
```python
SELECT * FROM tasks WHERE user_id = <authenticated_user_id>;
```

**Retrieve Specific Task**:
```python
SELECT * FROM tasks
WHERE id = <task_id>
AND user_id = <authenticated_user_id>;
```

**Update Task**:
```python
UPDATE tasks
SET title = ?, description = ?, completed = ?, updated_at = NOW()
WHERE id = <task_id>
AND user_id = <authenticated_user_id>;
```

**Delete Task**:
```python
DELETE FROM tasks
WHERE id = <task_id>
AND user_id = <authenticated_user_id>;
```

## Security Considerations

### Data Privacy
- Tasks are physically separated by user_id in database
- No joins or queries that could expose other users' data
- Authentication required for all task operations

### Access Control
- Ownership verification at database query level
- 404 responses for unauthorized access attempts
- Input validation prevents injection attacks

### Audit Trail
- created_at and updated_at timestamps track changes
- User ID association provides accountability
- Future enhancement: Add explicit audit logging

## Performance Considerations

### Indexing Strategy
- Primary index on task id for direct access
- User ID index for ownership filtering (critical)
- Combined user/completion index for common queries
- Creation date index for chronological ordering

### Query Optimization
- All queries include user_id filter for efficiency
- Proper indexing supports expected access patterns
- Connection pooling optimized for serverless environment

## Future Extensions

### Potential Additions (Out of Scope)
- **Task Categories**: Category field with foreign key to categories table
- **Task Priority**: Priority field (low, medium, high) with index
- **Due Dates**: Due date field with separate index
- **Subtasks**: Recursive relationship for hierarchical tasks
- **Tags**: Many-to-many relationship with tags table
- **Sharing**: Complex permissions system for shared tasks

## Validation Against Requirements

- ✅ FR-010: Task Data Model - Complete entity definition with all attributes
- ✅ FR-011: Task Title Validation - Length constraints implemented
- ✅ FR-012: Task Description Validation - Optional with length constraints
- ✅ FR-013: Task Completion Status - Boolean with default false
- ✅ FR-014: Task Timestamps - Automatic created_at/updated_at
- ✅ FR-015: Database Persistence - SQLModel with PostgreSQL
- ✅ FR-016: Database Schema - Proper indexes defined
- ✅ FR-017: Database Relationships - Foreign key to users table
- ✅ FR-009: User Isolation - user_id field with query filters
- ✅ FR-018: Error Responses - Proper validation and constraints

## Summary

The Task entity provides a solid foundation for the todo management system with proper user isolation, validation, and performance characteristics. The model builds on the existing User entity from phase 1 and maintains consistency with the security-first approach established in the project constitution.