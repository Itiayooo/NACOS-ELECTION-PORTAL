import mongoose, { Document, Schema } from 'mongoose';

export interface ICollegeEligibility extends Document {
  studentId: string;
  email: string;
  fullName: string;
  department: mongoose.Types.ObjectId;
  isActive: boolean;
}

const collegeEligibilitySchema = new Schema<ICollegeEligibility>(
  {
    studentId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CollegeEligibility = mongoose.model<ICollegeEligibility>(
  'CollegeEligibility',
  collegeEligibilitySchema
);