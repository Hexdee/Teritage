import { Document, Schema, Types, model } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId;
  event: string;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "TeritageUser", required: true, index: true },
    event: { type: String, required: true, trim: true },
    payload: { type: Schema.Types.Mixed, default: null },
    isRead: { type: Boolean, default: false }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel = model<INotification>("Notification", notificationSchema);
