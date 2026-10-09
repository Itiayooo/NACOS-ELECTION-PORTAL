import mongoose, { Document, Schema } from 'mongoose';

export interface IOffice extends Document {
  election: mongoose.Types.ObjectId;
  title: string;
  order: number;
  isActive: boolean;
}

const officeSchema = new Schema<IOffice>(
  {
    election: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

officeSchema.index({ election: 1, title: 1 }, { unique: true });

export default mongoose.model<IOffice>('Office', officeSchema);