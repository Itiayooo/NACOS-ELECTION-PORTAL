import { Response } from 'express';
import { CollegeEligibility, DepartmentEligibility } from '../models/Eligibility';
import { AuthRequest } from '../middleware/auth';

// College Eligibility
export const getCollegeEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const eligible = await CollegeEligibility.find().sort('-createdAt');
    res.json({ eligible });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch eligibility list', error: error.message });
  }
};

export const addCollegeEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, email, fullName } = req.body;
    
    const existing = await CollegeEligibility.findOne({ 
      $or: [{ studentId: studentId.toUpperCase() }, { email: email.toLowerCase() }] 
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Student already in eligibility list' });
    }

    const eligible = new CollegeEligibility({
      studentId: studentId.toUpperCase(),
      email: email.toLowerCase(),
      fullName
    });

    await eligible.save();
    res.status(201).json({ message: 'Added to eligibility list', eligible });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add to eligibility list', error: error.message });
  }
};

export const removeCollegeEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    await CollegeEligibility.findOneAndDelete({ studentId: studentId.toUpperCase() });
    res.json({ message: 'Removed from eligibility list' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to remove from eligibility list', error: error.message });
  }
};

export const bulkUploadCollegeEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const { students } = req.body; // Array of { studentId, email, fullName }
    
    const eligibleStudents = students.map((s: any) => ({
      studentId: s.studentId.toUpperCase(),
      email: s.email.toLowerCase(),
      fullName: s.fullName
    }));

    const result = await CollegeEligibility.insertMany(eligibleStudents, { ordered: false });
    res.json({ message: `Added ${result.length} students to eligibility list`, count: result.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Bulk upload failed', error: error.message });
  }
};

// Department Eligibility
export const getDepartmentEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const { departmentId } = req.query;
    const filter = departmentId ? { department: departmentId } : {};
    
    const eligible = await DepartmentEligibility.find(filter)
      .populate('department')
      .sort('-createdAt');
    
    res.json({ eligible });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch eligibility list', error: error.message });
  }
};

export const addDepartmentEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, department } = req.body;
    
    const existing = await DepartmentEligibility.findOne({ 
      studentId: studentId.toUpperCase(),
      department
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Student already in department eligibility list' });
    }

    const eligible = new DepartmentEligibility({
      studentId: studentId.toUpperCase(),
      department
    });

    await eligible.save();
    res.status(201).json({ message: 'Added to department eligibility list', eligible });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add to eligibility list', error: error.message });
  }
};

export const removeDepartmentEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await DepartmentEligibility.findByIdAndDelete(id);
    res.json({ message: 'Removed from department eligibility list' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to remove from eligibility list', error: error.message });
  }
};

export const bulkUploadDepartmentEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const { students, department } = req.body; // Array of { studentId }
    
    const eligibleStudents = students.map((s: any) => ({
      studentId: s.studentId.toUpperCase(),
      department
    }));

    const result = await DepartmentEligibility.insertMany(eligibleStudents, { ordered: false });
    res.json({ message: `Added ${result.length} students to department eligibility list`, count: result.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Bulk upload failed', error: error.message });
  }
};