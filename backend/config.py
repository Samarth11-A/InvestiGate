import os
from dotenv import load_dotenv
from utils.logger import setup_logger

load_dotenv()
logger = setup_logger(__name__)

class Config:
    # API Keys
    PPLX_API_KEY = os.getenv("PPLX_API_KEY")
    FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")

    # Server Config
    HOST = "0.0.0.0"
    PORT = 8000
    RELOAD = True

    # CORS
    CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"]

    def validate(self):
        """Validate required environment variables"""
        logger.info("Validating configuration...")
        missing = []

        # Check API keys
        if not self.FIRECRAWL_API_KEY:
            missing.append("FIRECRAWL_API_KEY")

        # Phase 3+: Perplexity required for analysis
        if not self.PPLX_API_KEY:
            missing.append("PPLX_API_KEY")

        if missing:
            logger.error(f"Missing required environment variables: {missing}")
            raise ValueError(f"Missing environment variables: {missing}")

        logger.info("Configuration validated successfully")

config = Config()
