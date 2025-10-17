# Backend Integration with HITL Plan

## Architecture Overview

**Monorepo Structure:**

- `/backend` - Python FastAPI server with LlamaIndex agents
- `/src` - Existing React frontend (unchanged location)
- Communication via REST API (no WebSockets needed)

**HITL Flow:**

1. User enters company name/URL → Frontend calls `/api/search`
2. Backend scrapes basic info → Returns company preview
3. User confirms company → Frontend calls `/api/analyze`
4. Backend runs full analysis → Returns comprehensive report
5. Frontend displays results (existing UI components)

---

## Backend Setup (`/backend`)

### File Structure

```
/backend
├── main.py              # FastAPI app entry point
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
├── config.py           # Configuration management
├── api/
│   └── routes.py       # API endpoints
├── services/
│   ├── scraper.py      # Firecrawl integration
│   └── llm.py          # LLM service wrapper
├── agents/
│   ├── workflow.py     # LlamaIndex workflow orchestration
│   └── analysis_agents.py  # Individual analysis agents
└── models/
    └── schemas.py      # Pydantic models for API
```

### API Endpoints

**POST /api/search**

- Input: `{ "query": "company name or URL" }`
- Returns: `{ "company": { "name", "domain", "description" }, "confidence": 0.85 }`
- Purpose: Initial company lookup and preview for HITL confirmation

**POST /api/analyze**

- Input: `{ "company_url": "acmeai.io", "analysis_depth": "standard" }`
- Returns: Full analysis object matching current `mockData` structure
- Purpose: Run complete LlamaIndex workflow after user confirmation

**GET /api/health**

- Returns: `{ "status": "ok" }`
- Purpose: Backend health check

---

## Frontend Modifications (`/src`)

### New Service Layer

**File: `/src/services/api.ts`**

- Create API client with axios/fetch
- Define TypeScript interfaces matching backend schemas
- Handle API errors and loading states

### Updated Components

**`/src/pages/Index.tsx`**

- Replace mock data with API calls
- Add confirmation step after search (HITL)
- Handle loading/error states
- Keep existing UI components unchanged

**`/src/components/AnalysisInput.tsx`**

- Wire up search to `/api/search` endpoint
- Display returned company info for confirmation
- Trigger `/api/analyze` on user confirmation

### State Management Flow

```typescript
// 1. User searches
setIsSearching(true)
const preview = await api.searchCompany(query)
setCompanyPreview(preview)
setShowConfirmation(true)

// 2. User confirms (HITL)
setIsAnalyzing(true)
const results = await api.analyzeCompany(preview.domain)
setAnalysisResults(results)
setShowResults(true)
```

---

## Implementation Details

### Backend Core Components

**LlamaIndex Workflow (`agents/workflow.py`):**

- Step 1: Firecrawl scrapes company website, news, LinkedIn
- Step 2: Extract structured data (funding, team, metrics)
- Step 3: LLM agents analyze each category (traction, risks, outlook)
- Step 4: Aggregate into final report matching frontend schema

**Data Mapping:**

- Backend output must match TypeScript interfaces from `mockData`
- Include all fields: `name`, `domain`, `traction`, `team`, `market`, `risks`, `indicators`, `outlook`

### Frontend Integration Points

**Replace this line in `Index.tsx`:**

```typescript
// OLD: const data = mockData[selectedTicker as keyof typeof mockData] || mockData.ACME;
// NEW: const data = analysisResults;
```

**Add environment variable:**

```
VITE_API_URL=http://localhost:8000
```

### Error Handling

- Backend validation errors → Show user-friendly messages
- Scraping failures → Fallback to limited analysis
- Timeout handling → Progress indicator with estimated time

---

## Development Workflow

### Running Locally

```bash
# Terminal 1: Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
npm run dev  # Runs on port 5173
```

### CORS Configuration

Backend must allow frontend origin:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Dependencies

### Backend (`requirements.txt`)

```
fastapi==0.104.1
uvicorn==0.24.0
llama-index==0.9.0
llama-index-agent-openai==0.1.0
firecrawl-py==0.0.5
openai==1.0.0
python-dotenv==1.0.0
pydantic==2.5.0
```

### Frontend (already installed)

- `@tanstack/react-query` - for API state management
- axios (add if not present) - for HTTP calls

---

## Testing Strategy

1. **Backend Unit Tests**: Test individual agents and services
2. **API Integration Tests**: Validate endpoint contracts
3. **Frontend Integration**: Test with mock backend responses first
4. **E2E Test**: Full flow from search to analysis display

---

## Key Files to Modify/Create

### Create New

- `/backend/main.py` - FastAPI application
- `/backend/requirements.txt` - Python dependencies
- `/backend/agents/workflow.py` - LlamaIndex workflow
- `/backend/api/routes.py` - API endpoints
- `/src/services/api.ts` - Frontend API client
- `/src/types/analysis.ts` - TypeScript interfaces
- `/.env` files for both frontend and backend

### Modify Existing

- `/src/pages/Index.tsx` - Replace mock data with API calls
- `/src/components/AnalysisInput.tsx` - Add HITL confirmation flow
- `/package.json` - Add axios if needed
- `/README.md` - Update setup instructions

---

## Success Criteria

✓ User can search for a company and see preview

✓ User confirms company details (HITL step)

✓ Backend generates real analysis using LlamaIndex

✓ Frontend displays results in existing UI

✓ Error handling works gracefully

✓ Both services run locally without issues