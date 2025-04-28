import { createFileRoute } from "@tanstack/react-router";
import { CampaignList } from "@/components/campaign-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/campaigns/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your LinkedIn outreach campaigns
          </p>
        </div>
        <Button asChild>
          <Link to="/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Link>
        </Button>
      </div>
      <CampaignList />
    </div>
  );
}
