export const DEFAULT_CHAT_MODEL: string = "grok-4-fast-reasoning";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "grok-4-fast-reasoning",
    name: "Grok-4 Fast Reasoning",
    description:
      "Fast reasoning model optimized for causal analysis and simulations",
  },
];
