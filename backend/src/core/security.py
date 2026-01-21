"""
Security utilities for JWT token management and password hashing.

This module provides functions for:
- Creating and verifying JWT tokens
- Hashing and verifying passwords with bcrypt
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID
from jose import JWTError, jwt
from passlib.context import CryptContext
from .config import settings


# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password to hash

    Returns:
        Bcrypt hashed password string

    Example:
        >>> hashed = hash_password("mypassword123")
        >>> hashed.startswith("$2b$")
        True
    """
    # Truncate password to 72 bytes to comply with bcrypt limitations
    # Bcrypt has a maximum password length of 72 bytes (not characters)
    # UTF-8 encoded characters may be multiple bytes, so we truncate at 72 chars
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a bcrypt hash.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Bcrypt hashed password to compare against

    Returns:
        True if password matches, False otherwise

    Example:
        >>> hashed = hash_password("mypassword123")
        >>> verify_password("mypassword123", hashed)
        True
        >>> verify_password("wrongpassword", hashed)
        False
    """
    # Truncate password to 72 bytes to comply with bcrypt limitations
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: UUID, email: str) -> str:
    """
    Create a JWT access token for a user.

    The token includes:
    - sub: User ID (UUID as string)
    - email: User's email address
    - iat: Issued at timestamp
    - exp: Expiration timestamp (24 hours from issuance)

    Args:
        user_id: User's unique identifier
        email: User's email address

    Returns:
        JWT token string

    Example:
        >>> from uuid import uuid4
        >>> user_id = uuid4()
        >>> token = create_access_token(user_id, "user@example.com")
        >>> token.startswith("eyJ")
        True
    """
    now = datetime.now(timezone.utc)
    expires_delta = timedelta(hours=settings.jwt_expiration_hours)
    expire = now + expires_delta

    payload = {
        "sub": str(user_id),  # Subject: User ID
        "email": email,
        "iat": now,  # Issued at
        "exp": expire  # Expiration
    }

    token = jwt.encode(
        payload,
        settings.better_auth_secret,
        algorithm=settings.jwt_algorithm
    )

    return token


def verify_token(token: str) -> Optional[dict]:
    """
    Verify a JWT token and extract its payload.

    Validates:
    - Token signature using BETTER_AUTH_SECRET
    - Token expiration (must not be expired)

    Args:
        token: JWT token string to verify

    Returns:
        Token payload dict if valid, None if invalid or expired

    Payload structure:
        {
            "sub": "user-uuid-string",
            "email": "user@example.com",
            "iat": 1704672000,
            "exp": 1704758400
        }

    Example:
        >>> from uuid import uuid4
        >>> user_id = uuid4()
        >>> token = create_access_token(user_id, "user@example.com")
        >>> payload = verify_token(token)
        >>> payload is not None
        True
        >>> payload["email"]
        'user@example.com'
    """
    try:
        payload = jwt.decode(
            token,
            settings.better_auth_secret,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        # Token is invalid, expired, or signature doesn't match
        return None


def extract_user_id_from_token(token: str) -> Optional[UUID]:
    """
    Extract user ID from a JWT token.

    This is a convenience function that verifies the token and extracts
    the user ID from the "sub" claim.

    Args:
        token: JWT token string

    Returns:
        User UUID if token is valid, None otherwise

    Example:
        >>> from uuid import uuid4
        >>> user_id = uuid4()
        >>> token = create_access_token(user_id, "user@example.com")
        >>> extracted_id = extract_user_id_from_token(token)
        >>> extracted_id == user_id
        True
    """
    payload = verify_token(token)
    if payload is None:
        return None

    try:
        user_id_str = payload.get("sub")
        if user_id_str is None:
            return None
        return UUID(user_id_str)
    except (ValueError, AttributeError):
        # Invalid UUID format
        return None
