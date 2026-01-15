"""
Task model for the todo web application.

This module defines the Task entity and related Pydantic models for
request/response validation.
"""
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
        default_factory=datetime.now,
        nullable=False,
        description="Timestamp when task was created"
    )

    updated_at: datetime = Field(
        default_factory=datetime.now,
        nullable=False,
        description="Timestamp of last task update"
    )

    # Relationship to User (optional, for ORM operations)
    # user: "User" = Relationship(back_populates="tasks")


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
                "completed": False
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
                "completed": True
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
                "completed": False,
                "created_at": "2026-01-09T10:00:00Z",
                "updated_at": "2026-01-09T10:00:00Z"
            }
        }