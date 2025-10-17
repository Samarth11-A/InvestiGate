from fastapi import APIRouter, HTTPException, status
from models.schemas import SearchRequest, SearchResponse, CompanySearchResult, AnalyzeRequest, AnalysisResult
from services.crunchbase_scraper import search_crunchbase, CrunchbaseScraperError
from analysis_workflows.analysis_workflow import CompanyAnalysisWorkflow
from utils.logger import setup_logger
import time

logger = setup_logger(__name__)
router = APIRouter(prefix="/api", tags=["search", "analysis"])

@router.post("/search", response_model=SearchResponse)
async def search_companies(request: SearchRequest):
    """
    Search for companies on Crunchbase.

    Phase 2: Returns 3-5 company options for HITL selection.
    No LLM processing - just Firecrawl scraping.

    Processing time: ~5-10 seconds
    """
    logger.info("=" * 80)
    logger.info(f"🔍 POST /api/search - Query: '{request.query}'")
    logger.info("=" * 80)

    start_time = time.time()

    try:
        # Validate query
        logger.debug(f"Validating search query: '{request.query}'")
        if not request.query.strip():
            logger.warning("Empty query received")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query cannot be empty"
            )

        # Search Crunchbase
        logger.info(f"Calling crunchbase_scraper.search_crunchbase()")
        results = search_crunchbase(request.query, limit=5)

        # Convert to Pydantic models
        company_results = [CompanySearchResult(**r) for r in results]

        response = SearchResponse(
            query=request.query,
            results=company_results,
            count=len(company_results)
        )

        elapsed = time.time() - start_time
        logger.info(f"✅ Search completed in {elapsed:.2f}s - Found {len(company_results)} results")
        logger.debug(f"Response: {response.model_dump_json(indent=2)}")

        return response

    except CrunchbaseScraperError as e:
        elapsed = time.time() - start_time
        logger.error(f"❌ Search failed after {elapsed:.2f}s: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Crunchbase search failed: {str(e)}"
        )

    except Exception as e:
        elapsed = time.time() - start_time
        logger.error(f"❌ Unexpected error after {elapsed:.2f}s: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/analyze", response_model=AnalysisResult)
async def analyze_company(request: AnalyzeRequest):
    """
    Run full company analysis workflow.

    Phase 3: Only traction agent implemented.
    Future phases will add more agents incrementally.

    Processing time: ~30-60 seconds (Phase 3), up to 2-3 min (final phase)
    """
    logger.info("=" * 80)
    logger.info(f"🚀 POST /api/analyze")
    logger.info(f"Company URL: {request.company_url}")
    logger.info(f"Crunchbase URL: {request.crunchbase_url}")
    logger.info("=" * 80)

    start_time = time.time()

    try:
        # Create and run workflow
        workflow = CompanyAnalysisWorkflow(timeout=300, verbose=True)

        logger.info("Starting CompanyAnalysisWorkflow...")
        result = await workflow.run(
            company_url=request.company_url,
            crunchbase_url=request.crunchbase_url
        )

        elapsed = time.time() - start_time
        logger.info(f"✅ Analysis completed in {elapsed:.2f}s")
        logger.debug(f"Result: {result}")

        return AnalysisResult(**result)

    except Exception as e:
        elapsed = time.time() - start_time
        logger.error(f"❌ Analysis failed after {elapsed:.2f}s: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )
