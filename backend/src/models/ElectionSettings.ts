import mongoose, { Document, Schema } from 'mongoose';

export interface IElection extends Document {
  title: string;
  level: 'college' | 'department';
  department?: mongoose.Types.ObjectId;
  status: 'draft' | 'open' | 'closed';
  resultVisibility: 'hidden' | 'live' | 'after-close';
  startDate?: Date;
  endDate?: Date;
}

const electionSchema = new Schema<IElection>(
  {
    title: { type: String, required: true, trim: true },
    level: { type: String, enum: ['college', 'department'], required: true },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: function (this: IElection) {
        return this.level === 'department';
      },
    },
    status: { type: String, enum: ['draft', 'open', 'closed'], default: 'draft' },
    resultVisibility: {
      type: String,
      enum: ['hidden', 'live', 'after-close'],
      default: 'hidden',
    },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IElection>('Election', electionSchema);