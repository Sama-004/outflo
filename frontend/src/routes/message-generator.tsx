import { MessageGenerator } from "@/components/message-generator";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/message-generator")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          LinkedIn Message Generator
        </h1>
        <p className="text-muted-foreground">
          Generate personalized outreach messages based on LinkedIn profiles
        </p>
      </div>
      <MessageGenerator />
    </div>
  );
}
