import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFund extends Document {
  id: string;
  userEmail: string;
  code: string;
  name: string;
  company: string;
  category: 'Equity' | 'Bond' | 'Balanced' | 'Index';
  nav: number;
  previousNav: number;
  navDate: string;
  inceptionDate: string;
  expenseRatioPercent: number;
  description: string;
  navHistory: Array<{ date: string; nav: number }>;
}

const FundSchema = new Schema<IFund>({
  id: { type: String, required: true, index: true },
  userEmail: { type: String, required: true, lowercase: true, index: true },
  code: { type: String, required: true, uppercase: true },
  name: { type: String, required: true },
  company: { type: String, required: true },
  category: { type: String, required: true },
  nav: { type: Number, required: true },
  previousNav: { type: Number, required: true },
  navDate: { type: String, required: true },
  inceptionDate: { type: String, required: true },
  expenseRatioPercent: { type: Number, default: 0 },
  description: { type: String, default: '' },
  navHistory: [{ date: { type: String, required: true }, nav: { type: Number, required: true } }],
}, { timestamps: true });

FundSchema.index({ userEmail: 1, id: 1 }, { unique: true });
FundSchema.index({ userEmail: 1, code: 1 }, { unique: true });

export const FundModel: Model<IFund> = mongoose.models.Fund || mongoose.model<IFund>('Fund', FundSchema);
