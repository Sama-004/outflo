import mongoose, { Schema } from "mongoose";
import { IMessage } from "./message.interface";

const messageSchema: Schema = new Schema({
  name: { type: String, required: true },
  job_title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  summary: { type: String },
  generated_message: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IMessage>("Message", messageSchema);
