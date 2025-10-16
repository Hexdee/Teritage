import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  isEmailVerified: boolean;
  username?: string;
  walletAddresses: string[];
  name?: string;
  phone?: string;
  notes?: string;
  allowNotifications: boolean;
  pinHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    username: { type: String, unique: true, sparse: true, trim: true },
    walletAddresses: {
      type: [String],
      default: [],
      set: (addresses: string[]) => addresses.map((address) => address.trim())
    },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    notes: { type: String, trim: true },
    allowNotifications: { type: Boolean, default: false },
    pinHash: { type: String }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("TeritageUser", userSchema);
