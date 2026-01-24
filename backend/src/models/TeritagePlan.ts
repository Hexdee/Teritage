import mongoose, { Document, Schema, Types } from "mongoose";

import { IUser } from "./User.js";

interface IInheritor {
  address: string;
  sharePercentage: number;
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  secretQuestion?: string;
  secretAnswerHash?: string;
  shareSecretQuestion?: boolean;
}

interface ITrackedToken {
  address: string;
  type: "ERC20" | "HTS" | "HBAR";
}

interface IActivity {
  id: string;
  type: "PLAN_CREATED" | "PLAN_UPDATED" | "CHECK_IN" | "CLAIM_TRIGGERED";
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

interface ICheckIn {
  id: string;
  timestamp: Date;
  secondsSinceLast: number;
  timelinessPercent: number;
  triggeredBy?: string;
  note?: string;
}

export interface ITeritagePlan extends Document {
  ownerAddress: string;
  ownerAccount: Types.ObjectId | IUser;
  inheritors: IInheritor[];
  tokens: ITrackedToken[];
  checkInIntervalSeconds: number;
  lastCheckInAt: Date;
  isClaimInitiated: boolean;
  activities: IActivity[];
  checkIns: ICheckIn[];
  socialLinks: string[];
  notifyBeneficiary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const inheritorSchema = new Schema<IInheritor>(
  {
    address: { type: String, required: true, lowercase: true, trim: true },
    sharePercentage: { type: Number, required: true },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    notes: { type: String },
    secretQuestion: { type: String },
    secretAnswerHash: { type: String },
    shareSecretQuestion: { type: Boolean, default: false }
  },
  { _id: false }
);

const activitySchema = new Schema<IActivity>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["PLAN_CREATED", "PLAN_UPDATED", "CHECK_IN", "CLAIM_TRIGGERED"], required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: () => new Date() }
  },
  { _id: false }
);

const checkInSchema = new Schema<ICheckIn>(
  {
    id: { type: String, required: true },
    timestamp: { type: Date, default: () => new Date() },
    secondsSinceLast: { type: Number, required: true },
    timelinessPercent: { type: Number, required: true },
    triggeredBy: { type: String },
    note: { type: String }
  },
  { _id: false }
);

const tokenSchema = new Schema<ITrackedToken>(
  {
    address: { type: String, required: true, lowercase: true, trim: true },
    type: { type: String, enum: ["ERC20", "HTS", "HBAR"], required: true }
  },
  { _id: false }
);

const teritagePlanSchema = new Schema<ITeritagePlan>(
  {
    ownerAddress: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ownerAccount: { type: Schema.Types.ObjectId, ref: "TeritageUser", required: true, unique: true, index: true },
    inheritors: { type: [inheritorSchema], default: [] },
    tokens: { type: [tokenSchema], default: [] },
    checkInIntervalSeconds: { type: Number, required: true },
    lastCheckInAt: { type: Date, required: true },
    isClaimInitiated: { type: Boolean, default: false },
    activities: { type: [activitySchema], default: [] },
    checkIns: { type: [checkInSchema], default: [] },
    socialLinks: { type: [String], default: [] },
    notifyBeneficiary: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const TeritagePlanModel = mongoose.model<ITeritagePlan>("TeritagePlan", teritagePlanSchema);
