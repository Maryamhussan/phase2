# Quickstart: Backend REST API & Database Implementation

**Feature**: Backend REST API & Database for Todo Web Application
**Date**: 2026-01-09
**Status**: Ready for Implementation

## Overview

This guide provides step-by-step instructions for implementing the backend REST API and database for task management, building on the authentication system from phase 1.

## Prerequisites

### Required Software
- **Python 3.11+**: Backend runtime
- **Node.js 18+**: For any frontend integration testing
- **Git**: Version control
- **PostgreSQL Client**: For Neon database management

### Existing Setup
- Phase 1 authentication system (users table, JWT utilities)
- Working database connection
- BETTER_AUTH_SECRET configured in environment

## Implementation Steps

### 1. Create Task Model

Create `backend/src/models/task.py` with the SQLModel definition:

```python
from datetime import datetime
from typing import Optional
from uuid import UUID
from sqlmodel import Field, SQLModel
from pydantic import BaseModel, Field as PydanticField

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(min_length=1, max_length=255, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class TaskCreate(BaseModel):
    title: str = PydanticField(..., min_length=1, max_length=255)
    description: Optional[str] = PydanticField(None, max_length=1000)
    completed: bool = PydanticField(default=False)

class TaskUpdate(BaseModel):
    title: Optional[str] = PydanticField(None, min_length=1, max_length=255)
    description: Optional[str] = PydanticField(None, max_length=1000)
    completed: Optional[bool] = PydanticField(None)

class TaskPublic(BaseModel):
    id: int
    user_id: UUID
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### 2. Create Database Migration

Create `backend/migrations/002_create_tasks_table.sql`:

```sql
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

### 3. Apply Database Migration

Run the migration against your Neon PostgreSQL database:

```bash
# Using psql
psql $DATABASE_URL -f backend/migrations/002_create_tasks_table.sql

# Or use your preferred SQL client
```

### 4. Create Task API Endpoints

Create `backend/src/api/tasks.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from ..models.task import Task, TaskCreate, TaskUpdate, TaskPublic
from ..models.user import User
from ..core.database import get_session
from ..api.dependencies import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("/", response_model=List[TaskPublic])
async def get_tasks(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all tasks for the authenticated user.

    Returns a list of tasks that belong to the authenticated user.
    """
    statement = select(Task).where(Task.user_id == current_user.id)
    tasks = session.exec(statement).all()
    return tasks

@router.post("/", response_model=TaskPublic, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_create: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new task for the authenticated user.

    Associates the task with the authenticated user's ID.
    """
    new_task = Task(
        user_id=current_user.id,
        title=task_create.title,
        description=task_create.description,
        completed=task_create.completed
    )

    session.add(new_task)
    session.commit()
    session.refresh(new_task)

    return new_task

@router.get("/{task_id}", response_model=TaskPublic)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific task for the authenticated user.

    Returns 404 if the task doesn't exist or doesn't belong to the user.
    """
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user.id
    )
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task

@router.put("/{task_id}", response_model=TaskPublic)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a specific task for the authenticated user.

    Returns 404 if the task doesn't exist or doesn't belong to the user.
    """
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user.id
    )
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update task fields if provided
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(task, field, value)

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a specific task for the authenticated user.

    Returns 404 if the task doesn't exist or doesn't belong to the user.
    """
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user.id
    )
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    session.delete(task)
    session.commit()

    return
```

### 5. Register Task Router

Update `backend/src/main.py` to include the task router:

```python
# Add after other imports
from .api.tasks import router as tasks_router

# Add after other router registrations
app.include_router(tasks_router)
```

### 6. Update Requirements

Add any necessary dependencies to `backend/requirements.txt`:

```
# All dependencies should already be present from phase 1
# No additional dependencies needed for this phase
```

## Testing the Implementation

### Manual Testing

1. **Start the backend server**:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn src.main:app --reload
```

2. **Test task creation** (replace with your JWT token):
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task", "description": "This is a test task"}'
```

3. **Test task retrieval**:
```bash
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

4. **Test specific task retrieval**:
```bash
curl -X GET http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

5. **Test task update**:
```bash
curl -X PUT http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

6. **Test task deletion**:
```bash
curl -X DELETE http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### API Documentation

Once running, view the interactive API documentation at:
- http://localhost:8000/docs
- http://localhost:8000/redoc

## Verification Checklist

### Implementation Verification
- [ ] Task model created with all required fields
- [ ] Database migration created and applied
- [ ] Task API endpoints implemented
- [ ] All endpoints require authentication
- [ ] User data isolation enforced (user_id filters)
- [ ] Cross-user access returns 404 (not 403)
- [ ] Proper HTTP status codes returned
- [ ] Input validation implemented

### Security Verification
- [ ] All endpoints require valid JWT token
- [ ] Users can only access their own tasks
- [ ] Invalid tokens return 401 Unauthorized
- [ ] Cross-user access attempts return 404
- [ ] Input validation prevents injection attacks

### Functionality Verification
- [ ] GET /api/tasks returns user's tasks
- [ ] POST /api/tasks creates new task with user_id
- [ ] GET /api/tasks/{id} returns specific task
- [ ] PUT /api/tasks/{id} updates specific task
- [ ] DELETE /api/tasks/{id} removes specific task
- [ ] Error responses follow consistent format

## Troubleshooting

### Common Issues

**Issue**: `relation "tasks" does not exist`
- **Solution**: Run the database migration script

**Issue**: `401 Unauthorized` on all requests
- **Solution**: Verify JWT token is included in Authorization header

**Issue**: `404 Not Found` when accessing own tasks
- **Solution**: Verify user_id in token matches task owner

**Issue**: `500 Internal Server Error`
- **Solution**: Check server logs for detailed error information

**Issue**: Cross-user access not returning 404
- **Solution**: Verify user_id filter is applied in all queries

## Next Steps

After completing this implementation:

1. **Integrate with Frontend**: Connect task endpoints to frontend components
2. **Add Task Management UI**: Create task list, creation, and editing interfaces
3. **Enhanced Features**: Consider adding filtering, sorting, or pagination
4. **Performance Optimization**: Add caching or optimize queries as needed

## Resources

### Documentation
- FastAPI: https://fastapi.tiangolo.com
- SQLModel: https://sqlmodel.tiangolo.com
- Neon: https://neon.tech/docs

### API Contracts
- OpenAPI Spec: `specs/002-backend-rest-api/contracts/tasks-api.yaml`
- Interactive Docs: http://localhost:8000/docs (when backend running)

### Architecture Documents
- Specification: `specs/002-backend-rest-api/spec.md`
- Implementation Plan: `specs/002-backend-rest-api/plan.md`
- Data Model: `specs/002-backend-rest-api/data-model.md`

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review architecture documents in `specs/002-backend-rest-api/`
3. Consult API documentation at http://localhost:8000/docs
4. Review constitution principles in `.specify/memory/constitution.md`