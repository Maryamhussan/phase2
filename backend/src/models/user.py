"""
User model for authentication and authorization.

This module defines the User entity and related Pydantic models for
request/response validation.
"""
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel
from pydantic import BaseModel, EmailStr


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

    first_name: Optional[str] = Field(
        default=None,
        max_length=100,
        description="User's first name"
    )

    last_name: Optional[str] = Field(
        default=None,
        max_length=100,
        description="User's last name"
    )

    hashed_password: str = Field(
        nullable=False,
        description="Bcrypt-hashed password (never plaintext)"
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        description="Timestamp when account was created"
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
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


class UserPublic(BaseModel):
    """Public user information (excludes hashed_password)"""
    id: UUID = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")
    first_name: Optional[str] = Field(default=None, description="User's first name")
    last_name: Optional[str] = Field(default=None, description="User's last name")
    created_at: datetime = Field(..., description="Account creation timestamp")

    class Config:
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "created_at": "2026-01-08T12:00:00Z"
            }
        }


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
