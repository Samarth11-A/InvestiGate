# Postman Testing Guide - Phase 2: Company Search API

## Prerequisites

1. **Start the Backend Server**
   ```bash
   cd /Users/sanyam/Documents/personal/sxsw-hackathon/backend
   source venv/bin/activate
   python main.py
   ```

   **Expected Output:**
   ```
   ================================================================================
   🚀 Starting AI Fund Scan Backend API
   ================================================================================
   INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
   INFO:     Application startup complete.
   ```

2. **Open Postman** (or download from https://www.postman.com/downloads/)

---

## Test 1: Health Check Endpoint

### Request Setup:
- **Method:** `GET`
- **URL:** `http://localhost:8000/api/health`
- **Headers:** None required
- **Body:** None

### Expected Response:
**Status:** `200 OK`

**Response Body:**
```json
{
    "status": "ok",
    "phase": "2 - Company Search",
    "endpoints_available": [
        "/api/health",
        "/api/search"
    ]
}
```

### What This Tells You:
- ✅ Backend server is running properly
- ✅ Phase 2 implementation is active
- ✅ `/api/search` endpoint is available

---

## Test 2: Search by Company Name

### Request Setup:
- **Method:** `POST`
- **URL:** `http://localhost:8000/api/search`
- **Headers:**
  - `Content-Type: application/json`
- **Body:** (Select "raw" and "JSON")
  ```json
  {
      "query": "OpenAI"
  }
  ```

### Expected Response:
**Status:** `200 OK`

**Response Time:** ~300-500ms (with mock data)

**Response Body:**
```json
{
    "query": "OpenAI",
    "results": [
        {
            "name": "OpenAI",
            "domain": "openai.com",
            "crunchbase_url": "https://www.crunchbase.com/organization/openai",
            "description": "OpenAI is an innovative technology company focused on cutting-edge solutions.",
            "confidence": 0.95,
            "logo_url": null,
            "funding_snippet": "$10M+ raised"
        },
        {
            "name": "OpenAI Inc",
            "domain": "openaiinc.com",
            "crunchbase_url": "https://www.crunchbase.com/organization/openai-inc",
            "description": "OpenAI Inc is a related company in the technology sector.",
            "confidence": 0.8,
            "logo_url": null,
            "funding_snippet": "$5M+ raised"
        },
        {
            "name": "OpenAI Technologies",
            "domain": "openaitech.com",
            "crunchbase_url": "https://www.crunchbase.com/organization/openai-technologies",
            "description": "OpenAI Technologies provides enterprise software solutions.",
            "confidence": 0.7,
            "logo_url": null,
            "funding_snippet": "$2M+ raised"
        }
    ],
    "count": 3
}
```

### What to Verify:
- ✅ Returns 3 company results
- ✅ Each result has `name`, `domain`, `crunchbase_url`, `description`, `confidence`, `funding_snippet`
- ✅ Confidence scores are sorted descending (0.95, 0.8, 0.7)
- ✅ Response includes `query` and `count` fields

---

## Test 3: Search by Company URL

### Request Setup:
- **Method:** `POST`
- **URL:** `http://localhost:8000/api/search`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
      "query": "https://stripe.com"
  }
  ```

### Expected Response:
**Status:** `200 OK`

**Response Body:**
```json
{
    "query": "https://stripe.com",
    "results": [
        {
            "name": "stripe.com",
            "domain": "stripe.com.com",
            "crunchbase_url": "https://www.crunchbase.com/organization/stripe.com",
            "description": "stripe.com is an innovative technology company focused on cutting-edge solutions.",
            "confidence": 0.95,
            "logo_url": null,
            "funding_snippet": "$10M+ raised"
        },
        {
            "name": "stripe.com Inc",
            "domain": "stripe.cominc.com",
            "crunchbase_url": "https://www.crunchbase.com/organization/stripe.com-inc",
            "description": "stripe.com Inc is a related company in the technology sector.",
            "confidence": 0.8,
            "logo_url": null,
            "funding_snippet": "$5M+ raised"
        },
        {
            "name": "stripe.com Technologies",
            "domain": "stripe.comtech.com",
            "crunchbase_url": "https://www.crunchbase.com/organization/stripe.com-technologies",
            "description": "stripe.com Technologies provides enterprise software solutions.",
            "confidence": 0.7,
            "logo_url": null,
            "funding_snippet": "$2M+ raised"
        }
    ],
    "count": 3
}
```

### What to Verify:
- ✅ URL is accepted as input
- ✅ Domain is extracted from URL (visible in backend logs)
- ✅ Returns structured results just like company name search

---

## Test 4: Error Case - Empty Query

### Request Setup:
- **Method:** `POST`
- **URL:** `http://localhost:8000/api/search`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
      "query": ""
  }
  ```

### Expected Response:
**Status:** `400 Bad Request`

**Response Body:**
```json
{
    "detail": "Query cannot be empty"
}
```

### What to Verify:
- ✅ Server returns proper HTTP 400 error code
- ✅ Error message is clear and actionable

---

## Test 5: Error Case - Missing Query Field

### Request Setup:
- **Method:** `POST`
- **URL:** `http://localhost:8000/api/search`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
      "name": "OpenAI"
  }
  ```
  *(Note: wrong field name)*

### Expected Response:
**Status:** `422 Unprocessable Entity`

**Response Body:**
```json
{
    "detail": [
        {
            "type": "missing",
            "loc": [
                "body",
                "query"
            ],
            "msg": "Field required",
            "input": {
                "name": "OpenAI"
            }
        }
    ]
}
```

### What to Verify:
- ✅ Pydantic validation catches missing required field
- ✅ Error message indicates which field is missing

---

## Test 6: Different Company Names

Try searching for various companies to see the mock data adapts:

### Test Cases:
1. `{"query": "Airbnb"}`
2. `{"query": "Uber"}`
3. `{"query": "Tesla"}`
4. `{"query": "SpaceX"}`

### Expected Behavior:
- Each query returns 3 results
- Company names adapt to the query
- Confidence scores remain consistent (0.95, 0.8, 0.7)

---

## Viewing Backend Logs

While testing in Postman, check your terminal where the server is running. You should see detailed logs:

### Example Log Output:
```
================================================================================
🔍 POST /api/search - Query: 'OpenAI'
================================================================================
2025-10-17 14:08:39 | DEBUG    | Validating search query: 'OpenAI'
2025-10-17 14:08:39 | INFO     | Calling crunchbase_scraper.search_crunchbase()
2025-10-17 14:08:39 | INFO     | 🔍 Starting Crunchbase search for query: 'OpenAI'
2025-10-17 14:08:39 | DEBUG    | Search parameters: limit=5
2025-10-17 14:08:39 | WARNING  | ⚠️  Firecrawl API failed: Unauthorized: Invalid token
2025-10-17 14:08:39 | INFO     | Falling back to mock data for testing
2025-10-17 14:08:39 | INFO     | ✅ Returning 3 mock results for 'OpenAI'
2025-10-17 14:08:39 | INFO     | ✅ Search completed in 0.31s - Found 3 results
```

### What the Logs Tell You:
- Request received and validated
- Firecrawl API attempt (currently fails due to placeholder key)
- Graceful fallback to mock data
- Response time and result count
- All steps in the workflow

---

## Creating a Postman Collection

To save these tests for reuse:

1. **Create New Collection:**
   - Click "New" → "Collection"
   - Name: "AI Fund Scan - Phase 2"

2. **Add Requests:**
   - Click "Add Request" inside the collection
   - Name each test (e.g., "Health Check", "Search by Name", etc.)
   - Configure each request as described above

3. **Save Environment Variables:**
   - Click "Environments" → "Create Environment"
   - Name: "Local Development"
   - Add variable: `base_url` = `http://localhost:8000`
   - Use `{{base_url}}/api/search` in requests

4. **Export Collection:**
   - Right-click collection → "Export"
   - Share with team members

---

## Troubleshooting

### Server Not Running
**Error:** `Could not get response` or `Connection refused`

**Solution:**
```bash
# Check if server is running
lsof -i :8000

# If not, start it:
cd /Users/sanyam/Documents/personal/sxsw-hackathon/backend
source venv/bin/activate
python main.py
```

### 500 Internal Server Error
**Possible Causes:**
- Check backend logs for Python errors
- Verify `.env` file exists
- Ensure all dependencies installed: `pip install -r requirements.txt`

### CORS Errors (when testing from browser)
**Note:** Postman bypasses CORS. If testing from frontend:
- Backend already configured for `localhost:5173` and `localhost:3000`
- Check `config.py` CORS_ORIGINS if using different port

---

## Phase 2 vs Production

### Current Behavior (Phase 2):
- ✅ Uses mock data for testing
- ✅ Firecrawl API attempted but falls back gracefully
- ✅ Fast responses (~0.3s)
- ✅ Consistent data structure

### Future Behavior (Production):
When you add a real Firecrawl API key to `.env`:
```bash
FIRECRAWL_API_KEY=fc-your-actual-api-key
```

- Will scrape real Crunchbase data
- Response time: ~5-10 seconds
- Returns actual company information
- Still falls back to mock if scraping fails

---

## Next Steps

After confirming Phase 2 works:
1. **Frontend Integration:** Connect React app to `/api/search`
2. **Phase 3:** Implement `/api/analyze` endpoint with LlamaIndex workflow
3. **Production:** Add real Firecrawl API key for Crunchbase scraping

---

## Quick Reference

| Endpoint | Method | Purpose | Response Time |
|----------|--------|---------|---------------|
| `/api/health` | GET | Server status | <100ms |
| `/api/search` | POST | Company search | ~300ms (mock) |
| `/api/analyze` | POST | Full analysis | Phase 3+ |

---

## Success Checklist

- [ ] Health check returns "Phase 2 - Company Search"
- [ ] Search by name returns 3 results
- [ ] Search by URL extracts domain correctly
- [ ] Empty query returns 400 error
- [ ] Backend logs show detailed workflow
- [ ] Response time under 1 second
- [ ] All JSON responses properly formatted
- [ ] Can create repeatable Postman collection

**Phase 2 is complete when all boxes are checked!** ✅
