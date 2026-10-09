import mongoose, { Document, Schema } from 'mongoose';

export interface IParticipation extends Document {
  election: mongoose.Types.ObjectId;
  voter: mongoose.Types.ObjectId;
  votedAt: Date;
}

const participationSchema = new Schema<IParticipation>({
  election: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
  voter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  votedAt: { type: Date, default: Date.now },
});

participationSchema.index({ election: 1, voter: 1 }, { unique: true });

export default mongoose.model<IParticipation>('Participation', participationSchema);