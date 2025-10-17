import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, Target } from "lucide-react";

interface TractionMetricsProps {
  fundingStage: string;
  totalRaised: string;
  recentRound: string;
  revenueIndicator: string;
  customerCount: string;
}

export const TractionMetrics = ({
  fundingStage,
  totalRaised,
  recentRound,
  revenueIndicator,
  customerCount,
}: TractionMetricsProps) => {
  return (
    <Card className="p-8 shadow-lg border-2 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Traction & Growth Metrics</h3>
          <p className="text-sm text-muted-foreground">Key performance indicators</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Funding Stage */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 hover:border-accent/40 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-accent" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Funding Stage</p>
          </div>
          <p className="text-3xl font-bold text-accent mb-2">{fundingStage}</p>
          <p className="text-sm font-semibold text-muted-foreground">
            Total: <span className="text-foreground">{totalRaised}</span>
          </p>
        </div>

        {/* Recent Round */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Recent Round</p>
          </div>
          <p className="text-3xl font-bold text-primary mb-2">{recentRound}</p>
          <p className="text-sm text-muted-foreground">Latest funding</p>
        </div>

        {/* Revenue & Customers */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 hover:border-accent/40 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-accent" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Revenue (MRR)</p>
          </div>
          <p className="text-3xl font-bold text-accent mb-2">{revenueIndicator}</p>
          <p className="text-sm font-semibold text-muted-foreground">
            <span className="text-foreground">{customerCount}</span> customers
          </p>
        </div>
      </div>
    </Card>
  );
};
