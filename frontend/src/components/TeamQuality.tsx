import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Award, Briefcase } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  background: string;
  previousExits?: string;
}

interface TeamQualityProps {
  founders: TeamMember[];
  keyExecutives: TeamMember[];
  teamComposition: string;
  teamGaps?: string;
}

export const TeamQuality = ({
  founders,
  keyExecutives,
  teamComposition,
  teamGaps,
}: TeamQualityProps) => {
  return (
    <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Team Quality</h3>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Founders</h4>
          </div>
          <div className="space-y-3">
            {founders.map((founder, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-smooth"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{founder.name}</p>
                    <p className="text-sm text-muted-foreground">{founder.role}</p>
                  </div>
                  {founder.previousExits && (
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      Previous Exit
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{founder.background}</p>
                {founder.previousExits && (
                  <p className="text-xs text-success mt-2">{founder.previousExits}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {keyExecutives.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Key Executives</h4>
            </div>
            <div className="space-y-2">
              {keyExecutives.map((exec, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-smooth"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm">{exec.name}</p>
                    <p className="text-xs text-muted-foreground">{exec.role}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{exec.background}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm font-semibold mb-2">Team Composition</p>
          <p className="text-sm text-muted-foreground mb-3">{teamComposition}</p>
          {teamGaps && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm font-semibold text-warning mb-1">Identified Gaps</p>
              <p className="text-xs text-muted-foreground">{teamGaps}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
