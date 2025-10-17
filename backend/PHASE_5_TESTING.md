# Phase 5 Testing Guide

## Overview
Phase 5 adds the Market Analysis Agent to the workflow, bringing the total to 3 parallel agents:
1. Traction Agent (Sonar, temp=0.2)
2. Team Agent (Sonar, temp=0.2)
3. Market Agent (Sonar, temp=0.3) - **NEW**

## What Changed in Phase 5

### New Files
- `/backend/agents/market_agent.py` - Market analysis agent with Perplexity Sonar

### Modified Files
- `/backend/models/schemas.py` - Added `MarketData` model
- `/backend/analysis_workflows/analysis_workflow.py` - Updated to run 3 agents in parallel
- `/backend/main.py` - Updated health check to reflect Phase 5

### Expected Response Structure
```json
{
  "name": "Company Name",
  "domain": "company.com",
  "traction": {
    "revenue": "string or null",
    "users": "string or null",
    "growth_rate": "string or null",
    "milestones": ["milestone1", "milestone2"],
    "summary": "string"
  },
  "team": {
    "founders": [{"name": "...", "background": "..."}],
    "key_members": ["member1", "member2"],
    "advisors": ["advisor1"],
    "summary": "string"
  },
  "market": {
    "market_size": "string describing TAM/market size",
    "competition_level": "High|Medium|Low",
    "target_segment": "string",
    "market_trends": ["trend1", "trend2", "trend3"],
    "summary": "string"
  },
  "indicators": {
    "growth": 50,
    "team": 60,
    "market": 70,
    "product": 0
  },
  "outlook": {
    "overall": "Moderate",
    "summary": "Traction, team, and market analysis complete (Phase 5)",
    "keyPoints": ["Traction analyzed", "Team analyzed", "Market analyzed"]
  }
}
```

## Testing Steps

### 1. Start Backend Server

```bash
# Terminal 1: Navigate to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Start server
python main.py

# Expected startup logs:
# 🚀 Starting AI Fund Scan Backend API
# Configuration validated successfully
# Server starting on http://0.0.0.0:8000
```

### 2. Test Health Check (Quick Validation)

```bash
# Terminal 2: Test health endpoint
curl http://localhost:8000/api/health

# Expected response:
{
  "status": "ok",
  "phase": "5 - Analysis (Traction + Team + Market Agents)",
  "endpoints_available": ["/api/health", "/api/search", "/api/analyze"],
  "agents_active": ["Traction", "Team", "Market"]
}
```

### 3. Test Company Search (HITL Checkpoint 1)

```bash
# Search for a company
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Stripe"}'

# Expected logs:
# 🔍 POST /api/search - Query: 'Stripe'
# 🔍 Starting Crunchbase search for query: 'Stripe'
# ✅ Found N companies matching 'Stripe'
# ✅ Search completed in ~5-10s

# Expected response:
{
  "query": "Stripe",
  "results": [
    {
      "url": "https://www.crunchbase.com/organization/stripe",
      "title": "Stripe - Crunchbase Company Profile & Funding",
      "description": "Stripe is a technology company..."
    }
  ],
  "count": 1
}
```

### 4. Test Full Analysis (HITL Checkpoint 2 + Phase 5 Workflow)

```bash
# Run analysis on selected company
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "company_url": "https://stripe.com",
    "crunchbase_url": "https://www.crunchbase.com/organization/stripe"
  }'

# Expected logs (Phase 5):
# 🚀 POST /api/analyze
# Company URL: https://stripe.com
# Crunchbase URL: https://www.crunchbase.com/organization/stripe
# ========================================
# 🔄 STAGE 1: Data Collection
# ========================================
# 📊 Scraping Crunchbase for company details...
# ✅ Crunchbase scrape successful: Stripe
# ✅ Data collection complete
# ========================================
# 🔄 STAGE 2: Agent Analysis - Traction + Team + Market (Phase 5)
# ========================================
# Running 3 agents in parallel...
# 📊 Starting Traction Agent analysis
# 👥 Starting Team Agent analysis
# 🌍 Starting Market Agent analysis
# ✅ Traction analysis completed in 12.34s
# ✅ Team analysis completed in 11.89s
# ✅ Market analysis completed in 13.45s
# ✅ All 3 agents completed in 13.67s
# ✅ Analysis workflow complete
# ✅ Analysis completed in ~20-30s

# Expected response includes traction, team, AND market fields
```

### 5. Validate Market Analysis Output

Check that the market field in the response contains:
- ✅ `market_size`: Non-empty string
- ✅ `competition_level`: One of "High", "Medium", or "Low"
- ✅ `target_segment`: Non-empty string
- ✅ `market_trends`: Array with at least 1 trend
- ✅ `summary`: Non-empty summary string

### 6. Performance Validation

**Key Metrics:**
- Search endpoint: < 10 seconds
- Analysis endpoint: 20-40 seconds (Phase 5 with 3 agents)
- Agent parallelism: All 3 agents should complete in ~same time as slowest agent (not 3x)

**Example Timeline:**
```
Stage 1 (Data Collection): 5-10s
Stage 2 (3 Agents Parallel): 12-15s
  - Traction: 12.3s
  - Team: 11.9s
  - Market: 13.4s (slowest)
Total: 18-25s
```

If agents are sequential (bad):
```
Stage 2: 36-45s (12s + 12s + 13s)
Total: 41-55s ❌
```

## Test Cases

### Test Case 1: Well-Known Company (Best Case)
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "company_url": "https://openai.com",
    "crunchbase_url": "https://www.crunchbase.com/organization/openai"
  }'

# Expected: All 3 agents return rich data
# Market analysis should identify AI market, high competition, etc.
```

### Test Case 2: Startup with Limited Data
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "company_url": "https://example-startup.com",
    "crunchbase_url": "https://www.crunchbase.com/organization/example-startup"
  }'

# Expected: Agents return fallback data gracefully
# No crashes, reasonable "Unable to determine" values
```

### Test Case 3: Invalid/Missing Company
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "company_url": "https://nonexistent.com",
    "crunchbase_url": "https://www.crunchbase.com/organization/nonexistent"
  }'

# Expected: Workflow completes with fallback data
# Logs show: ⚠️ Crunchbase scraping failed
# Logs show: ⚠️ Falling back to minimal data
```

## Debugging Tips

### Issue: Market agent not returning valid JSON
**Check:**
1. Look at logs for "Failed to parse LLM response as JSON"
2. Review raw response in debug logs
3. Verify Perplexity API key is valid

### Issue: Agents running sequentially (slow)
**Check:**
1. Look for "Running 3 agents in parallel..." in logs
2. Compare individual agent times vs total time
3. Verify `asyncio.gather()` is used in workflow

### Issue: Missing market field in response
**Check:**
1. Verify `MarketData` is imported in schemas.py
2. Check that `market: MarketData` is in `AnalysisResult`
3. Verify workflow returns `market_result` in final_result dict

### Issue: Server won't start
**Check:**
1. PPLX_API_KEY is set in .env
2. FIRECRAWL_API_KEY is set in .env
3. Run `pip install -r requirements.txt` again
4. Check logs directory is writable

## Success Criteria Checklist

Phase 5 is successfully implemented if:

- ✅ Health endpoint shows Phase 5 with 3 agents
- ✅ `/api/analyze` returns response with traction, team, AND market fields
- ✅ Logs show "Running 3 agents in parallel..."
- ✅ All 3 agents complete in parallel (similar timing)
- ✅ Total analysis time: 20-40 seconds (not 40-60s)
- ✅ Market field includes all required properties
- ✅ Market analysis provides meaningful insights
- ✅ No crashes or unhandled exceptions
- ✅ Graceful fallback when data is unavailable

## Next Steps

Once Phase 5 is validated:
- **Phase 6**: Add Risk Agent (4 agents in parallel)
- **Phase 7**: Add Deep Market Research Agent with Sonar Pro (5 agents)
- **Phase 8**: Add Synthesis Agent (final aggregation)
- **Phase 9**: Add remaining scrapers (Reddit, Website, News)

## Postman Collection

Import this collection for easy testing:

```json
{
  "info": {
    "name": "AI Fund Scan - Phase 5",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:8000/api/health"
      }
    },
    {
      "name": "Search Company",
      "request": {
        "method": "POST",
        "url": "http://localhost:8000/api/search",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"query\": \"Stripe\"}"
        }
      }
    },
    {
      "name": "Analyze Company (Phase 5)",
      "request": {
        "method": "POST",
        "url": "http://localhost:8000/api/analyze",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"company_url\": \"https://stripe.com\",\n  \"crunchbase_url\": \"https://www.crunchbase.com/organization/stripe\"\n}"
        }
      }
    }
  ]
}
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
