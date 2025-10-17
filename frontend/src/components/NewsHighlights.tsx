import { Card } from "@/components/ui/card";
import { Newspaper, ExternalLink } from "lucide-react";

interface NewsItem {
  title: string;
  date: string;
  source: string;
  summary: string;
}

interface NewsHighlightsProps {
  news: NewsItem[];
}

export const NewsHighlights = ({ news }: NewsHighlightsProps) => {
  return (
    <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth">
      <div className="flex items-center gap-2 mb-6">
        <Newspaper className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Recent News Highlights</h3>
      </div>

      <div className="space-y-4">
        {news.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth group"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-smooth flex-1">
                {item.title}
              </h4>
              <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-smooth" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">{item.summary}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{item.source}</span>
              <span>•</span>
              <span>{item.date}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
