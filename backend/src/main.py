"""
FastAPI application entry point.

This module creates and configures the FastAPI application with:
- CORS middleware for frontend communication
- Router registration for API endpoints
- Health check endpoint
- Database initialization on startup
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from .core.config import settings
from .core.database import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    This function runs initialization tasks when the application starts up
    and cleanup tasks when the application shuts down.
    """
    # Initialize database on startup
    print("Initializing database...")
    SQLModel.metadata.create_all(bind=engine)
    print("Database initialized successfully!")
    yield
    # Cleanup on shutdown (if needed)

# Create FastAPI application with lifespan
app = FastAPI(
    title="Todo Web Application API",
    description="Authentication and task management API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan  # Add the lifespan to handle startup/shutdown events
)

# Configure CORS middleware
# Allow frontend (localhost:3000) to communicate with backend (localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development server
        "http://127.0.0.1:3000",
        "https://*.hf.space",      # Hugging Face Spaces
        "https://maryamghayas-todo-app-backend.hf.space",  # Your specific space
        "http://maryamghayas-todo-app-backend.hf.space",    # HTTP version for Hugging Face Spaces
        "https://todo-app-frontend-flame-eight.vercel.app",  # Your Vercel frontend
        "https://*.vercel.app",  # Allow all Vercel subdomains
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
    allow_headers=["*"],  # Allow all headers (including Authorization)
)

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify API is running.

    Returns:
        dict: Status message and environment
    """
    return {
        "status": "healthy",
        "environment": settings.environment,
        "version": "1.0.0"
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint with API information.

    Returns:
        dict: Welcome message and documentation links
    """
    return {
        "message": "Todo Web Application API",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health"
    }


# Register routers
from .api.auth import router as auth_router
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

from .api.tasks import router as tasks_router
app.include_router(tasks_router, prefix="/api/tasks", tags=["Tasks"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
        log_level="info"  # Enable detailed logging
    )