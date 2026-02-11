import mongoose, { Document, Schema } from 'mongoose';

export interface IOffice extends Document {
  title: string;
  level: 'college' | 'department';
  department?: mongoose.Types.ObjectId;
  isActive: boolean;
  order: number;
}

const officeSchema = new Schema<IOffice>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['college', 'department'],
    required: true
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: function(this: IOffice) {
      return this.level === 'department';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate offices at same level
officeSchema.index({ title: 1, level: 1, department: 1 }, { unique: true });

export default mongoose.model<IOffice>('Office', officeSchema);
