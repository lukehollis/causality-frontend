"use client";

import { useMemo } from "react";
import { chatModels } from "@/lib/ai/models";
import { cn } from "@/lib/utils";

export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<"div">) {
  const selectedChatModel = useMemo(
    () => chatModels.find((chatModel) => chatModel.id === selectedModelId),
    [selectedModelId]
  );

  return (
    <div className={cn("w-fit", className)}>
      <span className="text-muted-foreground text-sm">
        {selectedChatModel?.name}
      </span>
    </div>
  );
}
