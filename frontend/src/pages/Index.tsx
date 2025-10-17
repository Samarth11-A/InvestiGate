import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { AnalysisInput } from "@/components/AnalysisInput";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { CompanySummary } from "@/components/CompanySummary";
import { TractionMetrics } from "@/components/TractionMetrics";
import { TeamQuality } from "@/components/TeamQuality";
import { MarketSignals } from "@/components/MarketSignals";
import { RiskAssessment } from "@/components/RiskAssessment";
import { InvestmentOutlook } from "@/components/InvestmentOutlook";
import { DeepMarketResearch } from "@/components/DeepMarketResearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { analyzeCompany } from "@/services/api";
import type { AnalysisResult } from "@/types/api";
import {
  adaptTractionData,
  adaptTeamData,
  adaptMarketData,
  adaptRisksData,
  adaptOutlook,
  adaptCompanySummary,
} from "@/utils/dataAdapter";

// Mock data removed - using real API data

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
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // React Query mutation for analysis
  const analysisMutation = useMutation({
    mutationFn: ({ companyUrl, crunchbaseUrl }: { companyUrl: string; crunchbaseUrl: string }) =>
      analyzeCompany(companyUrl, crunchbaseUrl),
    onSuccess: (data) => {
      setAnalysisResult(data);
      setIsAnalyzing(false);
      setShowResults(true);
      toast.success("Analysis complete!");
    },
    onError: (error: Error) => {
      console.error("Analysis error:", error);
      toast.error(error.message || "Analysis failed. Please try again.");
      setIsAnalyzing(false);
    },
  });

  const handleAnalyze = (companyUrl: string, crunchbaseUrl: string) => {
    setIsAnalyzing(true);
    setShowResults(false);
    toast.info("Analysis started. This will take 2-3 minutes...");
    analysisMutation.mutate({ companyUrl, crunchbaseUrl });
  };

  const handleNewAnalysis = () => {
    setShowResults(false);
    setAnalysisResult(null);
  };

  // Adapt backend data to component props
  const tractionData = analysisResult?.traction ? adaptTractionData(analysisResult.traction) : null;
  const teamData = analysisResult?.team ? adaptTeamData(analysisResult.team) : null;
  const marketData = analysisResult?.market ? adaptMarketData(analysisResult.market) : null;
  const risksData = analysisResult?.risks ? adaptRisksData(analysisResult.risks) : null;
  const outlookData = analysisResult ? adaptOutlook(analysisResult.outlook) : null;
  const companySummary = analysisResult ? adaptCompanySummary(analysisResult.name, analysisResult.domain) : null;

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
            <div className="text-center mb-6">
              <p className="text-lg text-muted-foreground">Estimated time: 2-3 minutes</p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </div>
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
                    {analysisResult?.name || "Company"} • Generated {new Date().toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Company Overview Section */}
            {companySummary && (
              <div className="mb-8">
                <CompanySummary {...companySummary} />
              </div>
            )}

            {/* Tabbed Content for Better Organization */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="market">Market Research</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="outlook">Outlook</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {tractionData && <TractionMetrics {...tractionData} />}
                {teamData && <TeamQuality {...teamData} />}
              </TabsContent>

              <TabsContent value="metrics" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {marketData && <MarketSignals {...marketData} />}
                  {risksData && <RiskAssessment risks={risksData} />}
                </div>
              </TabsContent>

              <TabsContent value="market" className="space-y-6">
                {analysisResult?.deep_market_research && (
                  <DeepMarketResearch data={analysisResult.deep_market_research} />
                )}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {marketData && <MarketSignals {...marketData} />}
                  {risksData && <RiskAssessment risks={risksData} />}
                </div>
                {teamData && <TeamQuality {...teamData} />}
              </TabsContent>

              <TabsContent value="outlook" className="space-y-6">
                {outlookData && (
                  <InvestmentOutlook
                    recommendation={outlookData.recommendation}
                    confidence={outlookData.confidence}
                    summary={outlookData.summary}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
