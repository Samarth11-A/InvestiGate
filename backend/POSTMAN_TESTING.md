# Postman Testing Guide - AI Fund Scan Backend API

## Phase 3 Testing - Basic Analysis Workflow + Traction Agent

This guide provides comprehensive testing instructions for all backend API endpoints using Postman.

---

## Prerequisites

1. **Backend Running**: Ensure the backend server is running on `http://localhost:8000`
   ```bash
   cd backend
   source venv/bin/activate
   python main.py
   ```

2. **Environment Variables**: Verify `.env` file has:
   - `FIRECRAWL_API_KEY` (required for search)
   - `PPLX_API_KEY` (required for analysis)

3. **Postman Installed**: Download from [postman.com](https://www.postman.com/downloads/)

---

## Test 1: Health Check Endpoint

**Purpose**: Verify backend is running and check which phase is active.

### Request Configuration

| Field | Value |
|-------|-------|
| **Method** | GET |
| **URL** | `http://localhost:8000/api/health` |
| **Headers** | None required |
| **Body** | None |

### Expected Response

**Status Code**: `200 OK`

**Response Time**: < 1 second

**Response Body**:
```json
{
  "status": "ok",
  "phase": "3 - Basic Analysis (Traction Agent)",
  "endpoints_available": [
    "/api/health",
    "/api/search",
    "/api/analyze"
  ]
}
```

### Success Criteria

- ✅ Status code is 200
- ✅ `status` field is "ok"
- ✅ `phase` shows "3 - Basic Analysis (Traction Agent)"
- ✅ All 3 endpoints are listed in `endpoints_available`

### Backend Logs to Verify

```
2025-10-17 XX:XX:XX | DEBUG    | __main__:health_check:63 | Health check endpoint called
```

---

## Test 2: Company Search Endpoint

**Purpose**: Search Crunchbase for companies using Firecrawl (HITL Checkpoint 1).

### Request Configuration

| Field | Value |
|-------|-------|
| **Method** | POST |
| **URL** | `http://localhost:8000/api/search` |
| **Headers** | `Content-Type: application/json` |
| **Body** | JSON (see below) |

### Request Body

**Example 1: Search by Company Name**
```json
{
  "query": "OpenAI"
}
```

**Example 2: Search by Domain**
```json
{
  "query": "stripe.com"
}
```

**Example 3: Alternative Company**
```json
{
  "query": "Anthropic"
}
```

### Expected Response

**Status Code**: `200 OK`

**Response Time**: 5-10 seconds (Firecrawl search)

**Response Body Structure**:
```json
{
  "query": "OpenAI",
  "results": [
    {
      "url": "https://www.crunchbase.com/organization/openai",
      "title": "OpenAI - Crunchbase Company Profile & Funding",
      "description": "OpenAI is an AI research and deployment company..."
    },
    {
      "url": "https://www.crunchbase.com/organization/openai-codex",
      "title": "OpenAI Codex - Crunchbase",
      "description": "..."
    }
  ],
  "count": 2
}
```

### Success Criteria

- ✅ Status code is 200
- ✅ Response time < 15 seconds
- ✅ `query` field matches input
- ✅ `results` array has 1-5 items
- ✅ Each result has `url`, `title`, `description` fields
- ✅ URLs are Crunchbase links (crunchbase.com domain)
- ✅ `count` matches array length

### Error Test Cases

**Test 2a: Empty Query**
```json
{
  "query": ""
}
```
**Expected**: `400 Bad Request` - "Query cannot be empty"

**Test 2b: Invalid API Key**
- Temporarily set invalid `FIRECRAWL_API_KEY` in `.env`
- **Expected**: `500 Internal Server Error` - "Crunchbase search failed"

### Backend Logs to Verify

```
========================================
🔍 POST /api/search - Query: 'OpenAI'
========================================
Validating search query: 'OpenAI'
Calling crunchbase_scraper.search_crunchbase()
🔍 Starting Crunchbase search for query: 'OpenAI'
Initializing Firecrawl client
Searching Crunchbase via Firecrawl...
Processing N raw results
✅ Found N companies matching 'OpenAI'
✅ Search completed in 6.32s - Found N results
```

---

## Test 3: Full Analysis Endpoint (Phase 3)

**Purpose**: Run complete LlamaIndex workflow with traction agent analysis.

### Request Configuration

| Field | Value |
|-------|-------|
| **Method** | POST |
| **URL** | `http://localhost:8000/api/analyze` |
| **Headers** | `Content-Type: application/json` |
| **Body** | JSON (see below) |
| **Timeout** | Set to 120000ms (2 minutes) in Postman |

### Request Body

**Important**: Use actual Crunchbase URLs from Test 2 results.

**Example 1: Using Mock Data (Phase 3)**
```json
{
  "company_url": "https://openai.com",
  "crunchbase_url": "https://www.crunchbase.com/organization/openai"
}
```

**Example 2: Alternative Company**
```json
{
  "company_url": "https://stripe.com",
  "crunchbase_url": "https://www.crunchbase.com/organization/stripe"
}
```

### Expected Response

**Status Code**: `200 OK`

**Response Time**: 30-60 seconds (Phase 3 with mock data + Perplexity LLM call)

**Response Body Structure**:
```json
{
  "name": "Example Company",
  "domain": "example.com",
  "traction": {
    "revenue": "$10M ARR" or null,
    "users": "100K active users" or null,
    "growth_rate": "150% YoY" or null,
    "milestones": [
      "Reached $10M ARR in Q3 2024",
      "Launched product in 50 countries",
      "Secured Series A funding"
    ],
    "summary": "The company demonstrates strong traction with significant revenue growth and user acquisition. Key milestones include..."
  },
  "indicators": {
    "growth": 50,
    "team": 0,
    "market": 0,
    "product": 0
  },
  "outlook": {
    "overall": "Moderate",
    "summary": "Traction analysis complete (Phase 3)",
    "keyPoints": [
      "Only traction analyzed in this phase"
    ]
  }
}
```

### Success Criteria

- ✅ Status code is 200
- ✅ Response time < 90 seconds
- ✅ `name` field populated (from mock data: "Example Company")
- ✅ `domain` field present
- ✅ **`traction` object** contains:
  - `revenue`: string or null
  - `users`: string or null
  - `growth_rate`: string or null
  - `milestones`: array of strings (may be empty)
  - `summary`: non-empty string
- ✅ `indicators` has growth > 0, others are 0 (Phase 3)
- ✅ `outlook.overall` is "Moderate"
- ✅ **Perplexity API was called** (verify in logs)

### Error Test Cases

**Test 3a: Missing Required Field**
```json
{
  "company_url": "https://openai.com"
}
```
**Expected**: `422 Unprocessable Entity` - Missing `crunchbase_url`

**Test 3b: Invalid Perplexity API Key**
- Temporarily set invalid `PPLX_API_KEY` in `.env`
- **Expected**: `500 Internal Server Error` - "Analysis failed"

**Test 3c: Timeout Test**
- Set Postman timeout to 5 seconds
- **Expected**: Postman timeout (backend continues processing)

### Backend Logs to Verify

```
========================================
🚀 POST /api/analyze
Company URL: https://openai.com
Crunchbase URL: https://www.crunchbase.com/organization/openai
========================================
Starting CompanyAnalysisWorkflow...

========================================
🔄 STAGE 1: Data Collection
========================================
Company URL: https://openai.com
Crunchbase URL: https://www.crunchbase.com/organization/openai
⚠️  Using mock data - implement scrapers in future phases
✅ Data collection complete
Collected data keys: ['crunchbase', 'reddit', 'website', 'news']

========================================
🔄 STAGE 2: Agent Analysis - Traction Only (Phase 3)
========================================
📊 Starting Traction Agent analysis
Input data keys: ['crunchbase', 'reddit', 'website', 'news']
Creating Sonar LLM instance (temperature=0.2)
Sending prompt to Perplexity Sonar (length: XXX chars)
Received response (length: XXX chars)
Response preview: {...
✅ Traction analysis completed in 12.34s
Traction result: { "revenue": "...", ... }
✅ Analysis workflow complete
Final result keys: ['name', 'domain', 'traction', 'indicators', 'outlook']

✅ Analysis completed in 15.67s
```

**Key Log Elements to Verify**:
1. ✅ "Starting CompanyAnalysisWorkflow..." appears
2. ✅ "STAGE 1: Data Collection" appears
3. ✅ "⚠️  Using mock data" appears (Phase 3)
4. ✅ "STAGE 2: Agent Analysis - Traction Only (Phase 3)" appears
5. ✅ "📊 Starting Traction Agent analysis" appears
6. ✅ "Creating Sonar LLM instance" appears
7. ✅ "Sending prompt to Perplexity Sonar" appears
8. ✅ "✅ Traction analysis completed in X.XXs" appears
9. ✅ "✅ Analysis workflow complete" appears
10. ✅ "✅ Analysis completed in X.XXs" appears

---

## Additional Testing Scenarios

### Test 4: Rapid Sequential Requests

**Purpose**: Test backend handles concurrent requests gracefully.

**Steps**:
1. Send `/api/analyze` request
2. Immediately send another `/api/analyze` request
3. Both should complete successfully (may take longer)

**Expected**: Both return 200 OK, no crashes

---

### Test 5: End-to-End HITL Flow

**Purpose**: Simulate the full user flow from search to analysis.

**Steps**:
1. **Search**: POST `/api/search` with `{"query": "Stripe"}`
2. **User Selection**: Pick the first result from search
3. **Analyze**: POST `/api/analyze` with the selected Crunchbase URL
4. **Verify**: Response contains traction analysis

**Expected**: Complete flow works, analysis uses company name from mock data

---

## Validation Checklist

After running all tests, verify:

### Phase 3 Acceptance Criteria:
- ✅ `/api/analyze` endpoint works and returns 200
- ✅ Workflow executes with data collection + traction agent
- ✅ Logs show each stage with timing
- ✅ Perplexity Sonar LLM is called (see logs)
- ✅ Response includes complete traction data structure
- ✅ No crashes or unhandled exceptions

### System Health:
- ✅ Backend logs are readable and structured
- ✅ Response times are acceptable (< 60s for Phase 3)
- ✅ Error messages are user-friendly
- ✅ CORS headers allow frontend origin

---

## Troubleshooting Common Issues

### Issue 1: "Connection refused" error
**Solution**: Backend server not running. Start with `python main.py`

### Issue 2: "Missing environment variables" error
**Solution**: Check `.env` file has `FIRECRAWL_API_KEY` and `PPLX_API_KEY`

### Issue 3: Search returns no results
**Solution**:
- Verify `FIRECRAWL_API_KEY` is valid
- Try a different company name (e.g., "OpenAI", "Stripe", "Anthropic")
- Check backend logs for Firecrawl API errors

### Issue 4: Analysis takes too long (> 90s)
**Solution**:
- Normal for Phase 3 (LLM call)
- Increase Postman timeout to 120000ms
- Check Perplexity API rate limits

### Issue 5: Analysis returns fallback data
**Solution**:
- LLM response wasn't valid JSON
- Check backend logs for "Failed to parse LLM response as JSON"
- Verify `PPLX_API_KEY` is valid

### Issue 6: "Failed to parse LLM response as JSON"
**Cause**: Perplexity returned markdown-formatted response
**Solution**: Already handled in code - check if fallback data is returned

---

## Next Steps - Phase 4 Testing

Once Phase 4 (Team Agent) is implemented, update this guide with:
- Test for `/api/analyze` with team analysis
- Verify response includes both `traction` and `team` objects
- Check logs for parallel agent execution
- Expected response time: 20-40 seconds (2 parallel agents)

---

## Postman Tips

1. **Create Environment**: Set `base_url` variable to `http://localhost:8000`
2. **Save Tests**: Create a Postman Collection for all endpoints
3. **Add Tests Tab**: Use Postman's Tests tab to automate validation:
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });

   pm.test("Response has traction object", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('traction');
   });
   ```

4. **Monitor Response Times**: Check "Time" in Postman response to track performance

---

## Success Summary

If all tests pass, you have successfully verified:
- ✅ Phase 1: Backend foundation working
- ✅ Phase 2: Company search working
- ✅ Phase 3: Basic analysis workflow with traction agent working
- ✅ LlamaIndex workflow orchestration functioning
- ✅ Perplexity Sonar LLM integration working
- ✅ All endpoints returning valid responses
- ✅ Comprehensive logging in place

**Phase 3 is complete and ready for Phase 4 implementation!**
