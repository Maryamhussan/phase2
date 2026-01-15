"""
Configuration module for loading environment variables.

This module uses Pydantic Settings to load and validate environment variables
with type safety and default values.
"""
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All settings are loaded from .env file or environment variables.
    """
    # JWT Configuration
    better_auth_secret: str = Field(
        ...,
        min_length=32,
        description="Shared secret for JWT signing/verification (min 32 chars)"
    )

    # Database Configuration
    database_url: str = Field(
        ...,
        description="PostgreSQL connection string for Neon database"
    )

    # API Configuration
    api_host: str = Field(
        default="0.0.0.0",
        description="Host address for the API server"
    )
    api_port: int = Field(
        default=8000,
        description="Port number for the API server"
    )
    api_reload: bool = Field(
        default=True,
        description="Enable auto-reload for development"
    )

    # Environment
    environment: str = Field(
        default="development",
        description="Application environment (development, staging, production)"
    )

    # JWT Settings
    jwt_algorithm: str = Field(
        default="HS256",
        description="JWT signing algorithm"
    )
    jwt_expiration_hours: int = Field(
        default=24,
        description="JWT token expiration time in hours"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
