import type React from "react";
import { useState } from "react";
import type { Campaign } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import API_URL from "@/lib/api";

interface CampaignFormProps {
  campaign?: Campaign;
  updateCampaign?: (id: string, data: any) => Promise<any>;
}

export function CampaignForm({ campaign, updateCampaign }: CampaignFormProps) {
  const isEditing = !!campaign;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    description: campaign?.description || "",
    status: campaign?.status || "active",
    leads: campaign?.leads?.join("\n") || "",
    accountIDs: campaign?.accountIDs?.join("\n") || "",
  });

  const generateObjectId = () => {
    const timestamp = Math.floor(new Date().getTime() / 1000)
      .toString(16)
      .padStart(8, "0");
    const randomPart = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    return timestamp + randomPart;
  };

  const handleAddObjectId = () => {
    const newId = generateObjectId();
    setFormData((prev) => {
      const currentIds = prev.accountIDs.trim();
      const newIds = currentIds ? `${currentIds}\n${newId}` : newId;
      return { ...prev, accountIDs: newIds };
    });

    toast("ID Generated", {
      description: (
        <span className="text-black">Added new MongoDB ObjectID</span>
      ),
      duration: 2000,
    });
  };

  const createCampaign = async (campaignData: any) => {
    try {
      const response = await fetch(`${API_URL}/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create campaign");
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

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
        status: formData.status.toUpperCase(), // Convert to match your backend expectations
        leads: formData.leads.split("\n").filter((lead) => lead.trim() !== ""),
        accountIDs: formData.accountIDs
          .split("\n")
          .filter((id) => id.trim() !== ""),
      };

      if (isEditing && campaign) {
        if (!updateCampaign) {
          throw new Error("Update function not provided");
        }
        await updateCampaign(campaign._id, campaignData);
        toast("Campaign Updated", {
          description: (
            <span className="text-black">Your changes have been saved</span>
          ),
        });
        navigate({
          to: "/",
        });
      } else {
        await createCampaign(campaignData);
        toast("Campaign Created", {
          description: (
            <span className="text-black">Your new campaign is ready</span>
          ),
        });

        navigate({
          to: "/",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast("Error", {
        description: (
          <span className="text-black">
            Failed to {isEditing ? "update" : "create"} campaign:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </span>
        ),
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountIDs">Account IDs (one ID per line)</Label>
              <Button
                type="button"
                size="sm"
                className="flex items-center"
                onClick={handleAddObjectId}>
                <Plus className="h-3 w-3 mr-1" />
                Generate ID
              </Button>
              <Textarea
                id="accountIDs"
                name="accountIDs"
                value={formData.accountIDs}
                onChange={handleChange}
                placeholder="507f1f77bcf86cd799439011&#10;507f191e810c19729de860ea"
                rows={3}
              />
              <div className="text-xs text-gray-500 mt-1">
                Must be valid MongoDB ObjectIDs (24-character hex strings)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Link to="/">
          <Button type="button" variant="outline" disabled={loading}>
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Campaign" : "Create Campaign"}
        </Button>
      </div>
    </form>
  );
}
