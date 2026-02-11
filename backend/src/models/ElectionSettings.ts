import mongoose, { Document, Schema } from 'mongoose';

export interface IElectionSettings extends Document {
  isElectionActive: boolean;
  startDate?: Date;
  endDate?: Date;
  allowedDepartments: mongoose.Types.ObjectId[];
  resultVisibility: 'hidden' | 'live' | 'post-election';
}

const electionSettingsSchema = new Schema<IElectionSettings>({
  isElectionActive: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  allowedDepartments: [{
    type: Schema.Types.ObjectId,
    ref: 'Department'
  }],
  resultVisibility: {
    type: String,
    enum: ['hidden', 'live', 'post-election'],
    default: 'hidden'
  }
}, {
  timestamps: true
});

export default mongoose.model<IElectionSettings>('ElectionSettings', electionSettingsSchema);
