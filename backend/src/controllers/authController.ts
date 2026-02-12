import { Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { CollegeEligibility, DepartmentEligibility } from '../models/Eligibility';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, email, password, fullName, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or student ID' });
    }

    // CRITICAL: Check college-level eligibility (whitelist to register)
    const collegeEligible = await CollegeEligibility.findOne({
      studentId: studentId.toUpperCase(),
      isActive: true
    });

    if (!collegeEligible) {
      return res.status(403).json({ 
        message: 'Access denied. You are not in the eligibility list for this election.',
        reason: 'not_in_college_eligibility_list'
      });
    }

    // Verify email matches eligibility list
    if (collegeEligible.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ 
        message: `Email mismatch. Please use your registered email: ${collegeEligible.email}`,
        expectedEmail: collegeEligible.email
      });
    }

    // Create user account
    const user = new User({
      studentId: studentId.toUpperCase(),
      email: email.toLowerCase(),
      password,
      fullName,
      department
    });

    await user.save();

    // AUTOMATICALLY add to department eligibility list after registration
    const existingDeptEligibility = await DepartmentEligibility.findOne({
      studentId: studentId.toUpperCase(),
      department
    });

    if (!existingDeptEligibility) {
      await DepartmentEligibility.create({
        studentId: studentId.toUpperCase(),
        department
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        email: user.email,
        fullName: user.fullName,
        department: user.department,
        isAdmin: user.isAdmin
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).populate('department');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // SKIP eligibility check for admins
    if (!user.isAdmin) {
      // Verify still eligible at college level
      const collegeEligible = await CollegeEligibility.findOne({
        studentId: user.studentId,
        isActive: true
      });

      if (!collegeEligible) {
        return res.status(403).json({ 
          message: 'Your access has been revoked. Please contact the electoral committee.',
          reason: 'eligibility_revoked'
        });
      }
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        email: user.email,
        fullName: user.fullName,
        department: user.department,
        isAdmin: user.isAdmin,
        hasVoted: user.hasVoted
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id)
      .select('-password')
      .populate('department');

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};