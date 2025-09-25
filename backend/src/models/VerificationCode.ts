import mongoose, { Document,Schema } from "mongoose";

export interface IVerificationCode extends Document {
  email: string;
  codeHash: string;
  verificationToken: string;
  purpose: "signup" | "reset";
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const verificationCodeSchema = new Schema<IVerificationCode>(
  {
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    codeHash: { type: String, required: true },
    verificationToken: { type: String, required: true },
    purpose: { type: String, enum: ["signup", "reset"], required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 }
  },
  { timestamps: true }
);

verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VerificationCodeModel = mongoose.model<IVerificationCode>("VerificationCode", verificationCodeSchema);
