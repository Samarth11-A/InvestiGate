// API client for backend communication
import type {
  SearchResponse,
  AnalysisResult,
  HealthResponse
} from '@/types/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Search for companies on Crunchbase
 * @param query - Company name or URL
 * @returns Search results with company options
 */
export async function searchCompany(query: string): Promise<SearchResponse> {
  const response = await fetch(`${API_URL}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Search failed' }))
    throw new Error(error.detail || 'Failed to search company')
  }

  return response.json()
}

/**
 * Run full company analysis workflow
 * @param companyUrl - Company website URL
 * @param crunchbaseUrl - Crunchbase profile URL
 * @returns Complete analysis result
 */
export async function analyzeCompany(
  companyUrl: string,
  crunchbaseUrl: string
): Promise<AnalysisResult> {
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      company_url: companyUrl,
      crunchbase_url: crunchbaseUrl,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Analysis failed' }))
    throw new Error(error.detail || 'Failed to analyze company')
  }

  return response.json()
}

/**
 * Check backend health status
 * @returns Health status
 */
export async function healthCheck(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/api/health`)

  if (!response.ok) {
    throw new Error('Health check failed')
  }

  return response.json()
}
