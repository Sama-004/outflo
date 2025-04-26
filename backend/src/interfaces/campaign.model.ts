import mongoose, { Schema, Model } from "mongoose";
import { ICampaign } from "./campaign.interface";

const campaignSchema = new Schema<ICampaign>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["ACTIVE", "INACTIVE", "DELETED"],
    default: "ACTIVE",
  },
  leads: { type: [String], default: [] },
  accountIDs: { type: [Schema.Types.ObjectId], default: [] },
});

export const Campaign: Model<ICampaign> = mongoose.model<ICampaign>(
  "Campaign",
  campaignSchema,
);
