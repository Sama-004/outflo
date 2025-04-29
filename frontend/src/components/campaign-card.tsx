import type { Campaign } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API_URL from "@/lib/api";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [isActive, setIsActive] = useState(campaign.status === "ACTIVE");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`${API_URL}/campaigns/${campaignId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete campaign");
      }

      return campaignId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });

      toast("Campaign deleted", {
        description: (
          <span className="text-black">
            The campaign has been successfully deleted
          </span>
        ),
      });

      setIsAlertOpen(false);
    },
    onError: (error) => {
      console.error("Error deleting campaign:", error);
      toast("Error", {
        description: (
          <span className="text-black">
            {error instanceof Error
              ? error.message
              : "Failed to delete campaign"}
          </span>
        ),
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      campaignId,
      status,
    }: {
      campaignId: string;
      status: string;
    }) => {
      const response = await fetch(`${API_URL}/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: status.toUpperCase() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update campaign status"
        );
      }

      return { campaignId, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });

      toast(
        `Campaign ${data.status === "active" ? "activated" : "deactivated"}`,
        {
          description: (
            <span className="text-black">
              The campaign has been successfully{" "}
              {data.status === "active" ? "activated" : "deactivated"}
            </span>
          ),
        }
      );
    },
    onError: (error) => {
      setIsActive(!isActive);
      console.error("Error updating campaign status:", error);
      toast("Error", {
        description: (
          <span className="text-black">
            {error instanceof Error
              ? error.message
              : "Failed to update campaign status"}
          </span>
        ),
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(campaign._id);
  };

  const handleStatusToggle = () => {
    const newStatus = isActive ? "inactive" : "active";
    setIsActive(!isActive);
    statusMutation.mutate({ campaignId: campaign._id, status: newStatus });
  };

  const displayStatus = campaign.status.toLowerCase();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{campaign.name}</CardTitle>
          <Badge variant={isActive ? "default" : "secondary"}>
            {displayStatus}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {campaign.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium">Leads</p>
            <p className="text-sm text-muted-foreground">
              {campaign.leads.length} LinkedIn profiles
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Accounts</p>
            <p className="text-sm text-muted-foreground">
              {campaign.accountIDs.length} accounts
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            checked={isActive}
            id={`status-${campaign._id}`}
            onCheckedChange={handleStatusToggle}
            disabled={statusMutation.isPending}
          />
          <label
            htmlFor={`status-${campaign._id}`}
            className="text-sm cursor-pointer">
            {statusMutation.isPending ? (
              <span className="flex items-center">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Updating...
              </span>
            ) : isActive ? (
              "Active"
            ) : (
              "Inactive"
            )}
          </label>
        </div>
        <div className="flex space-x-2">
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this campaign? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" size="icon" asChild>
            <Link to="/campaigns/$id" params={{ id: campaign._id }}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
