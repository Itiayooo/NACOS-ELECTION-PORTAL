import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  election: mongoose.Types.ObjectId;
  office: mongoose.Types.ObjectId;
  candidate: mongoose.Types.ObjectId;
  voter: mongoose.Types.ObjectId;
  timestamp: Date;
}

const voteSchema = new Schema<IVote>(
  {
    election: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
    office: { type: Schema.Types.ObjectId, ref: 'Office', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    voter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

voteSchema.index({ voter: 1, office: 1 }, { unique: true });
voteSchema.index({ election: 1, candidate: 1 });

export default mongoose.model<IVote>('Vote', voteSchema);