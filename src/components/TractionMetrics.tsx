import { Card } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";

interface TractionMetricsProps {
  employeeCount: number;
  employeeGrowth6m: string;
  employeeGrowth1y: string;
  fundingStage: string;
  totalRaised: string;
  recentRound: string;
  revenueIndicator: string;
  customerCount: string;
}

export const TractionMetrics = ({
  employeeCount,
  employeeGrowth6m,
  employeeGrowth1y,
  fundingStage,
  totalRaised,
  recentRound,
  revenueIndicator,
  customerCount,
}: TractionMetricsProps) => {
  return (
    <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Traction Metrics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Team Size</p>
          </div>
          <p className="text-3xl font-bold text-primary">{employeeCount}</p>
          <div className="flex gap-2 text-xs">
            <span className="text-success">+{employeeGrowth6m} (6m)</span>
            <span className="text-success">+{employeeGrowth1y} (1y)</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Funding Stage</p>
          </div>
          <p className="text-2xl font-bold text-primary">{fundingStage}</p>
          <p className="text-xs text-muted-foreground">Total: {totalRaised}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Recent Round</p>
          <p className="text-2xl font-bold text-primary">{recentRound}</p>
          <p className="text-xs text-muted-foreground">Latest funding</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Revenue</p>
          </div>
          <p className="text-2xl font-bold text-primary">{revenueIndicator}</p>
          <p className="text-xs text-muted-foreground">{customerCount} customers</p>
        </div>
      </div>
    </Card>
  );
};
