import { Document } from "mongoose";

export interface IMessage extends Document {
  name: string;
  job_title: string;
  company: string;
  location?: string;
  summary?: string;
  generated_message: string;
  created_at: Date;
}
