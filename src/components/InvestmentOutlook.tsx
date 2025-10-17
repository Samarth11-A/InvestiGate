import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Download, Share2, TrendingUp, AlertCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvestmentOutlookProps {
  recommendation: "Strong Investment" | "Moderate Investment" | "Pass" | "Monitor";
  confidence: number;
  summary: string;
}

export const InvestmentOutlook = ({
  recommendation,
  confidence,
  summary,
}: InvestmentOutlookProps) => {
  const { toast } = useToast();

  const getRecommendationStyle = () => {
    if (recommendation.includes("Strong")) {
      return {
        badge: "bg-gradient-to-r from-success to-success/80 text-white border-0",
        icon: TrendingUp,
        color: "text-success"
      };
    } else if (recommendation.includes("Moderate")) {
      return {
        badge: "bg-gradient-to-r from-primary to-primary/80 text-white border-0",
        icon: TrendingUp,
        color: "text-primary"
      };
    } else if (recommendation === "Monitor") {
      return {
        badge: "bg-gradient-to-r from-warning to-warning/80 text-white border-0",
        icon: Eye,
        color: "text-warning"
      };
    } else {
      return {
        badge: "bg-muted text-muted-foreground",
        icon: AlertCircle,
        color: "text-muted-foreground"
      };
    }
  };

  const handleDownload = () => {
    toast({
      title: "Report Downloaded",
      description: "Investment summary saved as PDF successfully",
    });
  };

  const handleShare = () => {
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard",
    });
  };

  const style = getRecommendationStyle();
  const RecommendationIcon = style.icon;

  return (
    <Card className="p-8 shadow-xl border-2 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Investment Recommendation</h3>
          <p className="text-sm text-muted-foreground">AI-generated analysis summary</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Recommendation Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <Badge className={`${style.badge} text-xl px-6 py-3 shadow-lg`}>
                <RecommendationIcon className="w-5 h-5 mr-2" />
                {recommendation}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">
                  AI Confidence Score
                </p>
                <span className={`text-2xl font-bold ${style.color}`}>
                  {confidence}%
                </span>
              </div>
              <Progress value={confidence} className="h-3" />
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
              className="gap-2 flex-1 sm:flex-none"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share Report</span>
              <span className="sm:hidden">Share</span>
            </Button>
            <Button
              size="lg"
              onClick={handleDownload}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Executive Summary
          </h4>
          <p className="text-base leading-relaxed text-foreground/90">{summary}</p>
        </div>

        {/* Disclaimer */}
        <div className="pt-6 border-t space-y-3">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <p className="font-semibold mb-1">Disclaimer</p>
              <p>
                This analysis is AI-generated using automated data collection and multi-source analysis. 
                Investment decisions should be made after comprehensive due diligence and consultation 
                with your investment committee. Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
