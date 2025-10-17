import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, Calendar, DollarSign, MapPin } from "lucide-react";

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
    <Card className="p-8 shadow-lg border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">{name}</h2>
            <a 
              href={`https://${domain}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              {domain}
            </a>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm px-4 py-2 font-semibold">
          {industry}
        </Badge>
      </div>

      <div className="space-y-6 mt-8">
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
          <p className="text-sm font-semibold text-muted-foreground mb-2">Product Description</p>
          <p className="text-base leading-relaxed">{productDescription}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Founded</p>
              <p className="font-semibold text-lg">{foundedDate}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Business Model</p>
              <p className="font-semibold text-lg">{businessModel}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Geographic Focus</p>
              <p className="font-semibold text-lg">{geographicFocus}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
