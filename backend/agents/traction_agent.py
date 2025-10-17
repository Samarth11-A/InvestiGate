from services.llm import get_sonar_llm
from utils.logger import setup_logger
import json
import time

logger = setup_logger(__name__)

async def analyze_traction(data: dict) -> dict:
    """
    Analyze company traction using Perplexity Sonar.

    Args:
        data: Dict with keys: crunchbase, reddit, website, news

    Returns:
        TractionData dict with revenue, users, growth_rate, milestones, summary,
        employee_count, funding_stage, total_raised, recent_round
    """
    logger.info("📊 Starting Traction Agent analysis")
    logger.debug(f"Input data keys: {list(data.keys())}")
    start_time = time.time()

    try:
        # Extract structured Crunchbase data
        crunchbase_data = data.get('crunchbase', {})

        # Get employee count directly from Crunchbase
        employee_count = crunchbase_data.get('employee_count')
        if employee_count and isinstance(employee_count, int):
            logger.info(f"Found employee_count from Crunchbase: {employee_count}")
        else:
            employee_count = None
            logger.warning(f"No valid employee_count in Crunchbase data")

        # Parse funding information from Crunchbase
        funding_raw = crunchbase_data.get('funding', 'Not disclosed')
        funding_amount = crunchbase_data.get('funding_amount', 'Not disclosed')

        # Use funding_amount if available, otherwise fall back to funding
        total_raised = funding_amount if funding_amount != 'Not disclosed' else funding_raw

        logger.info(f"Found funding data: {total_raised}")

        # Get LLM
        llm = get_sonar_llm(temperature=0.2)

        # Construct prompt - now asking for funding stage and recent round too
        prompt = f"""
You are a startup traction analyst. Analyze the provided data and extract:
- Revenue/ARR metrics
- User growth numbers
- Key milestones achieved
- Product-market fit indicators
- Funding stage (e.g., Seed, Series A, Series B, etc.)
- Recent funding round information

Company Data: {json.dumps(crunchbase_data, indent=2)}

Output ONLY valid JSON matching this exact schema (no markdown, no extra text):
{{
    "revenue": "string or null",
    "users": "string or null",
    "growth_rate": "string or null",
    "milestones": ["string"],
    "summary": "string",
    "funding_stage": "string or null (e.g., Seed, Series A, Pre-seed, etc.)",
    "recent_round": "string or null (most recent funding round amount and details)"
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

            # Add structured Crunchbase fields to result
            result['employee_count'] = employee_count
            result['total_raised'] = total_raised if total_raised != 'Not disclosed' else None

            # Ensure funding_stage and recent_round from LLM are included
            if 'funding_stage' not in result:
                result['funding_stage'] = None
            if 'recent_round' not in result:
                result['recent_round'] = None

            logger.info(f"✅ Traction analysis completed in {time.time() - start_time:.2f}s")
            logger.debug(f"Traction result: {json.dumps(result, indent=2)}")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Raw response: {response_text}")
            # Return fallback with structured fields
            return {
                "revenue": None,
                "users": None,
                "growth_rate": None,
                "milestones": [],
                "summary": "Unable to extract traction data from available sources",
                "employee_count": employee_count,
                "funding_stage": None,
                "total_raised": total_raised if total_raised != 'Not disclosed' else None,
                "recent_round": None
            }

    except Exception as e:
        logger.error(f"❌ Traction analysis failed: {str(e)}", exc_info=True)
        raise
