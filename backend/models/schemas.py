from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Search-related schemas
class SearchRequest(BaseModel):
    """Request model for /api/search"""
    query: str = Field(..., min_length=1, description="Company name or URL")

class CompanySearchResult(BaseModel):
    """Single company search result"""
    url: str
    title: str
    description: Optional[str] = None

class SearchResponse(BaseModel):
    """Response model for /api/search"""
    query: str
    results: List[CompanySearchResult]
    count: int

# Analysis-related schemas
class AnalyzeRequest(BaseModel):
    """Request model for /api/analyze"""
    company_url: str = Field(..., description="Company website URL")
    crunchbase_url: str = Field(..., description="Crunchbase profile URL")

class TractionData(BaseModel):
    """Traction analysis data"""
    revenue: Optional[str] = None
    users: Optional[str] = None
    growth_rate: Optional[str] = None
    milestones: List[str] = []
    summary: str
    employee_count: Optional[int] = None
    funding_stage: Optional[str] = None
    total_raised: Optional[str] = None
    recent_round: Optional[str] = None

class TeamData(BaseModel):
    """Team analysis data"""
    founders: List[Dict[str, str]] = []  # [{"name": "...", "background": "..."}]
    key_members: List[str] = []
    advisors: List[str] = []
    summary: str

class MarketData(BaseModel):
    """Market analysis data"""
    market_size: str
    competition_level: str  # "High", "Medium", or "Low"
    target_segment: str
    market_trends: List[str] = []
    summary: str

class RiskData(BaseModel):
    """Risk analysis data"""
    technical_risks: List[str] = []
    market_risks: List[str] = []
    team_risks: List[str] = []
    financial_risks: List[str] = []
    red_flags: List[str] = []
    overall_risk_level: str  # "High", "Medium", or "Low"
    summary: str

class MarketOverview(BaseModel):
    """Market size overview"""
    tam: str  # Total Addressable Market
    sam: str  # Serviceable Addressable Market
    som: str  # Serviceable Obtainable Market
    sources: List[str] = []

class Competitor(BaseModel):
    """Competitor information"""
    name: str
    positioning: str
    strengths: List[str] = []
    weaknesses: List[str] = []

class MarketTrend(BaseModel):
    """Market trend information"""
    trend: str
    impact: str  # "High", "Medium", or "Low"
    description: str

class GrowthTrajectory(BaseModel):
    """Market growth trajectory"""
    current_rate: str
    projected_rate: str
    key_drivers: List[str] = []

class BarriersAndMoats(BaseModel):
    """Entry barriers and company moats"""
    entry_barriers: List[str] = []
    company_moats: List[str] = []

class RegulatoryLandscape(BaseModel):
    """Regulatory information"""
    regulations: List[str] = []
    compliance_requirements: List[str] = []

class ExpansionOpportunity(BaseModel):
    """Market expansion opportunity"""
    market: str
    potential: str  # "High", "Medium", or "Low"
    rationale: str

class MarketRisk(BaseModel):
    """Market-specific risk"""
    risk: str
    severity: str  # "High", "Medium", or "Low"
    mitigation: str

class Source(BaseModel):
    """Citation source"""
    title: str
    url: str
    date: str

class DeepMarketResearch(BaseModel):
    """Deep market research analysis data (Phase 7)"""
    market_overview: MarketOverview
    competitive_landscape: List[Competitor] = []
    market_trends: List[MarketTrend] = []
    growth_trajectory: GrowthTrajectory
    barriers_and_moats: BarriersAndMoats
    regulatory_landscape: RegulatoryLandscape
    expansion_opportunities: List[ExpansionOpportunity] = []
    market_risks: List[MarketRisk] = []
    sources: List[Source] = []

class AnalysisResult(BaseModel):
    """Full analysis result - Phase 7: Added Deep Market Research"""
    name: str
    domain: str
    traction: TractionData
    team: TeamData
    market: MarketData
    risks: RiskData
    deep_market_research: Optional[DeepMarketResearch] = None  # NEW in Phase 7
    indicators: Dict[str, int] = {"growth": 0, "team": 0, "market": 0, "product": 0}
    outlook: Dict[str, Any] = {
        "overall": "Unknown",
        "summary": "Analysis in progress",
        "keyPoints": []
    }
