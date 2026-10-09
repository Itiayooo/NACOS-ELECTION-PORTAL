import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidate extends Document {
  election: mongoose.Types.ObjectId;
  office: mongoose.Types.ObjectId;
  fullName: string;
  photoUrl: string;
  manifesto?: string;
  isActive: boolean;
}

const candidateSchema = new Schema<ICandidate>(
  {
    election: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
    office: { type: Schema.Types.ObjectId, ref: 'Office', required: true },
    fullName: { type: String, required: true, trim: true },
    photoUrl: { type: String, required: true },
    manifesto: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

candidateSchema.index({ election: 1, office: 1 });

export default mongoose.model<ICandidate>('Candidate', candidateSchema);