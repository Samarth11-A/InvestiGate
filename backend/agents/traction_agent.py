from services.llm import get_sonar_llm
from utils.logger import setup_logger
import json
import time
import httpx
import config

logger = setup_logger(__name__)

async def analyze_traction_with_fireplexity(data: dict) -> dict:
    """
    Analyze company traction using Fireplexity (Firecrawl v2 Search API + LLM).
    
    Args:
        data: Dict with keys: crunchbase, reddit, website, news
        
    Returns:
        TractionData dict with revenue, users, growth_rate, milestones, summary,
        employee_count, funding_stage, total_raised, recent_round
    """
    logger.info("📊 Starting Traction Agent analysis with Fireplexity")
    logger.debug(f"Input data keys: {list(data.keys())}")
    start_time = time.time()
    
    try:
        # Extract structured Crunchbase data
        crunchbase_data = data.get('crunchbase', {})
        company_name = crunchbase_data.get('name', 'Unknown Company')
        
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
        total_raised = funding_amount if funding_amount != 'Not disclosed' else funding_raw
        logger.info(f"Found funding data: {total_raised}")
        
        # Step 1: Search with Firecrawl v2 API
        search_query = f"{company_name} revenue ARR users growth metrics milestones funding traction"
        logger.info(f"Searching with Firecrawl: {search_query}")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            search_response = await client.post(
                "https://api.firecrawl.dev/v2/search",
                json={
                    "query": search_query,
                    "limit": 5,
                    "tbs": "qdr:y",  # Last year for recent traction data
                    "lang": "en",
                    "country": "us",
                    "location": "United States",
                    "timeout": 60000,
                    "scrapeOptions": {
                        "formats": ["markdown"]
                    }
                },
                headers={
                    "Authorization": f"Bearer {config.FIRECRAWL_API_KEY}",
                    "Content-Type": "application/json"
                }
            )
            search_response.raise_for_status()
            search_results = search_response.json()
        
        logger.info(f"Firecrawl search completed, found {len(search_results.get('data', []))} results")
        
        # Step 2: Extract search results
        search_data = []
        for item in search_results.get('data', []):
            search_data.append({
                'url': item.get('url', ''),
                'title': item.get('title', ''),
                'description': item.get('description', ''),
                'markdown': item.get('markdown', '')[:1000]  # Limit markdown length
            })
        
        # Step 3: Use LLM to analyze combined data
        llm = get_sonar_llm(temperature=0.2)
        
        prompt = f"""
            You are a startup traction analyst. Analyze the provided data and extract:
            - Revenue/ARR metrics
            - User growth numbers
            - Key milestones achieved
            - Product-market fit indicators
            - Funding stage (e.g., Seed, Series A, Series B, etc.)
            - Recent funding round information

            Crunchbase Data: {json.dumps(crunchbase_data, indent=2)}

            Recent Web Search Results: {json.dumps(search_data, indent=2)}

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
        response = await llm.acomplete(prompt)
        response_text = str(response)
        
        logger.debug(f"Received response (length: {len(response_text)} chars)")
        
        # Parse JSON response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        
        # Add structured Crunchbase fields
        result['employee_count'] = employee_count
        result['total_raised'] = total_raised if total_raised != 'Not disclosed' else None
        
        if 'funding_stage' not in result:
            result['funding_stage'] = None
        if 'recent_round' not in result:
            result['recent_round'] = None
        
        logger.info(f"✅ Traction analysis with Fireplexity completed in {time.time() - start_time:.2f}s")
        logger.debug(f"Traction result: {json.dumps(result, indent=2)}")
        return result
        
    except Exception as e:
        logger.error(f"❌ Fireplexity traction analysis failed: {str(e)}", exc_info=True)
        raise


async def analyze_traction_with_perplexity(data: dict) -> dict:
    """
    Analyze company traction using Perplexity Sonar (fallback method).

    Args:
        data: Dict with keys: crunchbase, reddit, website, news

    Returns:
        TractionData dict with revenue, users, growth_rate, milestones, summary,
        employee_count, funding_stage, total_raised, recent_round
    """
    logger.info("📊 Starting Traction Agent analysis with Perplexity (fallback)")
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
        total_raised = funding_amount if funding_amount != 'Not disclosed' else funding_raw
        logger.info(f"Found funding data: {total_raised}")

        # Get LLM
        llm = get_sonar_llm(temperature=0.2)

        # Construct prompt
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
        response = await llm.acomplete(prompt)
        response_text = str(response)

        logger.debug(f"Received response (length: {len(response_text)} chars)")

        # Parse JSON response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        result = json.loads(response_text)

        # Add structured Crunchbase fields
        result['employee_count'] = employee_count
        result['total_raised'] = total_raised if total_raised != 'Not disclosed' else None

        if 'funding_stage' not in result:
            result['funding_stage'] = None
        if 'recent_round' not in result:
            result['recent_round'] = None

        logger.info(f"✅ Traction analysis with Perplexity completed in {time.time() - start_time:.2f}s")
        logger.debug(f"Traction result: {json.dumps(result, indent=2)}")
        return result

    except Exception as e:
        logger.error(f"❌ Perplexity traction analysis failed: {str(e)}", exc_info=True)
        raise


async def analyze_traction(data: dict) -> dict:
    """
    Analyze company traction with Fireplexity as primary and Perplexity as fallback.
    
    Args:
        data: Dict with keys: crunchbase, reddit, website, news
        
    Returns:
        TractionData dict with revenue, users, growth_rate, milestones, summary,
        employee_count, funding_stage, total_raised, recent_round
    """
    try:
        # Try Fireplexity first
        return await analyze_traction_with_fireplexity(data)
    except Exception as e:
        logger.warning(f"Fireplexity failed, falling back to Perplexity: {str(e)}")
        try:
            # Fallback to Perplexity
            return await analyze_traction_with_perplexity(data)
        except Exception as fallback_error:
            logger.error(f"Both Fireplexity and Perplexity failed: {str(fallback_error)}")
            # Return safe fallback with structured fields
            crunchbase_data = data.get('crunchbase', {})
            employee_count = crunchbase_data.get('employee_count')
            funding_amount = crunchbase_data.get('funding_amount', 'Not disclosed')
            funding_raw = crunchbase_data.get('funding', 'Not disclosed')
            total_raised = funding_amount if funding_amount != 'Not disclosed' else funding_raw
            
            return {
                "revenue": None,
                "users": None,
                "growth_rate": None,
                "milestones": [],
                "summary": "Unable to extract traction data from available sources",
                "employee_count": employee_count if isinstance(employee_count, int) else None,
                "funding_stage": None,
                "total_raised": total_raised if total_raised != 'Not disclosed' else None,
                "recent_round": None
            }
