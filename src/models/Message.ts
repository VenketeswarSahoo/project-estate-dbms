import mongoose, { Schema, Model } from "mongoose";

import { Message as IMessage } from "@/types";

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    itemId: { type: String },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
