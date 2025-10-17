from services.llm import get_sonar_llm
from utils.logger import setup_logger
import json
import time

logger = setup_logger(__name__)

async def analyze_team(data: dict) -> dict:
    """
    Analyze company team using Perplexity Sonar.

    Args:
        data: Dict with keys: crunchbase, reddit, website, news

    Returns:
        TeamData dict with founders, key_members, advisors, summary
    """
    logger.info("👥 Starting Team Agent analysis")
    logger.debug(f"Input data keys: {list(data.keys())}")
    start_time = time.time()

    try:
        # Get LLM
        llm = get_sonar_llm(temperature=0.2)

        # Construct prompt
        prompt = f"""
You are a startup team analyst. Analyze the provided data and extract:
- Founder backgrounds and experience
- Key team members and advisors
- Technical expertise
- Domain knowledge
- Previous startup experience

Company Data: {json.dumps(data.get('crunchbase', {}), indent=2)}

Output ONLY valid JSON matching this exact schema (no markdown, no extra text):
{{
    "founders": [{{"name": "string", "background": "string"}}],
    "key_members": ["string"],
    "advisors": ["string"],
    "summary": "string"
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
            logger.info(f"✅ Team analysis completed in {time.time() - start_time:.2f}s")
            logger.debug(f"Team result: {json.dumps(result, indent=2)}")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Raw response: {response_text}")
            # Return fallback
            return {
                "founders": [],
                "key_members": [],
                "advisors": [],
                "summary": "Unable to extract team data from available sources"
            }

    except Exception as e:
        logger.error(f"❌ Team analysis failed: {str(e)}", exc_info=True)
        raise
