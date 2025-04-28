import type React from "react";
import { useState } from "react";
import type { Campaign } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { redirect } from "@tanstack/react-router";

interface CampaignFormProps {
  campaign?: Campaign;
}

export function CampaignForm({ campaign }: CampaignFormProps) {
  const isEditing = !!campaign;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    description: campaign?.description || "",
    status: campaign?.status || "active",
    leads: campaign?.leads.join("\n") || "",
    accountIDs: campaign?.accountIDs.join("\n") || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value as "active" | "inactive",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const campaignData = {
        name: formData.name,
        description: formData.description,
        status: formData.status as "active" | "inactive",
        leads: formData.leads.split("\n").filter((lead) => lead.trim() !== ""),
        accountIDs: formData.accountIDs
          .split("\n")
          .filter((id) => id.trim() !== ""),
      };
      console.log("campaign data", campaignData);

      if (isEditing && campaign) {
        // await updateCampaign(campaign.id, campaignData);
        toast("Campaign Updated", {
          description: "Your changes have been saved",
        });
      } else {
        // await createCampaign(campaignData);
        toast("Campaign Created", {
          description: "Your new campaign is ready",
        });
      }

      redirect({
        to: "/",
        throw: true,
      });
    } catch (error) {
      toast("Error", {
        description: `Failed to ${isEditing ? "update" : "create"} campaign`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter campaign name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your campaign"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup
                value={formData.status}
                onValueChange={handleStatusChange}
                className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive">Inactive</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leads">LinkedIn Leads (one URL per line)</Label>
              <Textarea
                id="leads"
                name="leads"
                value={formData.leads}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/profile-1&#10;https://linkedin.com/in/profile-2"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountIDs">Account IDs (one ID per line)</Label>
              <Textarea
                id="accountIDs"
                name="accountIDs"
                value={formData.accountIDs}
                onChange={handleChange}
                placeholder="123&#10;456"
                rows={3}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            redirect({
              to: "/",
              throw: true,
            })
          }
          disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Campaign" : "Create Campaign"}
        </Button>
      </div>
    </form>
  );
}
