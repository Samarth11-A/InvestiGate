import { useState, useEffect } from "react";
import { AnalysisInput } from "@/components/AnalysisInput";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { CompanySummary } from "@/components/CompanySummary";
import { FinancialMetrics } from "@/components/FinancialMetrics";
import { NewsHighlights } from "@/components/NewsHighlights";
import { RiskAssessment } from "@/components/RiskAssessment";
import { InvestmentOutlook } from "@/components/InvestmentOutlook";

const mockData = {
  TSLA: {
    name: "Tesla Inc.",
    marketCap: "$1.15T",
    ytdChange: 12.3,
    price: "$345.67",
    sector: "Automotive & Clean Energy",
    metrics: [
      { label: "P/E Ratio", value: "68.4", description: "Price to Earnings" },
      { label: "ROE", value: "19.2%", description: "Return on Equity" },
      { label: "Debt/Equity", value: "0.45", description: "Financial Leverage" },
      { label: "Profit Margin", value: "13.5%", description: "Net Profitability" },
    ],
    news: [
      {
        title: "Tesla Expands Battery Manufacturing in Berlin",
        date: "Oct 15, 2025",
        source: "Reuters",
        summary: "New gigafactory expansion aims to triple battery production capacity by Q2 2026.",
      },
      {
        title: "SEC Filing Reveals Supply Chain Concerns",
        date: "Oct 12, 2025",
        source: "SEC.gov",
        summary: "Company reports potential margin volatility due to lithium pricing fluctuations.",
      },
      {
        title: "Q3 Earnings Beat Analyst Expectations",
        date: "Oct 10, 2025",
        source: "Bloomberg",
        summary: "Revenue up 18% YoY driven by strong Model Y sales in Asia-Pacific markets.",
      },
    ],
    risks: [
      {
        category: "Market Competition",
        level: "high" as const,
        description: "Rising competition from legacy automakers and Chinese EV manufacturers putting pressure on market share.",
      },
      {
        category: "Supply Chain",
        level: "medium" as const,
        description: "Dependency on lithium and rare earth materials creates exposure to commodity price volatility.",
      },
      {
        category: "Regulatory Environment",
        level: "low" as const,
        description: "Strong government support for EV adoption in key markets provides favorable regulatory tailwinds.",
      },
    ],
    outlook: {
      recommendation: "Moderate Buy" as const,
      confidence: 76,
      summary: "Tesla maintains strong fundamentals with robust revenue growth and expanding production capacity. However, increasing competition and supply chain uncertainties warrant a cautious approach. Long-term outlook remains positive given the global shift toward electric vehicles and renewable energy.",
    },
  },
};

const analysisSteps = [
  { label: "Scraping financial data from web sources", status: "pending" as const },
  { label: "Extracting SEC filings and earnings reports", status: "pending" as const },
  { label: "Computing financial ratios and metrics", status: "pending" as const },
  { label: "Analyzing recent news and sentiment", status: "pending" as const },
  { label: "Generating AI-powered summary", status: "pending" as const },
];

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTicker, setSelectedTicker] = useState<string>("");

  const handleAnalyze = (ticker: string) => {
    setSelectedTicker(ticker);
    setIsAnalyzing(true);
    setShowResults(false);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (isAnalyzing && currentStep < analysisSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (isAnalyzing && currentStep >= analysisSteps.length) {
      setTimeout(() => {
        setIsAnalyzing(false);
        setShowResults(true);
      }, 500);
    }
  }, [isAnalyzing, currentStep]);

  const data = mockData[selectedTicker as keyof typeof mockData] || mockData.TSLA;

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-12">
        {!isAnalyzing && !showResults ? (
          <div className="flex items-center justify-center min-h-[80vh]">
            <AnalysisInput onAnalyze={handleAnalyze} />
          </div>
        ) : isAnalyzing ? (
          <div className="max-w-2xl mx-auto mt-20">
            <AnalysisProgress steps={analysisSteps} currentStep={currentStep} />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Investment Analysis Report</h1>
                <p className="text-muted-foreground">
                  Generated for {selectedTicker} • {new Date().toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowResults(false);
                  setSelectedTicker("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
              >
                ← New Analysis
              </button>
            </div>

            <CompanySummary
              ticker={selectedTicker}
              name={data.name}
              marketCap={data.marketCap}
              ytdChange={data.ytdChange}
              price={data.price}
              sector={data.sector}
            />

            <FinancialMetrics metrics={data.metrics} />

            <div className="grid md:grid-cols-2 gap-6">
              <NewsHighlights news={data.news} />
              <RiskAssessment risks={data.risks} />
            </div>

            <InvestmentOutlook
              recommendation={data.outlook.recommendation}
              confidence={data.outlook.confidence}
              summary={data.outlook.summary}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
