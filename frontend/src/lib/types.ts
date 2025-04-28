export type CampaignStatus = "active" | "inactive" | "deleted";

export interface Campaign {
  _id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  leads: string[];
  accountIDs: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LinkedInProfile {
  name: string;
  job_title: string;
  company: string;
  location: string;
  summary: string;
}

export interface MessageResponse {
  message: string;
}
