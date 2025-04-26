import { Request, Response } from "express";
import { Campaign } from "../interfaces/campaign.model";
import mongoose from "mongoose";

export const campaignController = {
  // Get all campaigns (excluding DELETED)
  getAllCampaigns: async (req: Request, res: Response): Promise<void> => {
    try {
      const campaigns = await Campaign.find({ status: { $ne: "DELETED" } });
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Error fetching campaigns", error });
    }
  },

  // Get Campaign By Id
  getCampaignById: async (req: Request, res: Response): Promise<void> => {
    try {
      const campaign = await Campaign.findOne({
        _id: req.params.id,
        status: { $ne: "DELETED" },
      });

      if (!campaign) {
        res.status(404).json({ message: "Campaign not found" });
        return;
      }

      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Error fetching campaign", error });
    }
  },

  //Create Campaign
  createCampaign: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, leads = [], accountIDs = [] } = req.body;

      // Validate required fields
      if (!name || !description) {
        res.status(400).json({ message: "Name and description are required" });
        return;
      }

      // Validate accountIDs are valid ObjectIds
      const invalidAccountIDs = accountIDs.filter(
        (id: string) => !mongoose.Types.ObjectId.isValid(id),
      );

      if (invalidAccountIDs.length > 0) {
        res.status(400).json({ message: "Invalid account IDs provided" });
        return;
      }

      const newCampaign = new Campaign({
        name,
        description,
        status: "ACTIVE",
        leads,
        accountIDs,
      });

      const savedCampaign = await newCampaign.save();
      res.status(201).json(savedCampaign);
    } catch (error) {
      res.status(500).json({ message: "Error creating campaign", error });
    }
  },

  //Update campaign
  updateCampaign: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, status, leads, accountIDs } = req.body;

      // Validate status if provided
      if (status && !["ACTIVE", "INACTIVE"].includes(status)) {
        res
          .status(400)
          .json({ message: "Status can only be ACTIVE or INACTIVE" });
        return;
      }

      // Validate accountIDs if provided
      if (accountIDs) {
        const invalidAccountIDs = accountIDs.filter(
          (id: string) => !mongoose.Types.ObjectId.isValid(id),
        );

        if (invalidAccountIDs.length > 0) {
          res.status(400).json({ message: "Invalid account IDs provided" });
          return;
        }
      }

      const updatedCampaign = await Campaign.findOneAndUpdate(
        { _id: req.params.id, status: { $ne: "DELETED" } },
        { name, description, status, leads, accountIDs },
        { new: true },
      );

      if (!updatedCampaign) {
        res
          .status(404)
          .json({ message: "Campaign not found or already deleted" });
        return;
      }

      res.json(updatedCampaign);
    } catch (error) {
      res.status(500).json({ message: "Error updating campaign", error });
    }
  },

  // Soft delete a campaign (set status to DELETED)
  deleteCampaign: async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedCampaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        { status: "DELETED" },
        { new: true },
      );

      if (!deletedCampaign) {
        res.status(404).json({ message: "Campaign not found" });
        return;
      }

      res.json({ message: "Campaign soft deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting campaign", error });
    }
  },
};
