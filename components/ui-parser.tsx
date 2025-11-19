"use client";

import { useState } from "react";
import { useExperiment } from "./experiment-context";
import { Response } from "@/components/elements/response";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, sanitizeText } from "@/lib/utils";
import { useDataStream } from "./data-stream-provider";

interface UIParserProps {
  text: string;
  chatId: string;
  messageId: string;
}

export function UIParser({ text, chatId, messageId }: UIParserProps) {
  const [isRunning, setIsRunning] = useState(false);
  const { setDataStream } = useDataStream();
  const { startExperiment } = useExperiment();

  const cardRegex = /<ui\.card>(.*?)<\/ui\.card>/s;
  const cardMatch = cardRegex.exec(text);
  if (cardMatch) {
    const cardContent = cardMatch[1];
    const titleMatch = /<ui\.title>(.*?)<\/ui\.title>/s.exec(cardContent);
    const descriptionMatch = /<ui\.description>(.*?)<\/ui\.description>/s.exec(
      cardContent
    );
    const datasourcesMatch = /<ui\.datasources>(.*?)<\/ui\.datasources>/s.exec(
      cardContent
    );
    const buttonMatch =
      /<ui\.button\s+variant='([^']+)'\s+size='([^']+)'>RUN ANALYSIS<\/ui\.button>/.exec(
        cardContent
      );

    const title = titleMatch ? titleMatch[1].trim() : "";
    const description = descriptionMatch ? descriptionMatch[1].trim() : "";
    const datasourcesContent = datasourcesMatch ? datasourcesMatch[1] : "";
    const variant: ButtonProps['variant'] = buttonMatch ? buttonMatch[1] as ButtonProps['variant'] : "default";
    const size: ButtonProps['size'] = buttonMatch ? buttonMatch[2] as ButtonProps['size'] : "default";

    const chipRegex =
      /<ui\.chip category="([^"]+)" title="([^"]+)">(.*?)<\/ui\.chip>/gs;
    const chips = [];
    let chipMatch;
    while ((chipMatch = chipRegex.exec(datasourcesContent)) !== null) {
      chips.push({
        category: chipMatch[1],
        title: chipMatch[2],
        relevance: chipMatch[3].trim(),
      });
    }

    const handleClick = async () => {
      console.log("Button clicked");
      setIsRunning(true);
      startExperiment(chatId, messageId);
    };

    const modifiedText = text.replace(cardRegex, "");

    return (
      <>
        <Response>{sanitizeText(modifiedText)}</Response>
        <div className="mx-auto mt-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-medium">Datasources</h3>
                <div className="flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <Badge key={chip.title} variant="secondary">
                      <span className="font-semibold text-capitalize text-xs">
                        {chip.category}
                      </span>
                      
                      <span className="ml-1 text-xs opacity-70">
                       {chip.title}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-8 mb-6 flex justify-center ">
                <Button
                  className={cn(
                    "bg-white px-8 py-4 text-xs font-bold tracking-widest text-black hover:bg-white/90 hover:text-black/90 cursor-pointer",
                    variant === "destructive"
                      ? "bg-white hover:bg-white/90 text-black"
                      : ""
                  )}
                  onClick={handleClick}
                  disabled={isRunning}
                  size={size}
                  variant={variant}
                >
                  {isRunning ? "Starting..." : "RUN ANALYSIS"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return <Response>{sanitizeText(text)}</Response>;
}
