"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { ResultsChart } from "@/components/results-chart";
import { DownloadReportButton } from "@/components/download-report-button";
import { DynamicViz } from "@/components/dynamic-viz";
import { ChatHeader } from "./chat-header";

export function ResultsClientPage({ experiment, id }: { experiment: any, id: string }) {
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Parse results from experiment prop
  let results: any = {};
  if (typeof experiment.results === "string") {
    try {
      results = JSON.parse(experiment.results);
    } catch (e) {
      console.error("Failed to parse results:", e);
    }
  } else {
    results = experiment.results || {};
  }

  const summary = results.summary || "No summary available.";
  const chartData = results.graph_data || results.graphData;
  const hasFullResults = results.main_results && results.pre_trends;
  const hasDynamicReport = results.dynamic_report && results.dynamic_report.sections;

  const containerClasses = !isReportOpen
    ? "flex flex-col justify-center min-h-full p-4 md:p-6 max-w-prose mx-auto"
    : "p-4 md:p-6 space-y-6 max-w-prose mx-auto";

  return (
    <>
      <ChatHeader chatId={id} isReadonly={true} selectedVisibilityType="private" />
      <div className={containerClasses}>
        {/* Download Button */}
        {hasFullResults && (
          <div className="flex justify-end">
          <DownloadReportButton results={results} chatId={id} />
        </div>
      )}

      {/* Analysis Summary */}
      {hasDynamicReport && (
        <Card className="border-none">
          <CardHeader>
            <CardTitle className="text-2xl">{results.dynamic_report.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {results.dynamic_report.executive_summary}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Full Report (Collapsible) */}
      {hasDynamicReport && (
        <Collapsible onOpenChange={setIsReportOpen} open={isReportOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <ChevronsUpDown className="h-4 w-4 mr-2" />
              Full Report
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-6">
            <div className="space-y-6">
              {results.dynamic_report.sections.map((section: any) => (
                <Card key={section.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription className="text-base font-medium text-foreground/90 mt-2">
                      {section.insight}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DynamicViz vizType={section.viz_type} vizData={section.viz_data} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Legacy and other sections */}
      {!hasDynamicReport && (
        <Card>
          <CardHeader>
            <CardTitle>Experiment Results</CardTitle>
            <CardDescription>Chat ID: {id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">{summary}</p>
            {chartData ? (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                  {chartData.title || "Primary Visualization"}
                </h3>
                <ResultsChart data={chartData} />
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                No visualization data available for this analysis.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Debug Section */}
      {!hasFullResults && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <ChevronsUpDown className="h-4 w-4 mr-2" />
                  Show Raw Results
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border rounded-lg mt-2">
                <pre className="text-xs overflow-auto">{JSON.stringify(results, null, 2)}</pre>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}
