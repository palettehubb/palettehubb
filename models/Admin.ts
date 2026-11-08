import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminDoc extends Document {
  username: string;
  email: string;
  passwordHash: string;
  tokenVersion: number;
  resetOtp?: {
    codeHash: string;
    expiresAt: Date;
    attempts: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdminDoc>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    resetOtp: {
      codeHash: { type: String },
      expiresAt: { type: Date },
      attempts: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model<IAdminDoc>('Admin', AdminSchema);
