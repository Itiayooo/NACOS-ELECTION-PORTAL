import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  voter: mongoose.Types.ObjectId;
  candidate: mongoose.Types.ObjectId;
  office: mongoose.Types.ObjectId;
  level: 'college' | 'department';
  department?: mongoose.Types.ObjectId;
  timestamp: Date;
}

const voteSchema = new Schema<IVote>({
  voter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidate: {
    type: Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  office: {
    type: Schema.Types.ObjectId,
    ref: 'Office',
    required: true
  },
  level: {
    type: String,
    enum: ['college', 'department'],
    required: true
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one vote per voter per office
voteSchema.index({ voter: 1, office: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', voteSchema);
