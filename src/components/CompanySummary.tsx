import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, TrendingDown } from "lucide-react";

interface CompanySummaryProps {
  name: string;
  domain: string;
  foundedDate: string;
  industry: string;
  businessModel: string;
  productDescription: string;
  geographicFocus: string;
}

export const CompanySummary = ({
  name,
  domain,
  foundedDate,
  industry,
  businessModel,
  productDescription,
  geographicFocus,
}: CompanySummaryProps) => {
  return (
    <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-muted-foreground">{domain}</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {industry}
        </Badge>
      </div>

      <div className="space-y-4 mt-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Product Description</p>
          <p className="text-sm leading-relaxed">{productDescription}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Founded</p>
            <p className="font-semibold">{foundedDate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Business Model</p>
            <p className="font-semibold">{businessModel}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Geographic Focus</p>
            <p className="font-semibold">{geographicFocus}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
