import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  id: string;
  userEmail: string;
  portfolioId: string;
  fundId: string;
  fundCode: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL';
  date: string;
  amount: number;
  unitPrice: number;
  units: number;
  fee: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    id: { type: String, required: true, index: true },
    userEmail: { type: String, required: true, lowercase: true, index: true },
    portfolioId: { type: String, required: true },
    fundId: { type: String, required: true },
    fundCode: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    units: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

TransactionSchema.index({ userEmail: 1, id: 1 }, { unique: true });

export const TransactionModel: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
