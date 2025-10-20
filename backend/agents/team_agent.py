from services.llm import get_sonar_llm
from config import config
from utils.logger import setup_logger
import json
import time
import httpx

logger = setup_logger(__name__)


async def analyze_team_with_fireplexity(data: dict) -> dict:
    """
    Analyze company team using Firecrawl search (Fireplexity approach).
    
    Args:
        data: Dict with keys: crunchbase, reddit, website, news
        
    Returns:
        TeamData dict with founders, key_members, advisors, summary
    """
    logger.info("� Using Fireplexity (Firecrawl search) for team analysis")
    
    try:
        # Extract company name from crunchbase data
        company_name = data.get('crunchbase', {}).get('name', 'Unknown Company')
        
        # Construct search query for team analysis
        query = f"{company_name} founders CEO team executives leadership background experience"
        
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
            You are a startup team analyst. Analyze the provided sources about {company_name} and extract:
            - Founder backgrounds and experience
            - Key team members and advisors
            - Technical expertise
            - Domain knowledge
            - Previous startup experience

            Company Data: {json.dumps(data.get('crunchbase', {}), indent=2)}

            Sources:
            {context}

            Output ONLY valid JSON matching this exact schema (no markdown, no extra text):
            {{
                "founders": [{{"name": "string", "background": "string"}}],
                "key_members": ["string"],
                "advisors": ["string"],
                "summary": "string"
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
            logger.info(f"✅ Fireplexity team analysis completed")
            return result
            
    except Exception as e:
        logger.error(f"❌ Fireplexity analysis failed: {str(e)}")
        raise


async def analyze_team_with_perplexity(data: dict) -> dict:
    """
    Fallback: Analyze company team using Perplexity Sonar directly.
    
    Args:
        data: Dict with keys: crunchbase, reddit, website, news
        
    Returns:
        TeamData dict with founders, key_members, advisors, summary
    """
    logger.info("🔄 Using Perplexity Sonar (fallback) for team analysis")
    
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

        # Parse JSON response
        try:
            # Try to extract JSON from response (in case there's markdown formatting)
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            result = json.loads(response_text)
            logger.info(f"✅ Perplexity team analysis completed")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Raw response: {response_text}")
            raise

    except Exception as e:
        logger.error(f"❌ Perplexity analysis failed: {str(e)}", exc_info=True)
        raise


async def analyze_team(data: dict) -> dict:
    """
    Analyze company team. Tries Fireplexity first, falls back to Perplexity.

    Args:
        data: Dict with keys: crunchbase, reddit, website, news

    Returns:
        TeamData dict with founders, key_members, advisors, summary
    """
    logger.info("👥 Starting Team Agent analysis")
    logger.debug(f"Input data keys: {list(data.keys())}")
    start_time = time.time()

    try:
        # Try Fireplexity first
        try:
            result = await analyze_team_with_fireplexity(data)
            logger.info(f"✅ Team analysis completed with Fireplexity in {time.time() - start_time:.2f}s")
            logger.debug(f"Team result: {json.dumps(result, indent=2)}")
            return result
        except Exception as fireplexity_error:
            logger.warning(f"Fireplexity failed, falling back to Perplexity: {str(fireplexity_error)}")
            
            # Fallback to Perplexity
            result = await analyze_team_with_perplexity(data)
            logger.info(f"✅ Team analysis completed with Perplexity (fallback) in {time.time() - start_time:.2f}s")
            logger.debug(f"Team result: {json.dumps(result, indent=2)}")
            return result

    except Exception as e:
        logger.error(f"❌ All team analysis methods failed: {str(e)}", exc_info=True)
        # Return fallback structure
        return {
            "founders": [],
            "key_members": [],
            "advisors": [],
            "summary": "Unable to extract team data from available sources"
        }
