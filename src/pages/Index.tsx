import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AnalysisInput } from "@/components/AnalysisInput";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { CompanySummary } from "@/components/CompanySummary";
import { TractionMetrics } from "@/components/TractionMetrics";
import { TeamQuality } from "@/components/TeamQuality";
import { MarketSignals } from "@/components/MarketSignals";
import { RiskAssessment } from "@/components/RiskAssessment";
import { InvestmentIndicators } from "@/components/InvestmentIndicators";
import { InvestmentOutlook } from "@/components/InvestmentOutlook";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const mockData = {
  ACME: {
    name: "Acme AI Labs",
    domain: "acmeai.io",
    foundedDate: "March 2024",
    industry: "Enterprise AI / SaaS",
    businessModel: "B2B SaaS",
    productDescription: "AI-powered workflow automation platform that helps mid-market companies automate repetitive business processes using natural language. No-code interface enables business users to create custom automation without technical expertise.",
    geographicFocus: "North America, expanding to Europe",
    traction: {
      employeeCount: 12,
      employeeGrowth6m: "50%",
      employeeGrowth1y: "200%",
      fundingStage: "Pre-Seed",
      totalRaised: "$2.1M",
      recentRound: "$2.1M Pre-Seed",
      revenueIndicator: "$25K MRR",
      customerCount: "18 paying",
    },
    team: {
      founders: [
        {
          name: "Sarah Chen",
          role: "CEO & Co-Founder",
          background: "Former VP of Engineering at Salesforce, 12 years in enterprise software. Stanford CS.",
          previousExits: "Acquired by Salesforce (2019) - workforce analytics startup ($45M)",
        },
        {
          name: "Michael Rodriguez",
          role: "CTO & Co-Founder",
          background: "Ex-Google AI Research, led ML infrastructure team. PhD in Machine Learning from MIT.",
        },
      ],
      keyExecutives: [
        {
          name: "Jennifer Park",
          role: "Head of Product",
          background: "Former Product Lead at Notion, 8 years in SaaS product management",
        },
      ],
      teamComposition: "60% engineering, 25% product/design, 15% sales/marketing. Strong technical foundation with emerging go-to-market capabilities.",
      teamGaps: "Need VP of Sales and Head of Customer Success for scaling",
    },
    market: {
      competitivePosition: "Differentiated by vertical-specific AI models and ease of use. Competing with Zapier, Make.com but focused on AI-native approach.",
      marketSize: "$12.8B TAM",
      growthTrend: "Growing 23% CAGR through 2028",
      recentPress: [
        {
          title: "Acme AI raises $2.1M to democratize workflow automation",
          date: "Oct 15, 2025",
          source: "TechCrunch",
          sentiment: "positive" as const,
        },
        {
          title: "Y Combinator W24 batch company sees rapid adoption",
          date: "Oct 8, 2025",
          source: "VentureBeat",
          sentiment: "positive" as const,
        },
        {
          title: "Industry experts question sustainability of AI automation startups",
          date: "Sep 28, 2025",
          source: "The Information",
          sentiment: "neutral" as const,
        },
      ],
      techStack: ["Python", "React", "PostgreSQL", "AWS", "OpenAI GPT-4", "LangChain", "Kubernetes"],
    },
    risks: [
      {
        category: "Market Timing",
        level: "medium" as const,
        description: "Crowded AI automation space with well-funded competitors. Need to establish differentiation quickly.",
      },
      {
        category: "Technical Execution",
        level: "low" as const,
        description: "Strong technical team with proven track record. Product is already in market with paying customers.",
      },
      {
        category: "Go-to-Market",
        level: "high" as const,
        description: "Limited sales and marketing expertise. Customer acquisition strategy still being refined. High CAC for current deal sizes.",
      },
    ],
    indicators: {
      hiringVelocity: {
        openPositions: 5,
        recentHires: "3 engineers hired in last 2 months",
      },
      productLaunches: [
        "AI Workflow Builder v2.0 with natural language interface (Sep 2025)",
        "Enterprise security features and SSO integration (Aug 2025)",
        "Slack and Microsoft Teams integrations (July 2025)",
      ],
      partnerships: ["AWS Partner Network", "OpenAI Partner", "Y Combinator W24"],
      growthTrajectory: "Revenue growing 40% MoM over last 3 months. User engagement metrics strong (80% weekly active rate). Early signs of product-market fit in mid-market segment.",
    },
    outlook: {
      recommendation: "Strong Investment" as const,
      confidence: 82,
      summary: "Acme AI demonstrates strong founder-market fit with proven enterprise software expertise and successful prior exit. Technical execution is solid with a differentiated product gaining early traction. Primary concern is go-to-market execution and high customer acquisition costs. The team's ability to scale GTM will be critical. Market timing is favorable with strong tailwinds in AI automation. Recommend investment with close monitoring of sales efficiency metrics.",
    },
  },
};

const analysisSteps = [
  { label: "Scraping company website and online presence", status: "pending" as const },
  { label: "Extracting funding data and team information", status: "pending" as const },
  { label: "Analyzing traction metrics and growth indicators", status: "pending" as const },
  { label: "Evaluating market signals and competitive landscape", status: "pending" as const },
  { label: "Generating AI-powered investment summary", status: "pending" as const },
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

  const data = mockData[selectedTicker as keyof typeof mockData] || mockData.ACME;

  const handleNewAnalysis = () => {
    setShowResults(false);
    setSelectedTicker("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showActions={showResults} 
        onNewAnalysis={handleNewAnalysis}
      />
      
      <div className="container mx-auto px-4 py-8">
        {!isAnalyzing && !showResults ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <AnalysisInput onAnalyze={handleAnalyze} />
          </div>
        ) : isAnalyzing ? (
          <div className="max-w-2xl mx-auto mt-20">
            <AnalysisProgress steps={analysisSteps} currentStep={currentStep} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Report Header */}
            <div className="mb-8 pb-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">Investment Analysis Report</h1>
                  </div>
                  <p className="text-muted-foreground">
                    {data.name} • Generated {new Date().toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Company Overview Section */}
            <div className="mb-8">
              <CompanySummary
                name={data.name}
                domain={data.domain}
                foundedDate={data.foundedDate}
                industry={data.industry}
                businessModel={data.businessModel}
                productDescription={data.productDescription}
                geographicFocus={data.geographicFocus}
              />
            </div>

            {/* Tabbed Content for Better Organization */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="outlook">Outlook</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <TractionMetrics {...data.traction} />
                <TeamQuality {...data.team} />
              </TabsContent>

              <TabsContent value="metrics" className="space-y-6">
                <InvestmentIndicators {...data.indicators} />
                <div className="grid md:grid-cols-2 gap-6">
                  <MarketSignals {...data.market} />
                  <RiskAssessment risks={data.risks} />
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <MarketSignals {...data.market} />
                  <RiskAssessment risks={data.risks} />
                </div>
                <TeamQuality {...data.team} />
              </TabsContent>

              <TabsContent value="outlook" className="space-y-6">
                <InvestmentOutlook
                  recommendation={data.outlook.recommendation}
                  confidence={data.outlook.confidence}
                  summary={data.outlook.summary}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
