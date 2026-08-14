import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGoal extends Document {
  id: string;
  userEmail: string;
  name?: string;
  title?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'RETIREMENT' | 'HOUSE' | 'EDUCATION' | 'CAR' | 'EMERGENCY' | 'OTHER';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    id: { type: String, required: true, index: true },
    userEmail: { type: String, required: true, lowercase: true, index: true },
    name: { type: String },
    title: { type: String },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    targetDate: { type: String, required: true },
    category: { type: String, default: 'OTHER' },
    notes: { type: String },
  },
  { timestamps: true }
);

GoalSchema.index({ userEmail: 1, id: 1 }, { unique: true });

export const GoalModel: Model<IGoal> = mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);
