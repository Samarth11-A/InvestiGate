import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, TrendingDown } from "lucide-react";

interface CompanySummaryProps {
  ticker: string;
  name: string;
  marketCap: string;
  ytdChange: number;
  price: string;
  sector: string;
}

export const CompanySummary = ({
  ticker,
  name,
  marketCap,
  ytdChange,
  price,
  sector,
}: CompanySummaryProps) => {
  const isPositive = ytdChange >= 0;

  return (
    <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-muted-foreground">{ticker}</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {sector}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
          <p className="text-xl font-bold">{marketCap}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Current Price</p>
          <p className="text-xl font-bold">{price}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">YTD Change</p>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
            <p
              className={`text-xl font-bold ${
                isPositive ? "text-success" : "text-destructive"
              }`}
            >
              {isPositive ? "+" : ""}
              {ytdChange}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
