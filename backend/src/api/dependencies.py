"""
FastAPI dependencies for authentication and authorization.

This module provides dependency injection functions for:
- Extracting JWT tokens from Authorization headers
- Verifying tokens and extracting user information
- Enforcing authentication on protected endpoints
"""
from typing import Optional
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from ..core.security import verify_token, extract_user_id_from_token
from ..models.user import User
from ..core.database import get_session


# OAuth2 scheme for extracting Bearer tokens from Authorization header
# tokenUrl is the endpoint where clients can obtain tokens (will be /auth/signin)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/signin")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.

    This dependency:
    1. Extracts the Bearer token from the Authorization header
    2. Verifies the token signature and expiration
    3. Extracts the user ID from the token's "sub" claim
    4. Queries the database to retrieve the user
    5. Returns the User object or raises 401 Unauthorized

    Args:
        token: JWT token extracted from Authorization header
        session: Database session for querying users

    Returns:
        User object for the authenticated user

    Raises:
        HTTPException: 401 Unauthorized if token is invalid or user not found

    Usage:
        @router.get("/protected")
        async def protected_route(current_user: User = Depends(get_current_user)):
            return {"user_id": current_user.id}
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Verify token and extract user ID
    user_id = extract_user_id_from_token(token)
    if user_id is None:
        raise credentials_exception

    # Query database for user
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()

    if user is None:
        # Token is valid but user doesn't exist (deleted account?)
        raise credentials_exception

    return user


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> Optional[User]:
    """
    Optional authentication dependency.

    Returns the current user if a valid token is provided, otherwise None.
    Useful for endpoints that have different behavior for authenticated vs
    unauthenticated users.

    Args:
        token: JWT token extracted from Authorization header (optional)
        session: Database session for querying users

    Returns:
        User object if authenticated, None otherwise

    Usage:
        @router.get("/public-or-private")
        async def mixed_route(current_user: Optional[User] = Depends(get_current_user_optional)):
            if current_user:
                return {"message": f"Hello {current_user.email}"}
            return {"message": "Hello guest"}
    """
    if token is None:
        return None

    try:
        user_id = extract_user_id_from_token(token)
        if user_id is None:
            return None

        statement = select(User).where(User.id == user_id)
        user = session.exec(statement).first()
        return user
    except Exception:
        return None
