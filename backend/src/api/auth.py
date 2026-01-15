"""
Authentication API router.

This module provides authentication endpoints:
- POST /auth/signup: Create new user account
- POST /auth/signin: Sign in existing user
- GET /auth/me: Get current user information
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Optional
from ..models.user import User, SigninRequest, AuthResponse, UserPublic
from pydantic import BaseModel, EmailStr, Field
from ..core.security import hash_password, verify_password, create_access_token
from ..core.database import get_session
from ..api.dependencies import get_current_user


router = APIRouter()


class SignupRequestExtended(BaseModel):
    """Extended request body for user signup with additional profile info"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    first_name: str = Field(default="", description="User's first name (optional)")
    last_name: str = Field(default="", description="User's last name (optional)")

    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123",
                "first_name": "John",
                "last_name": "Doe"
            }
        }


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    signup_data: SignupRequestExtended,
    session: Session = Depends(get_session)
):
    """
    Create a new user account.

    This endpoint:
    1. Validates email format (via Pydantic EmailStr)
    2. Validates password length (minimum 8 characters)
    3. Checks email uniqueness (case-insensitive)
    4. Hashes the password with bcrypt
    5. Creates the user in the database
    6. Issues a JWT token
    7. Returns the token and user information

    Args:
        signup_data: SignupRequest with email and password
        session: Database session

    Returns:
        AuthResponse with access_token, token_type, and user info

    Raises:
        HTTPException 400: Invalid email or password format
        HTTPException 409: Email already exists
        HTTPException 500: Database error
    """
    # Email validation is handled by Pydantic EmailStr
    # Password length validation is handled by Pydantic Field(min_length=8)

    # Check if email already exists (case-insensitive)
    email_lower = signup_data.email.lower()
    statement = select(User).where(User.email.ilike(email_lower))
    existing_user = session.exec(statement).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = hash_password(signup_data.password)

    # Create user
    new_user = User(
        email=signup_data.email,
        first_name=signup_data.first_name if signup_data.first_name.strip() else None,
        last_name=signup_data.last_name if signup_data.last_name.strip() else None,
        hashed_password=hashed_password
    )

    try:
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )

    # Create JWT token
    access_token = create_access_token(
        user_id=new_user.id,
        email=new_user.email
    )

    # Return response
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserPublic(
            id=new_user.id,
            email=new_user.email,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            created_at=new_user.created_at
        )
    )


@router.post("/signin", response_model=AuthResponse)
async def signin(
    signin_data: SigninRequest,
    session: Session = Depends(get_session)
):
    """
    Sign in an existing user.

    This endpoint:
    1. Validates email format (via Pydantic EmailStr)
    2. Looks up user by email (case-insensitive)
    3. Verifies password against bcrypt hash
    4. Issues a JWT token
    5. Returns the token and user information

    Args:
        signin_data: SigninRequest with email and password
        session: Database session

    Returns:
        AuthResponse with access_token, token_type, and user info

    Raises:
        HTTPException 401: Invalid credentials (wrong email or password)

    Note:
        Error message is intentionally vague to prevent user enumeration.
        Same message for wrong email and wrong password.
    """
    # Look up user by email (case-insensitive)
    email_lower = signin_data.email.lower()
    statement = select(User).where(User.email.ilike(email_lower))
    user = session.exec(statement).first()

    # Consistent error message for security (prevents user enumeration)
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

    if not user:
        # User not found - return same error as wrong password
        raise credentials_error

    # Verify password
    if not verify_password(signin_data.password, user.hashed_password):
        # Wrong password - return same error as user not found
        raise credentials_error

    # Create JWT token
    access_token = create_access_token(
        user_id=user.id,
        email=user.email
    )

    # Return response
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserPublic(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            created_at=user.created_at
        )
    )


@router.get("/me", response_model=UserPublic)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information.

    This endpoint requires a valid JWT token in the Authorization header.
    It extracts the user ID from the token and returns the user's information.

    Args:
        current_user: User object from JWT token (injected by dependency)

    Returns:
        UserPublic with user information

    Raises:
        HTTPException 401: Missing, invalid, or expired token
    """
    return UserPublic(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        created_at=current_user.created_at
    )


class UpdateProfileRequest(BaseModel):
    """Request body for updating user profile"""
    first_name: Optional[str] = Field(default=None, max_length=100, description="User's first name")
    last_name: Optional[str] = Field(default=None, max_length=100, description="User's last name")
    email: Optional[EmailStr] = Field(default=None, description="User's email address")

    class Config:
        schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@example.com"
            }
        }


@router.put("/me", response_model=UserPublic)
async def update_profile(
    profile_data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update current user's profile information.

    This endpoint allows users to update their profile information including
    first name, last name, and email. It requires a valid JWT token in the
    Authorization header.

    Args:
        profile_data: UpdateProfileRequest with profile fields to update
        current_user: User object from JWT token (injected by dependency)
        session: Database session

    Returns:
        UserPublic with updated user information

    Raises:
        HTTPException 400: Invalid email format
        HTTPException 401: Missing, invalid, or expired token
        HTTPException 409: Email already exists (if changing email)
    """
    # Check if email is being updated and if it already exists
    if profile_data.email and profile_data.email != current_user.email:
        existing_user = session.exec(
            select(User).where(
                User.email.ilike(profile_data.email),
                User.id != current_user.id  # Exclude current user
            )
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

    # Update user fields if provided
    if profile_data.first_name is not None:
        current_user.first_name = profile_data.first_name

    if profile_data.last_name is not None:
        current_user.last_name = profile_data.last_name

    if profile_data.email is not None:
        current_user.email = profile_data.email

    # Update the updated_at timestamp
    current_user.updated_at = datetime.now(timezone.utc)

    try:
        session.add(current_user)
        session.commit()
        session.refresh(current_user)
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

    # Return updated user information
    return UserPublic(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        created_at=current_user.created_at
    )
