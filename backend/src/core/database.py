"""
Database connection and session management.

This module provides database connectivity to Neon PostgreSQL using SQLModel.
"""
from sqlmodel import Session, create_engine
from ..core.config import settings


# Create database engine
# connect_args for PostgreSQL (not needed for most cases, but included for completeness)
engine = create_engine(
    settings.database_url,
    echo=settings.environment == "development",  # Log SQL queries in development
    pool_pre_ping=True,  # Verify connections before using them
)


def get_session():
    """
    Dependency function to get a database session.

    Yields a SQLModel Session that automatically commits on success
    and rolls back on exceptions.

    Usage:
        @router.get("/users")
        async def get_users(session: Session = Depends(get_session)):
            users = session.exec(select(User)).all()
            return users
    """
    with Session(engine) as session:
        yield session
