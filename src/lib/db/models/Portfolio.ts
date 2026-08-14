import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPortfolio extends Document {
  id: string;
  userEmail: string;
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userEmail: { type: String, required: true, lowercase: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    color: { type: String, default: '#6750A4' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PortfolioModel: Model<IPortfolio> =
  mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
