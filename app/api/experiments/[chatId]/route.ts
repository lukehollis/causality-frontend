import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const { chatId } = await params;
    if (!chatId) {
      return new ChatSDKError(
        "bad_request:api",
        "Chat ID is required"
      ).toResponse();
    }

    const fastapiResponse = await fetch(
      `http://localhost:8000/experiments/${chatId}`
    );

    if (!fastapiResponse.ok) {
      throw new Error(`FastAPI error: ${fastapiResponse.status}`);
    }

    const data = await fastapiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Get experiment results proxy error:", error);
    return new ChatSDKError(
      "bad_request:api",
      "Failed to get experiment results"
    ).toResponse();
  }
}
