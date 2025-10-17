from services.llm import get_sonar_llm, get_sonar_pro_llm
from utils.logger import setup_logger
import json
import time

logger = setup_logger(__name__)

async def synthesize_analysis(
    traction: dict,
    team: dict,
    market: dict,
    deep_market_research: dict,
    risks: dict,
    company_name: str
) -> dict:
    """
    Synthesize all analyses into final investment report.
    Calculate indicators and generate overall outlook.

    Args:
        traction: Traction analysis results
        team: Team analysis results
        market: Market analysis results
        deep_market_research: Deep market research results
        risks: Risk analysis results
        company_name: Name of the company

    Returns:
        Dict with indicators and outlook
    """
    logger.info("🎯 Starting Synthesis Agent analysis")
    logger.debug(f"Synthesizing analysis for: {company_name}")
    start_time = time.time()

    try:
        # Get Sonar LLM with moderate temperature for balanced synthesis
        llm = get_sonar_pro_llm(temperature=0.3)

        # Construct comprehensive synthesis prompt
        prompt = f"""
        You are an expert venture capital analyst. Synthesize these analyses into a final investment thesis for {company_name}.

        TRACTION ANALYSIS:
        {json.dumps(traction, indent=2)}

        TEAM ANALYSIS:
        {json.dumps(team, indent=2)}

        MARKET ANALYSIS (BASIC):
        {json.dumps(market, indent=2)}

        DEEP MARKET RESEARCH (with web sources):
        {json.dumps(deep_market_research, indent=2)}

        RISK ANALYSIS:
        {json.dumps(risks, indent=2)}

        Based on all the above analyses, provide:

        1. **Indicators** (0-100 scale):
           - growth: Based on traction metrics, revenue growth, user growth, market position
           - team: Based on founder experience, team composition, domain expertise
           - market: Based on market size (TAM/SAM/SOM), growth trajectory, competitive landscape
           - product: Based on product-market fit indicators, differentiation, technological moats

        2. **Overall Outlook**:
           - overall: "Strong", "Moderate", or "Weak"
           - summary: 2-3 sentence investment thesis
           - keyPoints: 5-7 key actionable insights for investment decision

        Output valid JSON matching this exact schema:
        {{
            "indicators": {{
                "growth": 0-100,
                "team": 0-100,
                "market": 0-100,
                "product": 0-100
            }},
            "outlook": {{
                "overall": "Strong" | "Moderate" | "Weak",
                "summary": "Comprehensive investment thesis summary",
                "keyPoints": [
                    "Key insight 1",
                    "Key insight 2",
                    "Key insight 3",
                    "Key insight 4",
                    "Key insight 5"
                ]
            }}
        }}

        Guidelines for scoring:
        - Growth (0-100): Consider revenue trajectory, user growth, market penetration, milestones achieved
        - Team (0-100): Evaluate founder track record, technical expertise, domain knowledge, team completeness
        - Market (0-100): Assess market size, growth rate, competitive positioning, market timing
        - Product (0-100): Analyze product-market fit, differentiation, barriers to entry, technological advantage

        Guidelines for outlook:
        - "Strong": High confidence in success, multiple positive indicators, clear path to scale
        - "Moderate": Mixed signals, some concerns but overall positive, requires monitoring
        - "Weak": Significant concerns, high risks, limited upside potential

        Ensure keyPoints are actionable and specific to this company's situation.
        """

        logger.debug(f"Sending synthesis prompt to Perplexity Sonar (length: {len(prompt)} chars)")
        logger.info("🔄 Synthesizing all analyses...")

        # Call LLM
        response = await llm.acomplete(prompt)
        response_text = str(response)

        logger.debug(f"Received synthesis response (length: {len(response_text)} chars)")
        logger.debug(f"Response preview: {response_text[:300]}...")

        # Parse JSON response
        try:
            result = json.loads(response_text)

            # Validate structure
            if 'indicators' not in result or 'outlook' not in result:
                raise ValueError("Missing required fields in synthesis response")

            indicators = result['indicators']
            outlook = result['outlook']

            # Log synthesis results
            logger.info(f"✅ Synthesis completed in {time.time() - start_time:.2f}s")
            logger.info(f"📊 Indicators - Growth: {indicators.get('growth', 0)}, Team: {indicators.get('team', 0)}, Market: {indicators.get('market', 0)}, Product: {indicators.get('product', 0)}")
            logger.info(f"🎯 Overall Outlook: {outlook.get('overall', 'Unknown')}")
            logger.debug(f"Synthesis result: {json.dumps(result, indent=2)}")

            return result

        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse synthesis response as JSON: {e}")
            logger.error(f"Raw response: {response_text}")

            # Return fallback synthesis with basic scoring
            logger.warning("⚠️  Returning fallback synthesis with estimated scores")

            # Calculate fallback scores based on available data
            growth_score = 50  # Default moderate
            team_score = 50
            market_score = 50
            product_score = 50

            # Try to improve scores based on analysis content
            if traction.get('revenue') or traction.get('users'):
                growth_score = 60
            if len(team.get('founders', [])) > 0:
                team_score = 60
            if market.get('market_size') and 'billion' in market.get('market_size', '').lower():
                market_score = 65
            if deep_market_research.get('competitive_landscape') and len(deep_market_research['competitive_landscape']) > 0:
                market_score = 70
            if risks.get('overall_risk_level') == 'Low':
                product_score = 65
            elif risks.get('overall_risk_level') == 'High':
                product_score = 40

            # Determine overall outlook
            avg_score = (growth_score + team_score + market_score + product_score) / 4
            if avg_score >= 70:
                overall = "Strong"
            elif avg_score >= 50:
                overall = "Moderate"
            else:
                overall = "Weak"

            return {
                "indicators": {
                    "growth": growth_score,
                    "team": team_score,
                    "market": market_score,
                    "product": product_score
                },
                "outlook": {
                    "overall": overall,
                    "summary": f"Comprehensive analysis complete for {company_name}. Based on available data, the company shows {overall.lower()} potential.",
                    "keyPoints": [
                        f"Traction: {traction.get('summary', 'Analyzed')}",
                        f"Team: {team.get('summary', 'Analyzed')}",
                        f"Market: {market.get('summary', 'Analyzed')}",
                        f"Risk Level: {risks.get('overall_risk_level', 'Unknown')}",
                        "Detailed synthesis unavailable - review individual sections"
                    ]
                }
            }

    except Exception as e:
        logger.error(f"❌ Synthesis analysis failed: {str(e)}", exc_info=True)
        raise
