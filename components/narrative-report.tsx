"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Database, 
  TrendingUp, 
  ShieldCheck, 
  Lightbulb 
} from "lucide-react";

interface NarrativeReport {
  research_summary: string;
  data_overview: string;
  main_findings_narrative: string;
  validity_assessment: string;
  practical_implications: string;
}

interface NarrativeReportProps {
  report: NarrativeReport;
}

export function NarrativeReport({ report }: NarrativeReportProps) {
  const sections = [
    {
      title: "Research Design & Strategy",
      icon: FileText,
      content: report.research_summary,
      description: "What question we're addressing and how we're identifying causal effects",
    },
    {
      title: "Data Overview",
      icon: Database,
      content: report.data_overview,
      description: "Dataset characteristics and quality assessment",
    },
    {
      title: "Main Findings",
      icon: TrendingUp,
      content: report.main_findings_narrative,
      description: "Interpretation of treatment effects in plain English",
    },
    {
      title: "Validity & Credibility",
      icon: ShieldCheck,
      content: report.validity_assessment,
      description: "Assessment of identification assumptions and robustness",
    },
    {
      title: "Practical Implications",
      icon: Lightbulb,
      content: report.practical_implications,
      description: "What these findings mean for decision-makers",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Analysis Report</CardTitle>
          <CardDescription>
            Comprehensive narrative interpretation of causal analysis results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={section.title}>
                {index > 0 && <Separator className="my-6" />}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <div className="pl-14">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {section.content.split('\n\n').map((paragraph, pIndex) => (
                        <p key={`${section.title}-p-${pIndex}`} className="text-base leading-relaxed mb-4 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
