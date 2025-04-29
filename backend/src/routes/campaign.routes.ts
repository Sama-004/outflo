import { Router } from "express";
import { campaignController } from "../controllers/campaign.controller";

const router = Router();

/**
 * @route GET /campaigns
 * @desc Get all campaigns (excluding DELETED)
 */
router.get("/", campaignController.getAllCampaigns);

/**
 * @route GET /campaigns/:id
 * @desc Get a single campaign by ID
 */
router.get("/:id", campaignController.getCampaignById);

/**
 * @route POST /campaigns
 * @desc Create a new campaign
 */
router.post("/", campaignController.createCampaign);

/**
 * @route PUT /campaigns/:id
 * @desc Update campaign details
 */
router.put("/:id", campaignController.updateCampaign);

/**
 * @route PATCH /campaigns/:id
 * @desc Update campaign status
 */
router.patch("/:id", campaignController.updateCampaignStatus);

/**
 * @route DELETE /campaigns/:id
 * @desc Soft delete a campaign (set status to DELETED)
 */
router.delete("/:id", campaignController.deleteCampaign);

export default router;
