import type { UserType } from "@/app/(auth)/auth";
import type { ChatModel } from "./models";

type Entitlements = {
  maxMessagesPerDay: number;
  availableChatModelIds: ChatModel["id"][];
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 10000,
    availableChatModelIds: ["grok-4-fast-reasoning"],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 10000,
    availableChatModelIds: ["grok-4-fast-reasoning"],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
