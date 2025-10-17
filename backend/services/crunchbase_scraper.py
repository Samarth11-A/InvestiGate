from firecrawl import Firecrawl
from typing import List, Dict, Optional
from config import config
from utils.logger import setup_logger
from pydantic import BaseModel
import json
import asyncio

logger = setup_logger(__name__)

class CrunchbaseScraperError(Exception):
    """Custom exception for scraper errors"""
    pass

class CrunchbaseJsonSchema(BaseModel):
    """Schema for Crunchbase company data extraction"""
    company_name: str
    company_description: str
    mission: str
    founders: str
    funding_amount: str
    employee_count: int

def search_crunchbase(query: str, limit: int = 5) -> List[Dict]:
    """
    Search Crunchbase for companies matching the query using Firecrawl search API.

    Args:
        query: Company name or URL
        limit: Max results to return (default 5)

    Returns:
        List of company search results with url, title, description fields

    Raises:
        CrunchbaseScraperError: If search fails
    """
    logger.info(f"🔍 Starting Crunchbase search for query: '{query}'")
    logger.debug(f"Search parameters: limit={limit}")

    try:
        # Initialize Firecrawl
        logger.debug("Initializing Firecrawl client")
        firecrawl = Firecrawl(api_key=config.FIRECRAWL_API_KEY)

        # Search Crunchbase using Firecrawl's search API
        logger.info(f"Searching Crunchbase via Firecrawl...")
        response = firecrawl.search(query=f"site:crunchbase.com {query}", limit=limit)

        if not response:
            logger.warning("⚠️  No response from Firecrawl search")
            raise CrunchbaseScraperError("Empty response from Firecrawl")

        # Extract results from response
        results = []
        
        # Handle different response formats
        if hasattr(response, 'data'):
            raw_results = response.data
        elif hasattr(response, 'web'):
            raw_results = response.web
        else:
            try:
                response_dict = dict(response) if not isinstance(response, dict) else response
                raw_results = response_dict.get('web', response_dict.get('data', []))
            except:
                logger.error("⚠️  Unable to parse Firecrawl response format")
                raise CrunchbaseScraperError("Invalid response format from Firecrawl")

        if not raw_results:
            logger.warning("⚠️  No results found in Firecrawl response")
            return []

        # Process results
        logger.debug(f"Processing {len(raw_results)} raw results")
        for item in raw_results[:limit]:
            # Extract fields from response item
            url = item.url if hasattr(item, 'url') else (item.get('url') if isinstance(item, dict) else None)
            title = item.title if hasattr(item, 'title') else (item.get('title') if isinstance(item, dict) else None)
            description = item.description if hasattr(item, 'description') else (item.get('description') if isinstance(item, dict) else None)
            
            if url:
                results.append({
                    'url': url,
                    'title': title,
                    'description': description
                })

        logger.info(f"✅ Found {len(results)} companies matching '{query}'")
        logger.debug(f"Search results: {json.dumps(results, indent=2)}")

        return results

    except Exception as e:
        logger.error(f"❌ Crunchbase search failed: {str(e)}", exc_info=True)
        raise CrunchbaseScraperError(f"Search failed: {str(e)}") from e


def convert_to_serializable(obj):
    """Convert objects to JSON-serializable format."""
    if isinstance(obj, (str, int, float, bool, type(None))):
        return obj
    elif isinstance(obj, dict):
        return {k: convert_to_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_to_serializable(item) for item in obj]
    elif hasattr(obj, '__dict__'):
        return convert_to_serializable(obj.__dict__)
    else:
        return str(obj)


async def scrape_company_url(url: str, max_retries: int = 2, timeout_seconds: int = 30) -> Dict:
    """
    Scrape detailed company information from Crunchbase URL using Firecrawl.
    
    Args:
        url: Crunchbase company profile URL
        max_retries: Maximum number of retry attempts (default: 2)
        timeout_seconds: Client-side timeout in seconds (default: 30)
        
    Returns:
        Dict with company data including name, description, funding, etc.
        
    Raises:
        CrunchbaseScraperError: If scraping fails after all retries
    """
    logger.info(f"🌐 Starting detailed scrape of: {url}")
    
    for attempt in range(max_retries + 1):
        try:
            if attempt > 0:
                wait_time = 2 ** attempt  # Exponential backoff: 2, 4, 8 seconds
                logger.info(f"⏳ Retry {attempt}/{max_retries} - Waiting {wait_time}s before retry...")
                await asyncio.sleep(wait_time)
            
            # Initialize Firecrawl
            logger.debug("Initializing Firecrawl client for scraping")
            firecrawl = Firecrawl(api_key=config.FIRECRAWL_API_KEY)
            
            # Scrape the URL with structured JSON extraction
            logger.info(f"Scraping company page with structured extraction (attempt {attempt + 1}/{max_retries + 1}, timeout: {timeout_seconds}s)...")
            
            # Wrap the blocking scrape call with asyncio timeout
            try:
                result = await asyncio.wait_for(
                    asyncio.to_thread(
                        firecrawl.scrape,
                        url,
                        formats=[{
                            "type": "json",
                            "schema": CrunchbaseJsonSchema
                        }],
                        only_main_content=False,
                        timeout=timeout_seconds * 1000  # Firecrawl expects milliseconds
                    ),
                    timeout=timeout_seconds + 5  # Add 5s buffer for network overhead
                )
            except asyncio.TimeoutError:
                logger.warning(f"⏰ Client-side timeout after {timeout_seconds}s")
                if attempt < max_retries:
                    continue  # Retry
                raise CrunchbaseScraperError(f"Scraping timed out after {timeout_seconds}s (tried {max_retries + 1} times)")
            
            if not result:
                logger.warning("⚠️  Empty response from Firecrawl scrape")
                if attempt < max_retries:
                    continue  # Retry
                raise CrunchbaseScraperError("Empty scrape result after all retries")
            
            # Process the result
            logger.debug("Processing scraped data...")
            
            # Convert result to dict format
            if hasattr(result, '__dict__'):
                result_dict = result.__dict__
            elif isinstance(result, dict):
                result_dict = result
            else:
                result_dict = convert_to_serializable(result)
            
            # Extract structured JSON data
            json_data = None
            if 'data' in result_dict:
                json_data = result_dict['data']
            elif 'json' in result_dict:
                json_data = result_dict['json']
            elif isinstance(result_dict, dict) and any(key in result_dict for key in ['company_name', 'company_description', 'mission', 'founders', 'funding_amount', 'employee_count']):
                json_data = result_dict
            
            # Build company data response
            company_data = {
                'name': json_data.get('company_name', 'Unknown') if json_data else 'Unknown',
                'description': json_data.get('company_description', 'Not available') if json_data else 'Not available',
                'mission': json_data.get('mission', 'Not available') if json_data else 'Not available',
                'founders': json_data.get('founders', 'Not available') if json_data else 'Not available',
                'funding': json_data.get('funding_amount', 'Not disclosed') if json_data else 'Not disclosed',
                'employees': str(json_data.get('employee_count', 'Not disclosed')) if json_data else 'Not disclosed',
                'url': url
            }
            
            logger.info(f"✅ Successfully scraped company: {company_data['name']}")
            logger.debug(f"Scraped data: {json.dumps(company_data, indent=2)}")
            
            return company_data
            
        except CrunchbaseScraperError:
            # Re-raise our custom errors
            raise
        except Exception as e:
            logger.warning(f"⚠️  Attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries:
                continue  # Retry
            # Last attempt failed, raise error
            logger.error(f"❌ Failed to scrape {url} after {max_retries + 1} attempts: {str(e)}", exc_info=True)
            raise CrunchbaseScraperError(f"Scraping failed after {max_retries + 1} attempts: {str(e)}") from e
    
    # Should never reach here, but just in case
    raise CrunchbaseScraperError(f"Unexpected error: scraping loop completed without returning")
