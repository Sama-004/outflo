import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CampaignForm } from "@/components/campaign-form";
import { Loader2 } from "lucide-react";
import type { Campaign } from "@/lib/types";

export const Route = createFileRoute("/campaigns/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/campaigns/${id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch campaign");
        }

        const campaignData = await response.json();
        setCampaign(campaignData);
      } catch (error) {
        console.error("Error fetching campaign:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        toast("Error", {
          description: `Failed to load campaign: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const updateCampaign = async (campaignId: string, campaignData: any) => {
    try {
      const response = await fetch(
        `http://localhost:8080/campaigns/${campaignId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(campaignData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update campaign");
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Campaign not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Campaign</h1>
      <CampaignForm campaign={campaign} updateCampaign={updateCampaign} />
    </div>
  );
}
