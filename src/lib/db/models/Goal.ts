import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGoal extends Document {
  id: string;
  userEmail: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'RETIREMENT' | 'HOUSE' | 'EDUCATION' | 'EMERGENCY' | 'OTHER';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userEmail: { type: String, required: true, lowercase: true, index: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    targetDate: { type: String, required: true },
    category: { type: String, default: 'OTHER' },
    notes: { type: String },
  },
  { timestamps: true }
);

export const GoalModel: Model<IGoal> =
  mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);
