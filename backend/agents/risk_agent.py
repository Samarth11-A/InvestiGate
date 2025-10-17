from services.llm import get_sonar_llm
from utils.logger import setup_logger
import json
import time

logger = setup_logger(__name__)

async def analyze_risks(data: dict) -> dict:
    """
    Analyze company risks using Perplexity Sonar.

    Args:
        data: Dict with keys: crunchbase, reddit, website, news

    Returns:
        RiskData dict with technical_risks, market_risks, team_risks, financial_risks, red_flags, summary
    """
    logger.info("⚠️  Starting Risk Agent analysis")
    logger.debug(f"Input data keys: {list(data.keys())}")
    start_time = time.time()

    try:
        # Get LLM with low temperature for consistent risk assessment
        llm = get_sonar_llm(temperature=0.2)

        # Construct prompt
        prompt = f"""
You are a startup risk analyst specializing in venture capital due diligence. Analyze the provided data and identify:
- Technical risks and challenges
- Market and competitive risks
- Team and execution risks
- Financial risks and concerns
- Any red flags or warning signs

Company Data: {json.dumps(data.get('crunchbase', {}), indent=2)}

Output ONLY valid JSON matching this exact schema (no markdown, no extra text):
{{
    "technical_risks": ["risk1", "risk2", "risk3"],
    "market_risks": ["risk1", "risk2", "risk3"],
    "team_risks": ["risk1", "risk2"],
    "financial_risks": ["risk1", "risk2"],
    "red_flags": ["flag1", "flag2"],
    "overall_risk_level": "High" or "Medium" or "Low",
    "summary": "string summarizing key risks and concerns"
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
            logger.info(f"✅ Risk analysis completed in {time.time() - start_time:.2f}s")
            logger.debug(f"Risk result: {json.dumps(result, indent=2)}")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Raw response: {response_text}")
            # Return fallback
            return {
                "technical_risks": ["Unable to assess technical risks"],
                "market_risks": ["Unable to assess market risks"],
                "team_risks": ["Unable to assess team risks"],
                "financial_risks": ["Unable to assess financial risks"],
                "red_flags": [],
                "overall_risk_level": "Medium",
                "summary": "Unable to extract risk data from available sources"
            }

    except Exception as e:
        logger.error(f"❌ Risk analysis failed: {str(e)}", exc_info=True)
        raise
