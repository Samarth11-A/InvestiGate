import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Rocket, Handshake, TrendingUp } from "lucide-react";

interface InvestmentIndicatorsProps {
  hiringVelocity: {
    openPositions: number;
    recentHires: string;
  };
  productLaunches: string[];
  partnerships: string[];
  growthTrajectory: string;
}

export const InvestmentIndicators = ({
  hiringVelocity,
  productLaunches,
  partnerships,
  growthTrajectory,
}: InvestmentIndicatorsProps) => {
  return (
    <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Investment Opportunity Indicators</h3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Hiring Velocity</p>
            </div>
            <p className="text-3xl font-bold text-primary">{hiringVelocity.openPositions}</p>
            <p className="text-xs text-muted-foreground mt-1">Open positions</p>
            <p className="text-xs text-success mt-1">{hiringVelocity.recentHires}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Growth Trajectory</p>
            <p className="text-sm leading-relaxed">{growthTrajectory}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Recent Product Launches</h4>
          </div>
          <div className="space-y-2">
            {productLaunches.map((launch, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-smooth"
              >
                <p className="text-sm">{launch}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Handshake className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Strategic Partnerships</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {partnerships.map((partner, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {partner}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
