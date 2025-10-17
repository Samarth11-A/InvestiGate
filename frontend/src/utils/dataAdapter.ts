// Data transformation utilities to adapt backend response to frontend component props
import type {
  TractionData,
  TeamData,
  MarketData,
  RiskData,
  Indicators,
  OutlookData,
} from '@/types/api'

/**
 * Transform backend traction data to TractionMetrics component props
 */
export function adaptTractionData(traction: TractionData | null) {
  if (!traction) return null

  return {
    employeeCount: traction.employee_count ?? 0,
    employeeGrowth6m: traction.growth_rate || 'N/A',
    employeeGrowth1y: 'N/A', // Not provided by backend yet
    fundingStage: traction.funding_stage || 'N/A',
    totalRaised: traction.total_raised || 'N/A',
    recentRound: traction.recent_round || 'N/A',
    revenueIndicator: traction.revenue || 'N/A',
    customerCount: traction.users || 'N/A',
  }
}

/**
 * Transform backend team data to TeamQuality component props
 */
export function adaptTeamData(team: TeamData | null) {
  if (!team) return null

  return {
    founders: team.founders.map(f => ({
      name: f.name,
      role: 'Founder', // Not provided, use default
      background: f.background,
      previousExits: undefined, // Not provided by backend
    })),
    keyExecutives: team.key_members.map(member => ({
      name: member,
      role: 'Team Member',
      background: '', // Not provided by backend
    })),
    teamComposition: team.summary,
    teamGaps: undefined, // Not provided by backend
  }
}

/**
 * Transform backend market data to MarketSignals component props
 */
export function adaptMarketData(market: MarketData | null) {
  if (!market) return null

  return {
    competitivePosition: market.summary,
    marketSize: market.market_size,
    growthTrend: `${market.competition_level} competition`,
    recentPress: [], // Not provided by backend
    techStack: [], // Not provided by backend
  }
}

/**
 * Transform backend risks to RiskAssessment component props
 */
export function adaptRisksData(risks: RiskData | null) {
  if (!risks) return null

  const riskArray: Array<{
    category: string
    level: 'high' | 'medium' | 'low'
    description: string
  }> = []

  // Map technical risks
  if (risks.technical_risks && risks.technical_risks.length > 0) {
    risks.technical_risks.forEach(risk => {
      riskArray.push({
        category: 'Technical Execution',
        level: risks.overall_risk_level.toLowerCase() as 'high' | 'medium' | 'low',
        description: risk,
      })
    })
  }

  // Map market risks
  if (risks.market_risks && risks.market_risks.length > 0) {
    risks.market_risks.forEach(risk => {
      riskArray.push({
        category: 'Market Timing',
        level: 'high',
        description: risk,
      })
    })
  }

  // Map team risks
  if (risks.team_risks && risks.team_risks.length > 0) {
    risks.team_risks.forEach(risk => {
      riskArray.push({
        category: 'Team Risks',
        level: 'medium',
        description: risk,
      })
    })
  }

  // Map financial risks
  if (risks.financial_risks && risks.financial_risks.length > 0) {
    risks.financial_risks.forEach(risk => {
      riskArray.push({
        category: 'Financial Risks',
        level: 'high',
        description: risk,
      })
    })
  }

  // Map red flags
  if (risks.red_flags && risks.red_flags.length > 0) {
    risks.red_flags.forEach(flag => {
      riskArray.push({
        category: 'Red Flags',
        level: 'high',
        description: flag,
      })
    })
  }

  return riskArray
}

/**
 * Transform backend indicators to InvestmentIndicators component props
 */
export function adaptIndicators(indicators: Indicators) {
  return {
    hiringVelocity: {
      openPositions: 0, // Not provided by backend
      recentHires: 'Data not available',
    },
    productLaunches: [], // Not provided by backend
    partnerships: [], // Not provided by backend
    growthTrajectory: `Growth indicator: ${indicators.growth}/100, Team quality: ${indicators.team}/100`,
  }
}

/**
 * Transform backend outlook to InvestmentOutlook component props
 */
export function adaptOutlook(outlook: OutlookData) {
  // Map backend's Strong/Moderate/Weak to frontend's recommendation format
  const recommendationMap: Record<string, 'Strong Investment' | 'Moderate' | 'Pass'> = {
    Strong: 'Strong Investment',
    Moderate: 'Moderate',
    Weak: 'Pass',
  }

  return {
    recommendation: recommendationMap[outlook.overall] || 'Moderate',
    confidence: 75, // Not provided by backend, use default
    summary: outlook.summary,
  }
}

/**
 * Adapt company summary data
 */
export function adaptCompanySummary(name: string, domain: string) {
  return {
    name,
    domain,
    foundedDate: undefined, // Not provided by backend
    industry: undefined, // Not provided by backend
    businessModel: undefined, // Not provided by backend
    productDescription: undefined, // Not provided by backend
    geographicFocus: undefined, // Not provided by backend
  }
}
