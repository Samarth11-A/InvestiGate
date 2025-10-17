import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, ExternalLink, Check } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AnalysisInputProps {
  onAnalyze: (url: string) => void;
  isLoading?: boolean;
}

interface CompanyOption {
  name: string;
  url: string;
  description: string;
}

export const AnalysisInput = ({ onAnalyze, isLoading }: AnalysisInputProps) => {
  const [input, setInput] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  
  // Mock search results - in production, this would come from an API
  const [searchResults, setSearchResults] = useState<CompanyOption[]>([]);

  const isUrl = (str: string) => {
    try {
      new URL(str.startsWith('http') ? str : `https://${str}`);
      return str.includes('.');
    } catch {
      return false;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // If it's already a URL, skip search and go straight to analysis
    if (isUrl(input.trim())) {
      const url = input.trim().startsWith('http') ? input.trim() : `https://${input.trim()}`;
      onAnalyze(url);
      return;
    }

    // Mock search results based on input
    const mockResults: CompanyOption[] = [
      {
        name: `${input} Inc.`,
        url: `${input.toLowerCase().replace(/\s+/g, '')}.com`,
        description: "Official company website"
      },
      {
        name: `${input} AI`,
        url: `${input.toLowerCase().replace(/\s+/g, '')}ai.io`,
        description: "AI-powered platform"
      },
      {
        name: `${input} Labs`,
        url: `${input.toLowerCase().replace(/\s+/g, '')}labs.com`,
        description: "Research and development"
      }
    ];
    
    setSearchResults(mockResults);
    setShowOptions(true);
  };

  const handleSelectUrl = (url: string) => {
    setSelectedUrl(url);
  };

  const handleConfirmSelection = () => {
    if (selectedUrl) {
      onAnalyze(selectedUrl);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 shadow-lg">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
          AI-Powered Startup Due Diligence
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Get comprehensive investment analysis in minutes with our AI agent platform
        </p>
        
        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {[
            "🚀 Instant Analysis",
            "📊 10+ Data Points",
            "🤖 AI-Powered",
            "📈 Market Insights"
          ].map((feature) => (
            <div
              key={feature}
              className="px-4 py-2 rounded-full bg-secondary/50 text-sm font-medium border border-border/50"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      {!showOptions ? (
        <>
          <form onSubmit={handleSearch} className="relative">
            <div className="flex gap-3 p-3 bg-card rounded-3xl shadow-2xl border border-border/50 hover:border-primary/30 transition-all">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter company name or website (e.g., Acme AI or acmeai.io)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="pl-12 h-16 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={!input.trim() || isLoading}
                className="px-10 h-16 text-lg rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚡</span>
                    Searching...
                  </span>
                ) : (
                  "Analyze Now"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground font-medium">Try these examples:</span>
            {[
              { domain: "acmeai.io", label: "Acme AI" },
              { domain: "stripe.com", label: "Stripe" },
              { domain: "notion.so", label: "Notion" },
              { domain: "linear.app", label: "Linear" }
            ].map((example) => (
              <button
                key={example.domain}
                onClick={() => setInput(example.domain)}
                disabled={isLoading}
                className="group px-4 py-2 text-sm rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-medium group-hover:text-primary transition-colors">
                  {example.label}
                </span>
              </button>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-border/50">
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">10min</div>
                <div className="text-sm text-muted-foreground">Average Analysis Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">95%</div>
                <div className="text-sm text-muted-foreground">Data Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">10+</div>
                <div className="text-sm text-muted-foreground">Analysis Dimensions</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Select Company URL</h2>
            <button
              onClick={() => {
                setShowOptions(false);
                setSearchResults([]);
                setSelectedUrl("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
            >
              ← Back to search
            </button>
          </div>

          <div className="space-y-3">
            {searchResults.map((option) => (
              <Card
                key={option.url}
                onClick={() => handleSelectUrl(option.url)}
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedUrl === option.url
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{option.name}</h3>
                      {selectedUrl === option.url && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>{option.url}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleConfirmSelection}
              disabled={!selectedUrl || isLoading}
              size="lg"
              className="px-8 gradient-primary hover:opacity-90 transition-smooth"
            >
              {isLoading ? "Analyzing..." : "Analyze Selected Company"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
