import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp } from "lucide-react";

interface AnalysisInputProps {
  onAnalyze: (ticker: string) => void;
  isLoading?: boolean;
}

export const AnalysisInput = ({ onAnalyze, isLoading }: AnalysisInputProps) => {
  const [ticker, setTicker] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      onAnalyze(ticker.trim().toUpperCase());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          AI-Powered Startup Due Diligence
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Automated pre-seed company research and investment analysis powered by AI agents
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-3 p-2 bg-card rounded-2xl shadow-elevated border border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter company name or domain (e.g., acmeai.io)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="pl-12 h-14 text-lg border-0 bg-transparent focus-visible:ring-0"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={!ticker.trim() || isLoading}
            className="px-8 h-14 text-lg gradient-primary hover:opacity-90 transition-smooth"
          >
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </form>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <span className="text-sm text-muted-foreground">Examples:</span>
        {["acmeai.io", "stripe.com", "notion.so", "linear.app"].map((domain) => (
          <button
            key={domain}
            onClick={() => setTicker(domain)}
            disabled={isLoading}
            className="px-3 py-1 text-sm rounded-full bg-secondary hover:bg-secondary/80 transition-smooth disabled:opacity-50"
          >
            {domain}
          </button>
        ))}
      </div>
    </div>
  );
};
