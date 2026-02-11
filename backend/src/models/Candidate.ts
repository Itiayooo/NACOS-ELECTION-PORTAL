import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidate extends Document {
  fullName: string;
  photoUrl: string;
  office: mongoose.Types.ObjectId;
  level: 'college' | 'department';
  department?: mongoose.Types.ObjectId;
  manifesto?: string;
  isActive: boolean;
}

const candidateSchema = new Schema<ICandidate>({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  photoUrl: {
    type: String,
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
    ref: 'Department',
    required: function(this: ICandidate) {
      return this.level === 'department';
    }
  },
  manifesto: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ICandidate>('Candidate', candidateSchema);
