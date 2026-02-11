import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  shortName: string;
  isActive: boolean;
}

const departmentSchema = new Schema<IDepartment>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  shortName: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IDepartment>('Department', departmentSchema);
