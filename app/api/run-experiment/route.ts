import type { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getMessageById, getMessagesByChatId } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";
import { convertToUIMessages } from "@/lib/utils";

const requestBodySchema = z.object({
  messageId: z.string(),
  chatId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, chatId } = requestBodySchema.parse(body);

    const session = await auth();
    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    // Fetch experiment message to ensure it exists
    const dbMessages = await getMessageById({ id: messageId });
    if (!dbMessages || dbMessages.length === 0) {
      return new ChatSDKError(
        "not_found:database",
        "Experiment message not found"
      ).toResponse();
    }

    // Fetch the full chat history to provide context to the backend
    const chatHistoryFromDb = await getMessagesByChatId({ id: chatId });
    const chatHistory = convertToUIMessages(chatHistoryFromDb);

    // Proxy to FastAPI
    const fastapiResponse = await fetch(`${process.env.FASTAPI_URL || "http://localhost:8000"}/run-experiment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatId, messageId, chatHistory }),
    });

    if (!fastapiResponse.ok) {
      throw new Error(`FastAPI error: ${fastapiResponse.status}`);
    }

    return new Response(fastapiResponse.body, {
      status: fastapiResponse.status,
      headers: {
        ...fastapiResponse.headers,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Run analysis proxy error:", error);
    return new ChatSDKError(
      "bad_request:api",
      "Failed to run experiment"
    ).toResponse();
  }
}
