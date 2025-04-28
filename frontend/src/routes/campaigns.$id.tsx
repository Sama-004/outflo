import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/campaigns/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const handleTest = () => {
    toast("Event has been created.");
  };

  return <Button onClick={handleTest}>test</Button>;
}
