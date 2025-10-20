from services.llm import get_sonar_llm
from config import config
from utils.logger import setup_logger
import json
import time
import httpx

logger = setup_logger(__name__)


async def analyze_risks_with_fireplexity(data: dict) -> dict:
    """
    Analyze company risks using Firecrawl search (Fireplexity approach).
    
    Args:
        data: Dict with keys: crunchbase, reddit, website, news
        
    Returns:
        RiskData dict with technical_risks, market_risks, team_risks, financial_risks, red_flags, summary
    """
    logger.info("🔥 Using Fireplexity (Firecrawl search) for risk analysis")
    
    try:
        # Extract company name from crunchbase data
        company_name = data.get('crunchbase', {}).get('name', 'Unknown Company')
        
        # Construct search query for risk analysis
        query = f"{company_name} risks challenges problems controversies failures issues concerns"
        
        logger.debug(f"Fireplexity search query: {query}")
        
        # Call Firecrawl v2 search API directly
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                'https://api.firecrawl.dev/v2/search',
                headers={
                    'Authorization': f'Bearer {config.FIRECRAWL_API_KEY}',
                    'Content-Type': 'application/json'
                },
                json={
                    'query': query,
                    'sources': ['web', 'news'],
                    'limit': 5,
                    'scrapeOptions': {
                        'formats': ['markdown'],
                        'onlyMainContent': True,
                        'maxAge': 86400000  # 24 hours
                    }
                }
            )
            
            if response.status_code != 200:
                error_data = response.json() if response.text else {}
                logger.warning(f"Firecrawl API returned status {response.status_code}: {error_data}")
                raise Exception(f"Firecrawl API error: {response.status_code}")
            
            search_result = response.json()
            search_data = search_result.get('data', {})
            
            # Extract sources from search results
            sources = search_data.get('web', [])
            news_sources = search_data.get('news', [])
            all_sources = sources + news_sources
            
            if not all_sources:
                logger.warning("No sources found from Firecrawl search")
                raise Exception("No sources found")
            
            logger.info(f"✅ Found {len(all_sources)} sources from Firecrawl")
            
            # Prepare context from sources
            context = ""
            for idx, source in enumerate(all_sources[:5], 1):
                title = source.get('title', 'No title')
                content = source.get('markdown', source.get('content', ''))[:1000]  # Limit content
                context += f"[{idx}] {title}\n{content}\n\n"
            
            # Now use LLM to analyze the context
            llm = get_sonar_llm(temperature=0.2)
            
            prompt = f"""
            You are a startup risk analyst specializing in venture capital due diligence. Analyze the provided sources about {company_name} and identify:
            - Technical risks and challenges
            - Market and competitive risks
            - Team and execution risks
            - Financial risks and concerns
            - Any red flags or warning signs

            Company Data: {json.dumps(data.get('crunchbase', {}), indent=2)}

            Sources:
            {context}

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
            
            logger.debug(f"Sending prompt to LLM (length: {len(prompt)} chars)")
            response = await llm.acomplete(prompt)
            response_text = str(response)
            
            # Parse JSON response
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            result = json.loads(response_text)
            logger.info(f"✅ Fireplexity risk analysis completed")
            return result
            
    except Exception as e:
        logger.error(f"❌ Fireplexity analysis failed: {str(e)}")
        raise


async def analyze_risks_with_perplexity(data: dict) -> dict:
    """
    Fallback: Analyze company risks using Perplexity Sonar directly.
    
    Args:
        data: Dict with keys: crunchbase, reddit, website, news
        
    Returns:
        RiskData dict with technical_risks, market_risks, team_risks, financial_risks, red_flags, summary
    """
    logger.info("🔄 Using Perplexity Sonar (fallback) for risk analysis")
    
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

        # Parse JSON response
        try:
            # Try to extract JSON from response (in case there's markdown formatting)
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            result = json.loads(response_text)
            logger.info(f"✅ Perplexity risk analysis completed")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Raw response: {response_text}")
            raise

    except Exception as e:
        logger.error(f"❌ Perplexity analysis failed: {str(e)}", exc_info=True)
        raise


async def analyze_risks(data: dict) -> dict:
    """
    Analyze company risks. Tries Fireplexity first, falls back to Perplexity.

    Args:
        data: Dict with keys: crunchbase, reddit, website, news

    Returns:
        RiskData dict with technical_risks, market_risks, team_risks, financial_risks, red_flags, summary
    """
    logger.info("⚠️  Starting Risk Agent analysis")
    logger.debug(f"Input data keys: {list(data.keys())}")
    start_time = time.time()

    try:
        # Try Fireplexity first
        try:
            result = await analyze_risks_with_fireplexity(data)
            logger.info(f"✅ Risk analysis completed with Fireplexity in {time.time() - start_time:.2f}s")
            logger.debug(f"Risk result: {json.dumps(result, indent=2)}")
            return result
        except Exception as fireplexity_error:
            logger.warning(f"Fireplexity failed, falling back to Perplexity: {str(fireplexity_error)}")
            
            # Fallback to Perplexity
            result = await analyze_risks_with_perplexity(data)
            logger.info(f"✅ Risk analysis completed with Perplexity (fallback) in {time.time() - start_time:.2f}s")
            logger.debug(f"Risk result: {json.dumps(result, indent=2)}")
            return result

    except Exception as e:
        logger.error(f"❌ All risk analysis methods failed: {str(e)}", exc_info=True)
        # Return fallback structure
        return {
            "technical_risks": ["Unable to assess technical risks"],
            "market_risks": ["Unable to assess market risks"],
            "team_risks": ["Unable to assess team risks"],
            "financial_risks": ["Unable to assess financial risks"],
            "red_flags": [],
            "overall_risk_level": "Medium",
            "summary": "Unable to extract risk data from available sources"
        }
