import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield } from "lucide-react";

interface Risk {
  category: string;
  level: "low" | "medium" | "high";
  description: string;
}

interface RiskAssessmentProps {
  risks: Risk[];
}

export const RiskAssessment = ({ risks }: RiskAssessmentProps) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-success/10 text-success border-success/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const overallRiskLevel = risks.some((r) => r.level === "high")
    ? "high"
    : risks.some((r) => r.level === "medium")
    ? "medium"
    : "low";

  return (
    <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">Risk Assessment</h3>
        </div>
        <Badge className={getRiskColor(overallRiskLevel)}>
          Overall: {overallRiskLevel.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-3">
        {risks.map((risk, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-smooth"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{risk.category}</h4>
                  <Badge
                    variant="outline"
                    className={`${getRiskColor(risk.level)} text-xs`}
                  >
                    {risk.level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{risk.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
