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

      {!showOptions ? (
        <>
          <form onSubmit={handleSearch} className="relative">
            <div className="flex gap-3 p-2 bg-card rounded-2xl shadow-elevated border border-border/50">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter company name or URL (e.g., Acme AI or acmeai.io)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="pl-12 h-14 text-lg border-0 bg-transparent focus-visible:ring-0"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={!input.trim() || isLoading}
                className="px-8 h-14 text-lg gradient-primary hover:opacity-90 transition-smooth"
              >
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-muted-foreground">Examples:</span>
            {["acmeai.io", "stripe.com", "notion.so", "linear.app"].map((domain) => (
              <button
                key={domain}
                onClick={() => setInput(domain)}
                disabled={isLoading}
                className="px-3 py-1 text-sm rounded-full bg-secondary hover:bg-secondary/80 transition-smooth disabled:opacity-50"
              >
                {domain}
              </button>
            ))}
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
