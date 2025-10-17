from services.llm import get_sonar_pro_llm
from utils.logger import setup_logger
import json
import time

logger = setup_logger(__name__)

async def analyze_deep_market_research(data: dict) -> dict:
    """
    Conduct deep market research using Perplexity's Sonar Pro.
    Leverages web search for real-time competitive intelligence.

    Args:
        data: Dict with keys: crunchbase, reddit, website, news

    Returns:
        DeepMarketResearch dict with comprehensive market analysis
    """
    logger.info("🔍 Starting Deep Market Research Agent analysis (Sonar Pro)")
    logger.debug(f"Input data keys: {list(data.keys())}")
    start_time = time.time()

    try:
        # Get Sonar Pro LLM with higher temperature for creative analysis
        llm = get_sonar_pro_llm(temperature=0.7)

        # Extract company information
        crunchbase_data = data.get('crunchbase', {})
        company_name = crunchbase_data.get('name', 'Unknown')
        description = crunchbase_data.get('description', '')

        # Construct comprehensive prompt for deep market research
        prompt = f"""
        You are an expert venture capital market research analyst. Conduct comprehensive market research for this company:

        Company Name: {company_name}
        Description: {description}
        Company Data: {json.dumps(crunchbase_data, indent=2)}

        Provide deep market analysis with web-sourced competitive intelligence. Use your web search capabilities to find:
        - Recent market reports and data
        - Competitor information and analysis
        - Industry trends and projections
        - Regulatory landscape
        - Market opportunities

        Output valid JSON matching this exact schema:
        {{
            "market_overview": {{
                "tam": "Total Addressable Market estimate with source",
                "sam": "Serviceable Addressable Market estimate with source",
                "som": "Serviceable Obtainable Market estimate with source",
                "sources": ["source1", "source2"]
            }},
            "competitive_landscape": [
                {{
                    "name": "Competitor Name",
                    "positioning": "Market position description",
                    "strengths": ["strength1", "strength2"],
                    "weaknesses": ["weakness1", "weakness2"]
                }}
            ],
            "market_trends": [
                {{
                    "trend": "Trend name",
                    "impact": "High",
                    "description": "Detailed trend description"
                }}
            ],
            "growth_trajectory": {{
                "current_rate": "Current market growth rate",
                "projected_rate": "Projected growth rate",
                "key_drivers": ["driver1", "driver2"]
            }},
            "barriers_and_moats": {{
                "entry_barriers": ["barrier1", "barrier2"],
                "company_moats": ["moat1", "moat2"]
            }},
            "regulatory_landscape": {{
                "regulations": ["regulation1", "regulation2"],
                "compliance_requirements": ["requirement1", "requirement2"]
            }},
            "expansion_opportunities": [
                {{
                    "market": "Market/region name",
                    "potential": "High",
                    "rationale": "Why this opportunity matters"
                }}
            ],
            "market_risks": [
                {{
                    "risk": "Risk description",
                    "severity": "High",
                    "mitigation": "Potential mitigation strategy"
                }}
            ],
            "sources": [
                {{
                    "title": "Source title",
                    "url": "https://example.com",
                    "date": "2025-10-17"
                }}
            ]
        }}

        Ensure you provide at least 5-10 competitors in competitive_landscape, 5-7 trends in market_trends,
        and comprehensive citations in the sources array. Use "High", "Medium", or "Low" for impact/potential/severity fields.
        """

        logger.debug(f"Sending prompt to Perplexity Sonar Pro (length: {len(prompt)} chars)")
        logger.info("🌐 Querying web for market intelligence...")

        # Call Sonar Pro LLM with web search
        response = await llm.acomplete(prompt)
        response_text = str(response)

        logger.debug(f"Received response (length: {len(response_text)} chars)")
        logger.debug(f"Response preview: {response_text[:300]}...")

        # Parse JSON response - handle multiple formats
        try:
            # Try to extract JSON from markdown code block
            if '```json' in response_text:
                json_object = response_text.split('```json')[1].split('```')[0].strip()
                result = json.loads(json_object)
            elif '```' in response_text:
                # Try generic code block
                json_object = response_text.split('```')[1].split('```')[0].strip()
                result = json.loads(json_object)
            else:
                # Try parsing the entire response as JSON
                result = json.loads(response_text.strip())
            
            logger.debug(f"Successfully parsed JSON response")
            
            # Count sources for logging
            source_count = len(result.get('sources', []))
            competitor_count = len(result.get('competitive_landscape', []))

            logger.info(f"✅ Deep Market Research completed in {time.time() - start_time:.2f}s")
            logger.info(f"📊 Found {competitor_count} competitors and {source_count} cited sources")
            logger.debug(f"Market research result keys: {list(result.keys())}")

            return result

        except (json.JSONDecodeError, IndexError, KeyError) as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Raw response: {response_text}")

            # Return fallback structure
            logger.warning("⚠️  Returning fallback market research data")
            return {
                "market_overview": {
                    "tam": "Data unavailable",
                    "sam": "Data unavailable",
                    "som": "Data unavailable",
                    "sources": []
                },
                "competitive_landscape": [],
                "market_trends": [],
                "growth_trajectory": {
                    "current_rate": "Unknown",
                    "projected_rate": "Unknown",
                    "key_drivers": []
                },
                "barriers_and_moats": {
                    "entry_barriers": [],
                    "company_moats": []
                },
                "regulatory_landscape": {
                    "regulations": [],
                    "compliance_requirements": []
                },
                "expansion_opportunities": [],
                "market_risks": [],
                "sources": []
            }

    except Exception as e:
        logger.error(f"❌ Deep Market Research analysis failed: {str(e)}", exc_info=True)
        raise
