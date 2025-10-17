import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TrendingUp, Target, Shield, Globe, ExternalLink, AlertTriangle } from "lucide-react";
import type { DeepMarketResearch as DeepMarketResearchType } from "@/types/api";

interface DeepMarketResearchProps {
  data: DeepMarketResearchType;
}

export const DeepMarketResearch = ({ data }: DeepMarketResearchProps) => {
  const getImpactColor = (impact: "High" | "Medium" | "Low") => {
    switch (impact) {
      case "High":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "Low":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  const getSeverityColor = (severity: "High" | "Medium" | "Low") => {
    switch (severity) {
      case "High":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "Medium":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "Low":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  return (
    <Card className="p-8 shadow-lg border-2 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Deep Market Research</h3>
          <p className="text-sm text-muted-foreground">Comprehensive competitive intelligence</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Market Overview */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-semibold">Market Overview</h4>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">TAM (Total Addressable Market)</p>
              <p className="text-xl font-bold text-primary">{data.market_overview.tam}</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
              <p className="text-sm text-muted-foreground mb-1">SAM (Serviceable Addressable Market)</p>
              <p className="text-xl font-bold text-accent">{data.market_overview.sam}</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">SOM (Serviceable Obtainable Market)</p>
              <p className="text-xl font-bold text-primary">{data.market_overview.som}</p>
            </div>
          </div>
        </div>

        {/* Competitive Landscape */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-semibold">Competitive Landscape</h4>
            <Badge variant="secondary">{data.competitive_landscape.length} competitors</Badge>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {data.competitive_landscape.map((competitor, index) => (
              <AccordionItem key={index} value={`competitor-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-semibold">{competitor.name}</span>
                    <span className="text-sm text-muted-foreground">{competitor.positioning}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-green-600 mb-2">Strengths</p>
                      <ul className="space-y-1">
                        {competitor.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-600 mt-1">+</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-600 mb-2">Weaknesses</p>
                      <ul className="space-y-1">
                        {competitor.weaknesses.map((weakness, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-red-600 mt-1">-</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Market Trends */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-semibold">Market Trends</h4>
          </div>
          <div className="space-y-3">
            {data.market_trends.map((trend, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-smooth">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold">{trend.trend}</h5>
                  <Badge className={getImpactColor(trend.impact)}>{trend.impact} Impact</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{trend.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Trajectory */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-semibold">Growth Trajectory</h4>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Growth Rate</p>
                <p className="text-lg font-bold text-primary">{data.growth_trajectory.current_rate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Projected Growth Rate</p>
                <p className="text-lg font-bold text-accent">{data.growth_trajectory.projected_rate}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Key Growth Drivers</p>
              <ul className="space-y-1">
                {data.growth_trajectory.key_drivers.map((driver, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Barriers & Moats */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-semibold">Barriers & Moats</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm font-semibold mb-3 text-orange-600">Entry Barriers</p>
              <ul className="space-y-2">
                {data.barriers_and_moats.entry_barriers.map((barrier, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>{barrier}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm font-semibold mb-3 text-green-600">Company Moats</p>
              <ul className="space-y-2">
                {data.barriers_and_moats.company_moats.map((moat, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{moat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Regulatory Landscape */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-semibold">Regulatory Landscape</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold mb-2">Relevant Regulations</p>
              <ul className="space-y-1">
                {data.regulatory_landscape.regulations.map((regulation, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {regulation}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Compliance Requirements</p>
              <ul className="space-y-1">
                {data.regulatory_landscape.compliance_requirements.map((req, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {req}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Expansion Opportunities */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-semibold">Expansion Opportunities</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {data.expansion_opportunities.map((opp, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold">{opp.market}</h5>
                  <Badge className={getImpactColor(opp.potential)}>{opp.potential}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{opp.rationale}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Market Risks */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-semibold">Market Risks</h4>
          </div>
          <div className="space-y-3">
            {data.market_risks.map((risk, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold">{risk.risk}</h5>
                  <Badge className={getSeverityColor(risk.severity)}>{risk.severity}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{risk.mitigation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div className="pt-6 border-t">
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-semibold">Research Sources</h4>
            <Badge variant="secondary">{data.sources.length} sources cited</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {data.sources.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-smooth flex items-start gap-3 group"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0 group-hover:text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {source.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{source.date}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
