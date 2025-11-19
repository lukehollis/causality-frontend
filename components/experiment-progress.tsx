"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "./experiment-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader } from "@/components/elements/loader";

export function ExperimentProgress({ chatId }: { chatId: string }) {
  const { state, updateProgress, completeExperiment, abortExperiment } = useExperiment();
  const router = useRouter();

  useEffect(() => {
    if (!state.inProgress || !state.currentChatId || !state.currentMessageId) return;

    let aborted = false;

    const fetchStream = async () => {
      try {
        const response = await fetch("/api/run-experiment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId: state.currentChatId, messageId: state.currentMessageId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to start experiment: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let buffer = "";

        while (!aborted) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          let boundary = buffer.indexOf("\n\n");
          while (boundary !== -1) {
            const event = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);

            if (event.includes("data: ")) {
              const dataStr = event.replace("data: ", "").trim();
              if (dataStr === "[DONE]") {
                completeExperiment();
                router.push(`/results/${state.currentChatId}`);
                break;
              }

              try {
                const data = JSON.parse(dataStr);
                if (data.type === "progress" && data.progress !== undefined) {
                  updateProgress(data.progress, data.step);
                }
              } catch (e) {
                console.error("Parse error:", e);
              }
            }
            boundary = buffer.indexOf("\n\n");
          }
        }
      } catch (error) {
        console.error("Stream error:", error);
        abortExperiment();
      }
    };

    fetchStream();

    return () => {
      aborted = true;
    };
  }, [state.inProgress, state.currentChatId, state.currentMessageId, updateProgress, completeExperiment, abortExperiment, router]);

  if (!state.inProgress) return null;

  return (
    <div className="flex flex-grow flex-col justify-center items-center p-4">
      <Card className="w-full max-w-md py-20 border-0 shadow-none">
        <CardHeader>
          <Loader className="mx-auto mb-12" />
          <CardTitle className="text-center">Running Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={state.progress} className="w-full" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{state.currentStep}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
