# Data Model: Authentication & Authorization

**Feature**: Authentication & Authorization for Todo Web Application
**Date**: 2026-01-08
**Status**: Completed

## Overview

This document defines the data entities required for authentication and authorization. The model is designed to support multi-user authentication with JWT tokens while maintaining strict user data isolation.

## Entity: User

### Purpose
Represents a registered user account in the system. Each user has unique credentials and owns their task data.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | Primary Key, Auto-generated | Unique identifier for the user |
| email | String | Unique, Not Null, Max 255 chars | User's email address (used for login) |
| hashed_password | String | Not Null | Bcrypt-hashed password (never store plaintext) |
| created_at | DateTime | Not Null, Default: now() | Timestamp when account was created |
| updated_at | DateTime | Not Null, Default: now() | Timestamp of last account update |

### Validation Rules

**Email** (FR-002):
- Must be valid email format (RFC 5322)
- Case-insensitive for uniqueness (user@example.com == USER@example.com)
- Maximum length: 255 characters
- Required field

**Password** (FR-003):
- Minimum length: 8 characters
- Stored as bcrypt hash (handled by Better Auth)
- Never stored in plaintext
- Required field

**Uniqueness** (FR-004):
- Email must be unique across all users
- Database constraint enforces uniqueness
- Case-insensitive comparison

### Indexes

```sql
-- Primary key index (automatic)
CREATE UNIQUE INDEX idx_users_id ON users(id);

-- Email uniqueness and lookup performance
CREATE UNIQUE INDEX idx_users_email ON users(LOWER(email));

-- Created_at for sorting/filtering
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

### Relationships

**User → Task** (Future):
- One-to-Many relationship
- User owns multiple tasks
- Foreign key: `tasks.user_id` references `users.id`
- Cascade delete: When user is deleted, all their tasks are deleted

### SQLModel Implementation

```python
# backend/src/models/user.py
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    """
    User entity for authentication and authorization.

    Each user has unique email credentials and owns their task data.
    Passwords are stored as bcrypt hashes, never plaintext.
    """
    __tablename__ = "users"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique identifier for the user"
    )

    email: str = Field(
        max_length=255,
        nullable=False,
        unique=True,
        index=True,
        description="User's email address (unique, case-insensitive)"
    )

    hashed_password: str = Field(
        nullable=False,
        description="Bcrypt-hashed password (never plaintext)"
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Timestamp when account was created"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Timestamp of last account update"
    )

    class Config:
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "created_at": "2026-01-08T12:00:00Z",
                "updated_at": "2026-01-08T12:00:00Z"
            }
        }
```

### Request/Response Models

**SignupRequest**:
```python
from pydantic import BaseModel, EmailStr, Field

class SignupRequest(BaseModel):
    """Request body for user signup"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")

    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }
```

**SigninRequest**:
```python
class SigninRequest(BaseModel):
    """Request body for user signin"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")

    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }
```

**AuthResponse**:
```python
class AuthResponse(BaseModel):
    """Response body for successful authentication"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")
    user: UserPublic = Field(..., description="Authenticated user information")

    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "email": "user@example.com",
                    "created_at": "2026-01-08T12:00:00Z"
                }
            }
        }
```

**UserPublic**:
```python
class UserPublic(BaseModel):
    """Public user information (excludes hashed_password)"""
    id: UUID = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")
    created_at: datetime = Field(..., description="Account creation timestamp")

    class Config:
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "created_at": "2026-01-08T12:00:00Z"
            }
        }
```

### Database Migration

```sql
-- Migration: 001_create_users_table.sql
-- Description: Create users table for authentication

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Email uniqueness (case-insensitive)
CREATE UNIQUE INDEX idx_users_email ON users(LOWER(email));

-- Performance index for created_at sorting
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Trigger to auto-update updated_at
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

## Entity: JWT Token (Logical, Not Stored)

### Purpose
JWT tokens are stateless authentication credentials. They are NOT stored in the database (per constitutional requirement for stateless auth).

### JWT Payload Structure

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "iat": 1704672000,
  "exp": 1704758400
}
```

### JWT Claims

| Claim | Type | Description |
|-------|------|-------------|
| sub | UUID (string) | Subject - User's unique identifier |
| email | String | User's email address |
| iat | Integer | Issued At - Unix timestamp when token was created |
| exp | Integer | Expiration - Unix timestamp when token expires (iat + 24 hours) |

### JWT Configuration

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret**: BETTER_AUTH_SECRET environment variable (min 32 chars)
- **Expiration**: 24 hours from issuance
- **Issuer**: Not specified (optional future enhancement)
- **Audience**: Not specified (optional future enhancement)

## Data Isolation Strategy

### User Data Ownership

Every user-specific entity (tasks, in future features) MUST include a `user_id` foreign key:

```python
class Task(SQLModel, table=True):
    """Example: Future task entity"""
    id: int = Field(primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(max_length=255, nullable=False)
    # ... other fields
```

### Query Filtering Pattern

ALL queries for user-specific data MUST filter by authenticated user ID:

```python
# CORRECT: Filter by authenticated user
@router.get("/tasks")
async def get_tasks(current_user: User = Depends(get_current_user)):
    tasks = await db.query(Task).filter(Task.user_id == current_user.id).all()
    return tasks

# WRONG: No user filtering - SECURITY VULNERABILITY
@router.get("/tasks")
async def get_tasks_wrong():
    tasks = await db.query(Task).all()  # Returns ALL users' tasks!
    return tasks
```

### Cross-User Access Prevention

When accessing a specific resource by ID, ALWAYS include user_id filter:

```python
@router.get("/tasks/{task_id}")
async def get_task(task_id: int, current_user: User = Depends(get_current_user)):
    task = await db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id  # CRITICAL: prevents cross-user access
    ).first()

    if not task:
        # Return 404, not 403, to prevent user enumeration
        raise HTTPException(status_code=404, detail="Task not found")

    return task
```

## Security Considerations

### Password Security
- Passwords hashed with bcrypt (cost factor 12)
- Never log or expose hashed_password in API responses
- UserPublic model excludes hashed_password field

### Email Privacy
- Email addresses are PII (Personally Identifiable Information)
- Only expose user's own email in API responses
- Never list all users' emails

### User Enumeration Prevention
- Consistent error messages for invalid credentials
- "Invalid credentials" for both wrong email and wrong password
- Don't reveal whether email exists during signin

### SQL Injection Prevention
- SQLModel ORM with parameterized queries
- No raw SQL in application code (except migrations)
- Input validation via Pydantic models

## Future Enhancements (Out of Scope)

The following are NOT included in this feature but may be added later:

- **User Profile**: Additional fields (name, avatar, bio)
- **Email Verification**: Verified email flag and verification tokens
- **Password Reset**: Reset tokens and expiration
- **Account Deletion**: Soft delete flag and cascade rules
- **User Roles**: Role-based access control (admin, user)
- **OAuth Providers**: Social login integration
- **Audit Log**: Track user actions and authentication events

## Validation Against Requirements

- ✅ FR-001: User model supports account creation with email and password
- ✅ FR-002: Email validation via EmailStr (Pydantic)
- ✅ FR-003: Password minimum 8 characters enforced
- ✅ FR-004: Email uniqueness via database constraint
- ✅ FR-007: JWT payload includes user ID (sub), email, expiration
- ✅ FR-011: User ID extracted from JWT "sub" claim
- ✅ FR-012: Query filtering pattern enforces user_id filter
- ✅ FR-016: Bcrypt password hashing (via Better Auth/passlib)

## Summary

The User entity is the foundation of authentication and authorization. It stores user credentials securely and serves as the basis for user data isolation. All future user-specific entities will reference users.id as a foreign key, and all queries will filter by the authenticated user's ID from the JWT token.
