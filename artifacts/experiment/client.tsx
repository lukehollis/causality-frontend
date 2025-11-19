"use client";

import { useState } from "react";
import type { ArtifactContent } from "@/components/create-artifact";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ExperimentMetadata {
  progress: number;
  currentStep: number;
  steps: string[];
  results: string;
  children: string[]; // Links to child artifact IDs
}

const experimentSteps = [
  "Identifying data sources",
  "Developing experiment",
  "Running experiment",
  "Creating parameterized model",
  "Generating UI",
  "Presenting report",
];

export function ExperimentContent({
  content,
  metadata,
  setMetadata,
  status,
  onSaveContent,
  ...props
}: ArtifactContent<ExperimentMetadata>) {
  const [localResults, setLocalResults] = useState("");

  // Parse content as JSON for dashboard state
  let dashboard: ExperimentMetadata;
  try {
    dashboard = JSON.parse(content || "{}");
  } catch {
    dashboard = {
      progress: 0,
      currentStep: 0,
      steps: experimentSteps,
      results: "",
      children: [],
    };
  }

  const updateResults = (newResults: string) => {
    setLocalResults((prev) => prev + newResults);
    // Optionally save to content/metadata
    setMetadata((prev) => ({ ...prev, results: localResults + newResults }));
    onSaveContent(
      JSON.stringify({ ...dashboard, results: localResults + newResults }),
      false
    );
  };

  if (status === "streaming") {
    return (
      <div className="space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Experiment Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress className="w-full" value={dashboard.progress || 0} />
            <div className="mt-4 space-y-2">
              {dashboard.steps.map((step, index) => (
                <div
                  className={cn(
                    "flex items-center justify-between rounded p-2",
                    index < (dashboard.currentStep || 0)
                      ? "bg-green-100 text-green-800"
                      : index === (dashboard.currentStep || 0)
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-600"
                  )}
                  key={step}
                >
                  <span>{step}</span>
                  <Badge
                    variant={
                      index < (dashboard.currentStep || 0)
                        ? "default"
                        : "secondary"
                    }
                  >
                    {index < (dashboard.currentStep || 0)
                      ? "✅"
                      : index === (dashboard.currentStep || 0)
                        ? "⏳"
                        : "⭕"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Live Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto rounded border p-2">
              {localResults || "Waiting for results..."}
            </div>
          </CardContent>
        </Card>
        {dashboard.children.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Related Artifacts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {dashboard.children.map((childId) => (
                  <li key={childId}>
                    <Badge className="cursor-pointer" variant="outline">
                      Artifact {childId.slice(-4)}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Experiment Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress className="w-full" value={100} />
          <div className="mt-4 text-green-600 text-sm">
            All steps completed!
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap">
            {dashboard.results || localResults}
          </pre>
        </CardContent>
      </Card>
      {dashboard.children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Artifacts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {dashboard.children.map((childId) => (
                <li key={childId}>
                  <Badge variant="outline">
                    View Artifact {childId.slice(-4)}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
