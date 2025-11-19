import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import type { ArtifactKind } from "@/components/artifact";
import { createDocumentHandler } from "@/lib/artifacts/server";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";

const kind: ArtifactKind = "experiment";

const onCreateDocument = async ({
  id: _id,
  title,
  dataStream,
  session: _session,
}: {
  id: string;
  title: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  session: Session;
}) => {
  // Initialize with empty JSON for dashboard
  const initialContent = JSON.stringify({
    progress: 0,
    currentStep: 0,
    steps: [
      "Identifying data sources",
      "Developing experiment",
      "Running experiment",
      "Creating parameterized model",
      "Generating UI",
      "Presenting report",
    ],
    results: "",
    children: [],
  });

  dataStream.write({
    type: "text-delta",
    delta: `\nCreated experiment dashboard: ${title}\n`,
    id: generateUUID(),
  });

  return initialContent;
};

const onUpdateDocument = async ({
  document,
  description,
  dataStream,
}: {
  document: {
    id: string;
    title: string;
    content: string | null;
    userId: string;
  };
  description: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}) => {
  // Parse new content from description (AI will send JSON string)
  let newContent: { results: string };
  try {
    newContent = JSON.parse(description);
  } catch {
    newContent = { results: description };
  }

  const updatedContent = JSON.stringify({
    ...JSON.parse(document.content || "{}"),
    ...newContent,
  });

  dataStream.write({
    type: "text-delta",
    delta: `\nUpdated experiment dashboard with: ${description}\n`,
    id: generateUUID(),
  });

  return updatedContent;
};

export const experimentDocumentHandler = createDocumentHandler({
  kind,
  onCreateDocument,
  onUpdateDocument,
});
