import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Newspaper, Code } from "lucide-react";

interface PressItem {
  title: string;
  date: string;
  source: string;
  sentiment: "positive" | "neutral" | "negative";
}

interface MarketSignalsProps {
  competitivePosition: string;
  marketSize: string;
  growthTrend: string;
  recentPress: PressItem[];
  techStack: string[];
}

export const MarketSignals = ({
  competitivePosition,
  marketSize,
  growthTrend,
  recentPress,
  techStack,
}: MarketSignalsProps) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-success/10 text-success border-success/20";
      case "neutral":
        return "bg-muted text-muted-foreground border-muted";
      case "negative":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Market Signals</h3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Market Size</p>
            </div>
            <p className="text-xl font-bold">{marketSize}</p>
            <p className="text-xs text-muted-foreground mt-1">{growthTrend}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Competitive Position</p>
            <p className="text-sm leading-relaxed">{competitivePosition}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Recent Press & Sentiment</h4>
          </div>
          <div className="space-y-2">
            {recentPress.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-smooth"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold flex-1">{item.title}</p>
                  <Badge
                    variant="outline"
                    className={`${getSentimentColor(item.sentiment)} text-xs ml-2`}
                  >
                    {item.sentiment}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Technology Stack</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
