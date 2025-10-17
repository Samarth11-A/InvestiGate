from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import config
from utils.logger import setup_logger
import os

logger = setup_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("=" * 80)
    logger.info("🚀 Starting AI Fund Scan Backend API")
    logger.info("=" * 80)

    # Create logs directory if it doesn't exist
    os.makedirs("logs", exist_ok=True)

    # Validate config
    try:
        config.validate()
    except ValueError as e:
        logger.error(f"Configuration validation failed: {e}")
        raise

    logger.info(f"Server starting on http://{config.HOST}:{config.PORT}")
    logger.info(f"CORS origins: {config.CORS_ORIGINS}")

    yield

    logger.info("=" * 80)
    logger.info("👋 Shutting down AI Fund Scan Backend API")
    logger.info("=" * 80)

app = FastAPI(
    title="AI Fund Scan API",
    description="Company analysis API with HITL workflow",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
from api.routes import router as api_router
app.include_router(api_router)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """
    Health check endpoint to verify backend is running.
    Phase 8: Complete analysis workflow with all agents and synthesis.
    """
    logger.debug("Health check endpoint called")
    return {
        "status": "ok",
        "phase": "8 - Complete Analysis Workflow (All Agents + Synthesis)",
        "endpoints_available": ["/api/health", "/api/search", "/api/analyze"],
        "workflow_stages": ["Data Collection", "5 Parallel Agents", "Synthesis"],
        "agents_active": [
            "Traction (Sonar)",
            "Team (Sonar)",
            "Market (Sonar)",
            "Risk (Sonar)",
            "Deep Market Research (Sonar Pro)",
            "Synthesis (Sonar)"
        ],
        "features": [
            "Real-time web search (Sonar Pro)",
            "Competitive intelligence",
            "Cited sources",
            "Intelligent indicator calculation",
            "Investment thesis generation"
        ]
    }

@app.get("/")
async def root():
    """Root endpoint"""
    logger.debug("Root endpoint called")
    return {
        "message": "AI Fund Scan API",
        "version": "0.1.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.RELOAD
    )
