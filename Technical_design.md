# AI-Powered Investment Analysis Automation Tool

**Technical Design Document (v1.0 · October 2025)**

***

## System Overview

The platform automates **investment research, vetting, and summarization** by using:

- **Firecrawl** for scalable, structured financial web crawling and scraping
- **AI agents** for domain-specific data extraction, financial computation, and investment summarization
- **LLM summarizers** fine-tuned for financial contexts to produce a **one-page investment summary document** per company

***

## System Architecture

### Layered Architecture Overview

| Layer | Description |
| :-- | :-- |
| **Frontend** | Minimal interface (Streamlit or React) for input (company name/ticker), document generation, and output visualization. |
| **Backend (Python)** | Core orchestration layer built using FastAPI or Flask; manages agent coordination, Firecrawl calls, and summarization workflows. |
| **Data Pipeline** | Firecrawl-based crawl/scrape endpoints provide unified structured data (SEC filings, earnings reports, news, financial KPIs). |
| **AI Agent System** | Supervisor agent coordinates sub-agents responsible for analytics, aggregation, and summarization. |
| **Report Generation** | Produces PDF or Markdown-based summaries; can integrate with FPDF or WeasyPrint. |


***

## Firecrawl Integration

- **Crawl Endpoint**: Recursive traversal of relevant financial domains for a given query (company name/ticker)[^3]
- **Scrape Endpoint**: Extracts structured data (HTML, Markdown, or JSON) for SEC filings, press releases, or earnings reports[^8]
- **Output Format**: Structured data fed into agents as contextual documents stored in ChromaDB for summarization.

Example schema for extracted data:

```python
class FinancialDoc(BaseModel):
    source_url: str
    type: Literal["news", "report", "filing"]
    content: str
    date: datetime
```


***

## Backend Stack (Python Core)

| Component | Technology | Function |
| :-- | :-- | :-- |
| **Web Framework** | FastAPI | REST API endpoints for user requests and agent control. |
| **Orchestration** | **LlamaIndex Workflow** | Event-driven workflow engine for multi-agent coordination and step management. |
| **Agent Framework** | LlamaIndex Agents + Tools | 
| **Scraping Integration** | Firecrawl SDK / REST | Data acquisition from the web. |
| **Database** | PostgreSQL | Persistence of financial summaries and metadata. |
| **Vector Store** | ChromaDB / FAISS | Semantic memory and caching for repeated company analysis. |
| **AI Models** | OpenAI GPT-4 Turbo / Financial Pegasus | Natural language summarization, insight generation. |
| **Visualization** | Plotly / Matplotlib | Graph generation for financial KPIs. |


***

## LlamaIndex Workflow Integration

The investment analysis pipeline leverages **LlamaIndex Workflow** for orchestrating the end-to-end process:

### Workflow Architecture

```python
from llama_index.core.workflow import Workflow, StartEvent, StopEvent, step

class InvestmentAnalysisWorkflow(Workflow):
    @step
    async def crawl_financial_data(self, ev: StartEvent) -> DataCrawledEvent:
        """Scrape financial data using Firecrawl"""
        company = ev.company_name
        # Firecrawl scraping logic
        return DataCrawledEvent(data=scraped_data)
    
    @step
    async def analyze_and_compute(self, ev: DataCrawledEvent) -> AnalysisEvent:
        """Compute financial ratios and metrics"""
        # Financial analysis logic
        return AnalysisEvent(metrics=computed_metrics)
    
    @step
    async def generate_summary(self, ev: AnalysisEvent) -> StopEvent:
        """Generate one-page investment summary"""
        # LLM summarization
        return StopEvent(result=summary_document)
```

### Key Benefits

- **Event-Driven Pipeline**: Each step emits events that automatically trigger downstream steps
- **State Management**: Context and data flow seamlessly between workflow steps
- **Error Handling**: Built-in retry logic and graceful failure recovery
- **Observability**: Native logging and debugging for complex pipelines
- **Async Execution**: Non-blocking operations for efficient data processing

### Workflow Steps

| Step | Input | Output | Function |
| :-- | :-- | :-- | :-- |
| **Data Crawling** | Company name/ticker | Raw financial documents | Firecrawl scrapes SEC filings, news, earnings reports |
| **Analysis** | Raw documents | Financial metrics (P/E, ROE, etc.) | Compute ratios and extract KPIs |
| **Summarization** | Metrics + documents | One-page summary | LLM generates investment report |

***

## Example Workflow Execution

1. **Input**: User specifies company name "Tesla Inc."
2. **Workflow Execution**:
    - **Step 1**: Firecrawl crawls Yahoo Finance, Reuters, SEC filings
    - **Step 2**: Compute financial ratios from scraped + API data
    - **Step 3**: LLM condenses results into one-page Markdown/PDF summary
3. **Output**: Structured, visual summary (1-page PDF or dashboard)

***

## Output Example (One-Page Summary)

**Tesla Inc. (TSLA)**

- **Market Summary**: \$1.15T, +12.3% YTD
- **Key Ratios**: P/E 68.4, ROE 19.2%
- **Recent News Highlights**:
    - Expansion of battery manufacturing plant in Berlin (Oct 2025)
    - SEC filing indicates profit margin volatility due to material costs
- **Risks**: Global EV competition rising, volatile energy costs
- **Investment Outlook**: Moderate Buy (AI Confidence: 76%)

***

## Extensions and Future Enhancements

- Sentiment-scored aggregations from social media and forums
- Integration with financial APIs (Morningstar, Nasdaq)
- Automated portfolio / recommendation generation using Qubinets’ query-to-SQL design[^9]
- Real-time metrics dashboard

***

This architecture emphasizes modular Python-based scalability, autonomous financial reasoning via multi-agent systems, and Firecrawl-powered data ingestion for a robust investment analysis engine.
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^20]</span>

<div align="center">⁂</div>
