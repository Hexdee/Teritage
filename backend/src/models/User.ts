import mongoose, { Document,Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  isEmailVerified: boolean;
  username?: string;
  walletAddresses: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    username: { type: String, unique: true, sparse: true, trim: true },
    walletAddresses: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
