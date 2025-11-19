import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ChatHeader } from "@/components/chat-header";
import { ResultsClientPage } from "@/components/results-client-page";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch experiment from FastAPI backend
  let experiment: any = null;
  try {
    const response = await fetch(`http://localhost:8000/experiments/${id}`, {
      cache: "no-store",
    });

    if (response.ok) {
      experiment = await response.json();
    }
  } catch (error) {
    console.error("Error fetching experiment:", error);
  }

  if (!experiment || experiment.error) {
    return (
      <>
        <ChatHeader
          chatId={id}
          isReadonly={true}
          selectedVisibilityType="private"
        />
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
          <Card>
            <CardHeader>
              <CardTitle>No Experiment Results Found</CardTitle>
              <CardDescription>
                Either the experiment is still running or no results are
                available for this chat.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  return <ResultsClientPage experiment={experiment} id={id} />;
}
