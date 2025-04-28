import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/campaigns/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  console.log("campaign id", id);

  return <div className="bg-red-400">test</div>;
}
