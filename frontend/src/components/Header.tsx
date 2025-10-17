import { Button } from "@/components/ui/button";
import { TrendingUp, Moon, Sun, Download, Share2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  showActions?: boolean;
  onNewAnalysis?: () => void;
}

export const Header = ({ showActions, onNewAnalysis }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleShare = () => {
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Report Downloaded",
      description: "Investment report saved as PDF",
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Fund Scan
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Automated Due Diligence
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {showActions && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="hidden sm:flex gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="hidden sm:flex gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNewAnalysis}
                  className="ml-2"
                >
                  New Analysis
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-2"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
