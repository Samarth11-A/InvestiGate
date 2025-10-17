// TypeScript interfaces matching backend response structure from FINAL_RESPONSE.JSON

export interface TractionData {
  revenue: string | null
  users: string | null
  growth_rate: string | null
  milestones: string[]
  summary: string
  employee_count: number | null
  funding_stage: string | null
  total_raised: string | null
  recent_round: string | null
}

export interface Founder {
  name: string
  background: string
}

export interface TeamData {
  founders: Founder[]
  key_members: string[]
  advisors: string[]
  summary: string
}

export interface MarketData {
  market_size: string
  competition_level: string
  target_segment: string
  market_trends: string[]
  summary: string
}

export interface MarketOverview {
  tam: string
  sam: string
  som: string
  sources: string[]
}

export interface Competitor {
  name: string
  positioning: string
  strengths: string[]
  weaknesses: string[]
}

export interface MarketTrend {
  trend: string
  impact: "High" | "Medium" | "Low"
  description: string
}

export interface GrowthTrajectory {
  current_rate: string
  projected_rate: string
  key_drivers: string[]
}

export interface BarriersAndMoats {
  entry_barriers: string[]
  company_moats: string[]
}

export interface RegulatoryLandscape {
  regulations: string[]
  compliance_requirements: string[]
}

export interface ExpansionOpportunity {
  market: string
  potential: "High" | "Medium" | "Low"
  rationale: string
}

export interface MarketRisk {
  risk: string
  severity: "High" | "Medium" | "Low"
  mitigation: string
}

export interface Source {
  title: string
  url: string
  date: string
}

export interface DeepMarketResearch {
  market_overview: MarketOverview
  competitive_landscape: Competitor[]
  market_trends: MarketTrend[]
  growth_trajectory: GrowthTrajectory
  barriers_and_moats: BarriersAndMoats
  regulatory_landscape: RegulatoryLandscape
  expansion_opportunities: ExpansionOpportunity[]
  market_risks: MarketRisk[]
  sources: Source[]
}

export interface RiskData {
  technical_risks: string[]
  market_risks: string[]
  team_risks: string[]
  financial_risks: string[]
  red_flags: string[]
  overall_risk_level: "High" | "Medium" | "Low"
  summary: string
}

export interface Indicators {
  growth: number
  team: number
  market: number
  product: number
}

export interface OutlookData {
  overall: "Strong" | "Moderate" | "Weak"
  summary: string
  keyPoints: string[]
}

export interface AnalysisResult {
  name: string
  domain: string
  traction: TractionData | null
  team: TeamData | null
  market: MarketData | null
  deep_market_research: DeepMarketResearch | null
  risks: RiskData | null
  indicators: Indicators
  outlook: OutlookData
}

// Search API types
export interface CompanySearchResult {
  url: string
  title: string
  description: string | null
}

export interface SearchResponse {
  query: string
  results: CompanySearchResult[]
  count: number
}

// Health check
export interface HealthResponse {
  status: string
  phase?: string
  endpoints_available?: string[]
}
