"""
Task API router for the todo web application.

This module provides task endpoints that enforce user authentication and
data isolation. Each user can only access their own tasks.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from ..models.task import Task, TaskCreate, TaskUpdate, TaskPublic
from ..models.user import User
from ..core.database import get_session
from ..api.dependencies import get_current_user
import asyncio
from collections import defaultdict
import threading

# Global lock dictionary to prevent race conditions for the same user
user_locks = defaultdict(threading.Lock)

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
if not logger.handlers:
    logger.addHandler(handler)


router = APIRouter(tags=["Tasks"])


@router.get("/", response_model=List[TaskPublic])
async def get_tasks(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all tasks for the authenticated user.

    This endpoint demonstrates user data isolation by:
    1. Requiring authentication (get_current_user dependency)
    2. Filtering tasks by the authenticated user's ID
    3. Preventing access to other users' tasks

    Args:
        current_user: Authenticated user (from JWT token)
        session: Database session

    Returns:
        List of TaskPublic objects belonging to the user
    """
    logger.info(f"User {current_user.id} requesting all tasks")

    statement = select(Task).where(Task.user_id == current_user.id)
    tasks = session.exec(statement).all()

    logger.info(f"Returning {len(tasks)} tasks for user {current_user.id}")
    return tasks


@router.post("/", response_model=TaskPublic, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_create: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new task for the authenticated user.

    This endpoint demonstrates user data isolation by:
    1. Requiring authentication (get_current_user dependency)
    2. Associating the task with the authenticated user's ID
    3. Preventing creation of tasks for other users

    Args:
        task_create: TaskCreate request body with title
        current_user: Authenticated user (from JWT token)
        session: Database session

    Returns:
        TaskPublic object of the created task
    """
    logger.info(f"Creating new task for user {current_user.id}")

    # Use a lock to prevent race conditions for the same user
    user_lock = user_locks[current_user.id]
    with user_lock:
        # Check if a similar task already exists to prevent duplicates
        existing_task_statement = select(Task).where(
            Task.user_id == current_user.id,
            Task.title == task_create.title,
            Task.description == task_create.description,
            Task.completed == task_create.completed
        )
        existing_task = session.exec(existing_task_statement).first()

        if existing_task:
            logger.info(f"Task already exists for user {current_user.id} with same content, returning existing task {existing_task.id}")
            return existing_task

        # If no existing task found, create a new one
        new_task = Task(
            user_id=current_user.id,
            title=task_create.title,
            description=task_create.description,
            completed=task_create.completed
        )

        try:
            session.add(new_task)
            session.commit()
            session.refresh(new_task)

            logger.info(f"Created task {new_task.id} for user {current_user.id}")
            return new_task
        except Exception as e:
            # If there's an integrity constraint violation (likely due to race condition),
            # check if a similar task was created by another concurrent request
            session.rollback()

            # Check again if a task with the same content exists (might have been created by concurrent request)
            existing_task_statement = select(Task).where(
                Task.user_id == current_user.id,
                Task.title == task_create.title,
                Task.description == task_create.description,
                Task.completed == task_create.completed
            )
            existing_task = session.exec(existing_task_statement).first()

            if existing_task:
                logger.info(f"Task was created by concurrent request, returning existing task {existing_task.id}")
                return existing_task
            else:
                # Re-raise the original exception if it wasn't a duplicate issue
                logger.error(f"Error creating task: {e}")
                raise e


@router.get("/{task_id}", response_model=TaskPublic)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific task for the authenticated user.

    This endpoint demonstrates user data isolation by:
    1. Requiring authentication (get_current_user dependency)
    2. Including user_id in the query filter alongside task_id
    3. Returning 404 if the task doesn't belong to the user
    4. Preventing access to other users' tasks

    Args:
        task_id: ID of the task to retrieve
        current_user: Authenticated user (from JWT token)
        session: Database session

    Returns:
        TaskPublic object if the task exists and belongs to the user

    Raises:
        HTTPException 404: Task not found or doesn't belong to user
    """
    logger.info(f"User {current_user.id} requesting task {task_id}")

    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user.id
    )
    task = session.exec(statement).first()

    if not task:
        logger.warning(f"User {current_user.id} attempted to access non-existent task {task_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    logger.info(f"Returning task {task.id} for user {current_user.id}")
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

    This endpoint demonstrates user data isolation by:
    1. Requiring authentication (get_current_user dependency)
    2. Including user_id in the query filter alongside task_id
    3. Returning 404 if the task doesn't belong to the user
    4. Preventing modification of other users' tasks

    Args:
        task_id: ID of the task to update
        task_update: TaskUpdate request body with optional fields
        current_user: Authenticated user (from JWT token)
        session: Database session

    Returns:
        TaskPublic object of the updated task

    Raises:
        HTTPException 404: Task not found or doesn't belong to user
    """
    logger.info(f"User {current_user.id} attempting to update task {task_id}")

    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user.id
    )
    task = session.exec(statement).first()

    if not task:
        logger.warning(f"User {current_user.id} attempted to update non-existent task {task_id}")
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

    logger.info(f"Updated task {task.id} for user {current_user.id}")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a specific task for the authenticated user.

    This endpoint demonstrates user data isolation by:
    1. Requiring authentication (get_current_user dependency)
    2. Including user_id in the query filter alongside task_id
    3. Returning 404 if the task doesn't belong to the user
    4. Preventing deletion of other users' tasks

    Args:
        task_id: ID of the task to delete
        current_user: Authenticated user (from JWT token)
        session: Database session

    Returns:
        204 No Content if successful

    Raises:
        HTTPException 404: Task not found or doesn't belong to user
    """
    logger.info(f"User {current_user.id} attempting to delete task {task_id}")

    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user.id
    )
    task = session.exec(statement).first()

    if not task:
        logger.warning(f"User {current_user.id} attempted to delete non-existent task {task_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    session.delete(task)
    session.commit()

    logger.info(f"Deleted task {task.id} for user {current_user.id}")

    # Return 204 No Content
    return


from pydantic import BaseModel

class TaskCompleteRequest(BaseModel):
    completed: bool

@router.patch("/{task_id}/complete", response_model=TaskPublic)
async def complete_task(
    task_id: int,
    request: TaskCompleteRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Toggle completion status of a specific task for the authenticated user.

    This endpoint demonstrates user data isolation by:
    1. Requiring authentication (get_current_user dependency)
    2. Including user_id in the query filter alongside task_id
    3. Returning 404 if the task doesn't belong to the user
    4. Preventing modification of other users' tasks

    Args:
        task_id: ID of the task to update completion status
        request: TaskCompleteRequest containing the new completion status
        current_user: Authenticated user (from JWT token)
        session: Database session

    Returns:
        TaskPublic object of the updated task

    Raises:
        HTTPException 404: Task not found or doesn't belong to user
    """
    logger.info(f"User {current_user.id} attempting to update completion status of task {task_id} to {request.completed}")

    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user.id
    )
    task = session.exec(statement).first()

    if not task:
        logger.warning(f"User {current_user.id} attempted to update completion status of non-existent task {task_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update completion status
    task.completed = request.completed
    session.add(task)
    session.commit()
    session.refresh(task)

    logger.info(f"Updated completion status of task {task.id} to {task.completed} for user {current_user.id}")
    return task


# Health check for task endpoints
@router.get("/health", tags=["Tasks Health"])
async def tasks_health():
    """
    Health check endpoint for task API.

    Returns:
        dict: Status message
    """
    return {
        "status": "tasks API healthy",
        "user_isolation": "enforced"
    }