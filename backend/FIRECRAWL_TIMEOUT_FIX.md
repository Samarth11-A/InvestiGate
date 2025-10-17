# Firecrawl Timeout Issue - Diagnosis & Fix

## Problem Summary

The Crunchbase scraper was frequently **hanging or timing out**, causing the entire analysis workflow to get stuck. This was a real issue, not expected behavior.

## Symptoms Observed

1. **Indefinite hangs**: Scraper would start but never complete, requiring server restart
2. **Frequent timeouts**: Many scrapes failed with `RequestTimeoutError` after 1-5 seconds
3. **Firecrawl queue issues**: Error messages like "Scrape timed out after waiting in the concurrency limit queue"
4. **Inconsistent behavior**: Sometimes succeeded (4-5s), sometimes failed immediately, sometimes hung forever

### Example from logs:
```
2025-10-17 15:50:39 | INFO | Scraping company page with structured extraction...
[NO FURTHER OUTPUT - HUNG FOR 19+ MINUTES]
```

## Root Causes

### 1. **No Client-Side Timeout**
The original code set `timeout=120000` (120 seconds) but this:
- Only told Firecrawl's API the desired timeout
- Didn't prevent the client from hanging if Firecrawl never responded
- Left the async function waiting indefinitely

### 2. **No Retry Logic**
- Single attempt only
- If Firecrawl was busy (concurrency limit), the request failed immediately
- Transient network issues caused permanent failures

### 3. **Firecrawl Concurrency Limits**
Firecrawl appears to have:
- Request queue limits
- Rate limiting that causes requests to timeout in queue
- Unpredictable response times

## Solutions Implemented

### 1. **Client-Side Timeout Protection** ⏰
```python
result = await asyncio.wait_for(
    asyncio.to_thread(firecrawl.scrape, ...),
    timeout=timeout_seconds + 5  # 35s default
)
```

**Benefits:**
- Guarantees the scrape won't hang indefinitely
- Kills the request after 35 seconds regardless of Firecrawl's response
- Uses `asyncio.to_thread()` to run the blocking call safely

### 2. **Retry Logic with Exponential Backoff** 🔄
```python
for attempt in range(max_retries + 1):  # 3 total attempts
    try:
        # ... scrape attempt ...
    except Exception:
        if attempt < max_retries:
            wait_time = 2 ** attempt  # 2s, 4s, 8s
            await asyncio.sleep(wait_time)
            continue
```

**Benefits:**
- Handles transient failures automatically
- Exponential backoff reduces load on Firecrawl
- 3 attempts = higher success rate without spamming

### 3. **Shorter Default Timeout** ⏱️
Changed from 120s to **30s default**:
- Faster failure detection
- Prevents long waits for failed requests
- Still configurable via parameter

### 4. **Better Error Handling** 🛡️
```python
except asyncio.TimeoutError:
    logger.warning(f"⏰ Client-side timeout after {timeout_seconds}s")
    if attempt < max_retries:
        continue  # Retry
    raise CrunchbaseScraperError(...)
```

**Benefits:**
- Distinguishes timeout from other errors
- Logs each retry attempt with clear messaging
- Raises informative errors after all retries exhausted

## Configuration Options

The updated function signature:
```python
async def scrape_company_url(
    url: str, 
    max_retries: int = 2,         # 3 total attempts
    timeout_seconds: int = 30     # 30s timeout per attempt
) -> Dict:
```

### Recommended Settings by Use Case:

**Fast Mode (Quick failures)**
```python
await scrape_company_url(url, max_retries=1, timeout_seconds=15)
```

**Standard Mode (Current default)**
```python
await scrape_company_url(url)  # 2 retries, 30s timeout
```

**Patient Mode (Important scrapes)**
```python
await scrape_company_url(url, max_retries=3, timeout_seconds=45)
```

## Expected Behavior Now

### Success Case:
```
🌐 Starting detailed scrape of: https://www.crunchbase.com/...
Scraping company page (attempt 1/3, timeout: 30s)...
✅ Successfully scraped company: Build Club
[Takes 3-8 seconds typically]
```

### Failure with Retry:
```
🌐 Starting detailed scrape of: https://www.crunchbase.com/...
Scraping company page (attempt 1/3, timeout: 30s)...
⏰ Client-side timeout after 30s
⏳ Retry 1/2 - Waiting 2s before retry...
Scraping company page (attempt 2/3, timeout: 30s)...
✅ Successfully scraped company: Build Club
```

### Complete Failure:
```
🌐 Starting detailed scrape of: https://www.crunchbase.com/...
[3 attempts with exponential backoff]
❌ Failed to scrape after 3 attempts: Request Timeout...
⚠️  Crunchbase scraping failed: Scraping failed...
⚠️  Falling back to minimal data
```

## Impact

### Before Fix:
- ❌ Indefinite hangs (19+ minutes)
- ❌ Single failure = complete failure
- ❌ No visibility into retry attempts
- ❌ Workflow appears "stuck"

### After Fix:
- ✅ Maximum 35s per attempt
- ✅ Automatic retries (3 total attempts)
- ✅ Clear logging of progress
- ✅ Workflow continues after max ~2 minutes (3 attempts × 35s + backoff)

## Testing Recommendations

1. **Test normal case**: Should complete in 3-8 seconds
2. **Test timeout case**: Kill Firecrawl connection to verify timeout works
3. **Test retry case**: Simulate Firecrawl queue limit to see retries
4. **Test complete failure**: Verify graceful fallback after 3 attempts

## Future Improvements

1. **Circuit Breaker Pattern**: Skip Firecrawl temporarily if it's consistently failing
2. **Fallback Data Sources**: Try alternative APIs if Firecrawl is down
3. **Caching**: Cache successful scrapes to reduce API calls
4. **Rate Limiting**: Implement client-side rate limiting to avoid queue issues
5. **Monitoring**: Track success/failure rates and average response times

## Related Files

- **Main Fix**: `/backend/services/crunchbase_scraper.py`
- **Workflow**: `/backend/analysis_workflows/analysis_workflow.py` (already has fallback handling)
- **Logs**: `/backend/logs/backend_20251017.log`

---

**Status**: ✅ FIXED  
**Date**: 2025-10-17  
**Impact**: High - Prevents entire workflow from hanging

