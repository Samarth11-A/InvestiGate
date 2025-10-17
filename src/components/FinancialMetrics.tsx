import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  description: string;
}

interface FinancialMetricsProps {
  metrics: Metric[];
}

export const FinancialMetrics = ({ metrics }: FinancialMetricsProps) => {
  return (
    <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Key Financial Ratios</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="text-3xl font-bold text-primary">{metric.value}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {metric.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
