from llama_index.llms.perplexity import Perplexity
from config import config
from utils.logger import setup_logger

logger = setup_logger(__name__)

def get_sonar_llm(temperature: float = 0.2):
    """
    Get Perplexity Sonar (basic) for standard analysis.
    Used for: Traction, Team, Market, Risk, Synthesis agents.

    Args:
        temperature: Controls randomness in responses (0.0-1.0)

    Returns:
        Perplexity LLM instance configured with Sonar model
    """
    logger.debug(f"Creating Sonar LLM instance (temperature={temperature})")
    return Perplexity(
        api_key=config.PPLX_API_KEY,
        model="sonar",
        temperature=temperature
    )

def get_sonar_pro_llm(temperature: float = 0.7):
    """
    Get Perplexity Sonar Pro (reasoning) for deep research.
    Used for: Deep Market Research agent (Phase 7).

    Args:
        temperature: Controls randomness in responses (0.0-1.0)

    Returns:
        Perplexity LLM instance configured with Sonar Pro model
    """
    logger.debug(f"Creating Sonar Pro LLM instance (temperature={temperature})")
    return Perplexity(
        api_key=config.PPLX_API_KEY,
        model="sonar-pro",
        temperature=temperature
    )
