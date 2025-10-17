from llama_index.core.workflow import Workflow, Event, StartEvent, StopEvent, step
from agents.traction_agent import analyze_traction
from agents.team_agent import analyze_team
from agents.market_agent import analyze_market
from agents.risk_agent import analyze_risks
from agents.deep_market_research_agent import analyze_deep_market_research
from agents.synthesis_agent import synthesize_analysis
from services.crunchbase_scraper import scrape_company_url, CrunchbaseScraperError
from utils.logger import setup_logger
from urllib.parse import urlparse
import asyncio
import time

logger = setup_logger(__name__)

class DataCollectedEvent(Event):
    """Event fired when data collection is complete"""
    data: dict
    company_url: str
    crunchbase_url: str

class AnalysisCompleteEvent(Event):
    """Event fired when all agent analyses are complete"""
    traction: dict
    team: dict
    market: dict
    risks: dict
    deep_market_research: dict
    company_name: str
    domain: str

class CompanyAnalysisWorkflow(Workflow):
    """
    Multi-stage workflow for company analysis.
    Phase 8: Data collection + 5 parallel agents + Synthesis (3 stages total).
    """

    @step
    async def collect_data(self, ev: StartEvent) -> DataCollectedEvent:
        """
        Stage 1: Data collection from Crunchbase (real scraping).
        Future phases will add Reddit, Website, and News scrapers.
        """
        logger.info("=" * 80)
        logger.info("🔄 STAGE 1: Data Collection")
        logger.info("=" * 80)

        company_url = ev.get("company_url")
        crunchbase_url = ev.get("crunchbase_url")

        logger.info(f"Company URL: {company_url}")
        logger.info(f"Crunchbase URL: {crunchbase_url}")

        # Scrape Crunchbase for real data
        crunchbase_data = {}
        try:
            logger.info("📊 Scraping Crunchbase for company details...")
            crunchbase_data = await scrape_company_url(crunchbase_url)
            logger.info(f"✅ Crunchbase scrape successful: {crunchbase_data.get('name', 'Unknown')}")
        except CrunchbaseScraperError as e:
            logger.error(f"⚠️  Crunchbase scraping failed: {str(e)}")
            logger.warning("⚠️  Falling back to minimal data")
            crunchbase_data = {
                "name": "Unknown Company",
                "description": "Unable to scrape company details",
                "funding": "Not disclosed",
                "employees": "Not disclosed",
                "error": str(e)
            }
        except Exception as e:
            logger.error(f"⚠️  Unexpected error during Crunchbase scraping: {str(e)}", exc_info=True)
            crunchbase_data = {
                "name": "Unknown Company",
                "description": "Error during scraping",
                "funding": "Not disclosed",
                "employees": "Not disclosed",
                "error": str(e)
            }

        # Build data dict (other sources will be added in future phases)
        data = {
            "crunchbase": crunchbase_data,
            "reddit": {},  # TODO: Phase 4+ - Add Reddit scraper
            "website": {},  # TODO: Phase 4+ - Add Website scraper
            "news": {}      # TODO: Phase 4+ - Add News scraper
        }

        logger.info(f"✅ Data collection complete")
        logger.debug(f"Collected data keys: {list(data.keys())}")

        return DataCollectedEvent(
            data=data,
            company_url=company_url,
            crunchbase_url=crunchbase_url
        )

    @step
    async def analyze_agents(self, ev: DataCollectedEvent) -> AnalysisCompleteEvent:
        """
        Stage 2: Run analysis agents.
        Phase 8: Traction + Team + Market + Risk + Deep Market Research agents in parallel.
        """
        logger.info("=" * 80)
        logger.info("🔄 STAGE 2: Agent Analysis - 5 Agents in Parallel (Phase 8)")
        logger.info("=" * 80)

        # Run all 5 agents in parallel
        logger.info("Running 5 agents in parallel...")
        logger.info("📊 Traction Agent (Sonar)")
        logger.info("👥 Team Agent (Sonar)")
        logger.info("🌍 Market Agent (Sonar)")
        logger.info("⚠️  Risk Agent (Sonar)")
        logger.info("🔍 Deep Market Research Agent (Sonar Pro)")
        start_time = time.time()

        traction_result, team_result, market_result, risk_result, deep_market_result = await asyncio.gather(
            analyze_traction(ev.data),
            analyze_team(ev.data),
            analyze_market(ev.data),
            analyze_risks(ev.data),
            analyze_deep_market_research(ev.data)  # Sonar Pro with web search
        )

        elapsed = time.time() - start_time
        logger.info(f"✅ All 5 agents completed in {elapsed:.2f}s")

        # Log deep market research metrics
        source_count = len(deep_market_result.get('sources', []))
        competitor_count = len(deep_market_result.get('competitive_landscape', []))
        logger.info(f"📊 Deep Market Research: {competitor_count} competitors, {source_count} cited sources")

        # Extract domain from company URL
        try:
            parsed_url = urlparse(ev.company_url)
            domain = parsed_url.netloc or parsed_url.path
            # Remove www. prefix if present
            if domain.startswith('www.'):
                domain = domain[4:]
        except Exception as e:
            logger.warning(f"Failed to parse domain from URL: {e}")
            domain = ev.company_url

        company_name = ev.data.get("crunchbase", {}).get("name", "Unknown Company")

        # Pass results to synthesis stage
        return AnalysisCompleteEvent(
            traction=traction_result,
            team=team_result,
            market=market_result,
            risks=risk_result,
            deep_market_research=deep_market_result,
            company_name=company_name,
            domain=domain
        )

    @step
    async def synthesize(self, ev: AnalysisCompleteEvent) -> StopEvent:
        """
        Stage 3: Synthesis - Aggregate all analyses into final report.
        Phase 8: Uses Perplexity Sonar to calculate indicators and generate outlook.
        """
        logger.info("=" * 80)
        logger.info("🔄 STAGE 3: Synthesis - Final Report Generation (Phase 8)")
        logger.info("=" * 80)

        start_time = time.time()

        # Run synthesis agent
        synthesis_result = await synthesize_analysis(
            traction=ev.traction,
            team=ev.team,
            market=ev.market,
            deep_market_research=ev.deep_market_research,
            risks=ev.risks,
            company_name=ev.company_name
        )

        elapsed = time.time() - start_time
        logger.info(f"✅ Synthesis completed in {elapsed:.2f}s")

        # Build final result with synthesized indicators and outlook
        final_result = {
            "name": ev.company_name,
            "domain": ev.domain,
            "traction": ev.traction,
            "team": ev.team,
            "market": ev.market,
            "risks": ev.risks,
            "deep_market_research": ev.deep_market_research,
            "indicators": synthesis_result.get("indicators", {
                "growth": 50, "team": 50, "market": 50, "product": 50
            }),
            "outlook": synthesis_result.get("outlook", {
                "overall": "Moderate",
                "summary": "Analysis complete",
                "keyPoints": []
            })
        }

        logger.info("=" * 80)
        logger.info("✅ COMPLETE: Full Analysis Workflow Finished (Phase 8)")
        logger.info("=" * 80)
        logger.info(f"📊 Final Indicators: Growth={final_result['indicators']['growth']}, "
                   f"Team={final_result['indicators']['team']}, "
                   f"Market={final_result['indicators']['market']}, "
                   f"Product={final_result['indicators']['product']}")
        logger.info(f"🎯 Overall Outlook: {final_result['outlook']['overall']}")
        logger.debug(f"Final result keys: {list(final_result.keys())}")

        return StopEvent(result=final_result)
