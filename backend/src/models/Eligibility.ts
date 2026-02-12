import mongoose, { Document, Schema } from 'mongoose';

// College-level eligibility (can access platform)
export interface ICollegeEligibility extends Document {
  studentId: string;
  email: string;
  fullName: string;
  isActive: boolean;
}

const collegeEligibilitySchema = new Schema<ICollegeEligibility>({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  fullName: {
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

export const CollegeEligibility = mongoose.model<ICollegeEligibility>('CollegeEligibility', collegeEligibilitySchema);

// Department-level eligibility (can vote in department elections)
export interface IDepartmentEligibility extends Document {
  studentId: string;
  department: mongoose.Types.ObjectId;
  isActive: boolean;
}

const departmentEligibilitySchema = new Schema<IDepartmentEligibility>({
  studentId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Unique combination of studentId and department
departmentEligibilitySchema.index({ studentId: 1, department: 1 }, { unique: true });

export const DepartmentEligibility = mongoose.model<IDepartmentEligibility>('DepartmentEligibility', departmentEligibilitySchema);