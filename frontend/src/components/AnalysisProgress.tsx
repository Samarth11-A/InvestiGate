import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2 } from "lucide-react";

interface AnalysisStep {
  label: string;
  status: "pending" | "processing" | "completed";
}

interface AnalysisProgressProps {
  steps: AnalysisStep[];
  currentStep: number;
}

export const AnalysisProgress = ({ steps, currentStep }: AnalysisProgressProps) => {
  const progress = (currentStep / steps.length) * 100;

  return (
    <Card className="p-6 shadow-card">
      <h3 className="text-xl font-bold mb-6">Analysis in Progress</h3>

      <Progress value={progress} className="mb-6" />

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-smooth ${
                isActive
                  ? "bg-primary/10 border border-primary/20"
                  : isCompleted
                  ? "bg-success/10"
                  : "bg-muted/30"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              ) : isActive ? (
                <Loader2 className="w-5 h-5 text-primary flex-shrink-0 animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
              )}
              <span
                className={`font-medium ${
                  isActive
                    ? "text-primary"
                    : isCompleted
                    ? "text-success"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
