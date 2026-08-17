import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  id: string;
  email: string;
  name: string;
  password?: string;
  avatarUrl?: string;
  currency: 'VND' | 'USD';
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD';
  syncVersion: number;
  provider: 'local' | 'google';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    name: { type: String, required: true },
    password: { type: String },
    avatarUrl: { type: String },
    currency: { type: String, default: 'VND' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    syncVersion: { type: Number, default: 0 },
    provider: { type: String, default: 'local' },
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
