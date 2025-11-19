"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { type Dispatch, memo, type SetStateAction } from "react";
import type { ChatMessage } from "@/lib/types";
import { Suggestion } from "./elements/suggestion";
import type { VisibilityType } from "./visibility-selector";

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  setInput: Dispatch<SetStateAction<string>>;
  selectedVisibilityType: VisibilityType;
};

function PureSuggestedActions({
  chatId,
  sendMessage,
  setInput,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      short: "Taiwan blockade and semiconductors",
      long: "If a 45-day Taiwan Strait blockade cuts off 70% of advanced semiconductors, what is the causal effect on my quarterly output of: A) immediately activating a new Arizona fab (6-week ramp) vs. B) having pre-positioned 90 days of chip inventory across three regional warehouses?",
    },
    {
      short: "Next Suez / Red Sea crisis",
      long: "In the event of another 30-day full closure of the Suez Canal, compare the causal impact on my delivered cost per unit of: A) rerouting 100% of container ships around the Cape of Good Hope vs. B) shifting 40% of production to a new plant in Mexico over the next 18 months.",
    },
    {
      short: "U.S. re-imposes 100% tariffs on Chinese EVs and batteries",
      long: "If the U.S. suddenly imposes 100% tariffs on all Chinese-origin batteries starting in 6 months, what is the causal effect on my company’s 3-year EBITDA of: A) accelerating our Georgia gigafactory to full capacity 9 months early vs. B) forming a 50/50 JV with a Korean supplier to build a tariff-exempt plant in Mexico?",
    },
    {
      short: "EU enacts restrictive AI Act",
      long: "If the European Parliament passes aggressive new amendments to the AI Act in Q2 2026 that effectively ban real-time inference on consumer devices and require 24-month pre-market approval for any foundation model update, compare the causal impact on my company’s 5-year European revenue of: A) immediately shifting all EU inference and model-serving to approved open-source models hosted in Frankfurt vs. B) relocating 60% of our European AI R&D and commercial teams to the UK and UAE within 18 months.",
    },
  ];

  return (
    <div
      className="grid w-full gap-2 sm:grid-cols-2"
      data-testid="suggested-actions"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          initial={{ opacity: 0, y: 20 }}
          key={suggestedAction.short}
          transition={{ delay: 0.05 * index }}
        >
          <Suggestion
            className="h-auto w-full whitespace-normal p-3 text-left"
            onClick={() => {
              setInput(suggestedAction.long);
            }}
            suggestion={suggestedAction.short}
          >
            {suggestedAction.short}
          </Suggestion>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }

    return true;
  }
);
