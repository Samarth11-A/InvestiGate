from services.llm import get_sonar_llm
from utils.logger import setup_logger
import json
import time

logger = setup_logger(__name__)

async def analyze_market(data: dict) -> dict:
    """
    Analyze company market using Perplexity Sonar.

    Args:
        data: Dict with keys: crunchbase, reddit, website, news

    Returns:
        MarketData dict with market_size, competition_level, target_segment, market_trends, summary
    """
    logger.info("🌍 Starting Market Agent analysis")
    logger.debug(f"Input data keys: {list(data.keys())}")
    start_time = time.time()

    try:
        # Get LLM with slightly higher temperature for market context
        llm = get_sonar_llm(temperature=0.3)

        # Construct prompt
        prompt = f"""
You are a startup market analyst. Analyze the provided data and extract:
- Overall market size and opportunity
- Competition level in this space
- Target customer segment
- Relevant market trends
- Market positioning and fit

Company Data: {json.dumps(data.get('crunchbase', {}), indent=2)}

Output ONLY valid JSON matching this exact schema (no markdown, no extra text):
{{
    "market_size": "string describing TAM/market size",
    "competition_level": "High" or "Medium" or "Low",
    "target_segment": "string describing primary customer segment",
    "market_trends": ["trend1", "trend2", "trend3"],
    "summary": "string summarizing market opportunity and positioning"
}}
"""

        logger.debug(f"Sending prompt to Perplexity Sonar (length: {len(prompt)} chars)")

        # Call LLM
        response = await llm.acomplete(prompt)
        response_text = str(response)

        logger.debug(f"Received response (length: {len(response_text)} chars)")
        logger.debug(f"Response preview: {response_text[:200]}...")

        # Parse JSON response
        try:
            # Try to extract JSON from response (in case there's markdown formatting)
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            result = json.loads(response_text)
            logger.info(f"✅ Market analysis completed in {time.time() - start_time:.2f}s")
            logger.debug(f"Market result: {json.dumps(result, indent=2)}")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Raw response: {response_text}")
            # Return fallback
            return {
                "market_size": "Unable to determine",
                "competition_level": "Medium",
                "target_segment": "Unable to determine",
                "market_trends": [],
                "summary": "Unable to extract market data from available sources"
            }

    except Exception as e:
        logger.error(f"❌ Market analysis failed: {str(e)}", exc_info=True)
        raise
