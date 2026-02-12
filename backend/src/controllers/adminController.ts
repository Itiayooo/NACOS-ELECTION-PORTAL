import Vote from '../models/Vote';
import { Response } from 'express';
import Department from '../models/Department';
import Office from '../models/Office';
import Candidate from '../models/Candidate';
import User from '../models/User';
import ElectionSettings from '../models/ElectionSettings';
import { AuthRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/upload';

// Department Management
export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { name, shortName, isActive } = req.body;
    const department = new Department({ name, shortName, isActive });
    await department.save();
    res.status(201).json({ message: 'Department created', department });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create department', error: error.message });
  }
};

export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const departments = await Department.find();
    res.json({ departments });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch departments', error: error.message });
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const department = await Department.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: 'Department updated', department });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update department', error: error.message });
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Department.findByIdAndDelete(id);
    res.json({ message: 'Department deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete department', error: error.message });
  }
};

// Office Management
export const createOffice = async (req: AuthRequest, res: Response) => {
  try {
    const { title, level, department, order } = req.body;
    const office = new Office({ title, level, department, order });
    await office.save();
    res.status(201).json({ message: 'Office created', office });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create office', error: error.message });
  }
};

export const getOffices = async (req: AuthRequest, res: Response) => {
  try {
    const offices = await Office.find().populate('department').sort('order');
    res.json({ offices });
  } catch (error: any) {
    console.error('Get offices error:', error);
    res.status(500).json({ message: 'Failed to fetch offices', error: error.message });
  }
};

export const updateOffice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const office = await Office.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: 'Office updated', office });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update office', error: error.message });
  }
};

export const deleteOffice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Office.findByIdAndDelete(id);
    res.json({ message: 'Office deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete office', error: error.message });
  }
};

// Candidate Management
export const createCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, office, level, department, manifesto } = req.body;

    let photoUrl = '';
    if (req.file) {
      // Convert image to base64 and store directly
      const base64Image = req.file.buffer.toString('base64');
      photoUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    } else {
      // Use placeholder if no image provided
      photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=400&background=16a34a&color=fff`;
    }

    const candidate = new Candidate({
      fullName,
      photoUrl,
      office,
      level,
      department: level === 'department' ? department : undefined,
      manifesto
    });

    await candidate.save();
    res.status(201).json({ message: 'Candidate created', candidate });
  } catch (error: any) {
    console.error('Create candidate error:', error);
    res.status(500).json({ message: 'Failed to create candidate', error: error.message });
  }
};

export const getCandidates = async (req: AuthRequest, res: Response) => {
  try {
    const candidates = await Candidate.find()
      .populate('office')
      .populate('department');
    res.json({ candidates });
  } catch (error: any) {
    console.error('Get candidates error:', error);
    res.status(500).json({ message: 'Failed to fetch candidates', error: error.message });
  }
};

export const updateCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
      updates.photoUrl = await uploadToCloudinary(req.file.buffer, 'nacos-voting/candidates');
    }

    const candidate = await Candidate.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: 'Candidate updated', candidate });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update candidate', error: error.message });
  }
};

export const deleteCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Candidate.findByIdAndDelete(id);
    res.json({ message: 'Candidate deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete candidate', error: error.message });
  }
};

// Results and Analytics
// export const getResults = async (req: AuthRequest, res: Response) => {
//   try {
//     const { level, departmentId } = req.query;

//     let filter: any = {};
//     if (level) filter.level = level;
//     if (departmentId) filter.department = departmentId;

//     const votes = await Vote.find(filter)
//       .populate('office')
//       .populate('candidate')
//       .populate('department');

//     // Group votes by office
//     const results: any = {};

//     votes.forEach(vote => {
//       const office = vote.office as any;
//       const candidate = vote.candidate as any;
//       const officeId = office._id.toString();
//       const officeName = office.title;
//       const candidateId = candidate._id.toString();
//       const candidateName = candidate.fullName;
//       const candidatePhoto = candidate.photoUrl;
//       const officeLevel = office.level;

//       // Get department info for department-level offices
//       let departmentInfo = null;
//       if (officeLevel === 'department' && office.department) {
//         departmentInfo = office.department;
//       }

//       if (!results[officeId]) {
//         results[officeId] = {
//           office: officeName,
//           level: officeLevel,
//           departmentId: departmentInfo?._id?.toString() || null,
//           departmentName: departmentInfo?.name || null,
//           candidates: {}
//         };
//       }

//       if (!results[officeId].candidates[candidateId]) {
//         results[officeId].candidates[candidateId] = {
//           name: candidateName,
//           photo: candidatePhoto,
//           votes: 0
//         };
//       }

//       results[officeId].candidates[candidateId].votes++;
//     });

//     // Convert to array format and sort candidates by votes
//     const formattedResults = Object.keys(results).map(officeId => ({
//       officeId,
//       office: results[officeId].office,
//       level: results[officeId].level,
//       departmentId: results[officeId].departmentId,
//       departmentName: results[officeId].departmentName,
//       candidates: Object.keys(results[officeId].candidates)
//         .map(candidateId => ({
//           candidateId,
//           ...results[officeId].candidates[candidateId]
//         }))
//         .sort((a, b) => b.votes - a.votes) // Sort by votes descending
//     }));

//     res.json({ results: formattedResults });
//   } catch (error: any) {
//     console.error('Get results error:', error);
//     res.status(500).json({ message: 'Failed to fetch results', error: error.message });
//   }
// };

export const getResults = async (req: AuthRequest, res: Response) => {
  try {
    const { level, departmentId } = req.query;

    let filter: any = {};
    if (level) filter.level = level;
    if (departmentId) filter.department = departmentId;

    // Fetch all votes with proper population
    const votes = await Vote.find(filter)
      .populate({
        path: 'office',
        populate: {
          path: 'department',
          model: 'Department'
        }
      })
      .populate('candidate')
      .populate('department')
      .lean(); // Use lean for better performance

    if (votes.length === 0) {
      return res.json({ results: [] });
    }

    // Group votes by office
    const resultsMap: any = {};

    for (const vote of votes) {
      const office = vote.office as any;
      const candidate = vote.candidate as any;

      if (!office || !candidate) continue; // Skip invalid votes

      const officeId = office._id.toString();

      // Get department info safely
      let departmentInfo = null;
      if (office.level === 'department') {
        departmentInfo = office.department || vote.department;
      }

      // Initialize office result if not exists
      if (!resultsMap[officeId]) {
        resultsMap[officeId] = {
          office: office.title || 'Unknown Office',
          level: office.level || 'college',
          departmentId: departmentInfo?._id?.toString() || null,
          departmentName: departmentInfo?.name || null,
          candidates: {}
        };
      }

      const candidateId = candidate._id.toString();

      // Initialize candidate if not exists
      if (!resultsMap[officeId].candidates[candidateId]) {
        resultsMap[officeId].candidates[candidateId] = {
          name: candidate.fullName || 'Unknown Candidate',
          photo: candidate.photoUrl || '',
          votes: 0
        };
      }

      // Increment vote count
      resultsMap[officeId].candidates[candidateId].votes++;
    }

    // Convert to array and sort candidates
    const formattedResults = Object.keys(resultsMap).map(officeId => {
      const candidatesArray = Object.keys(resultsMap[officeId].candidates)
        .map(candidateId => ({
          candidateId,
          ...resultsMap[officeId].candidates[candidateId]
        }))
        .sort((a, b) => b.votes - a.votes); // Sort by votes descending

      return {
        officeId,
        office: resultsMap[officeId].office,
        level: resultsMap[officeId].level,
        departmentId: resultsMap[officeId].departmentId,
        departmentName: resultsMap[officeId].departmentName,
        candidates: candidatesArray
      };
    });

    res.json({ results: formattedResults });
  } catch (error: any) {
    console.error('Get results error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Failed to fetch results',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVoters = await User.countDocuments({ hasVoted: true });
    const totalVotes = await Vote.countDocuments();
    const totalCandidates = await Candidate.countDocuments({ isActive: true });
    const totalOffices = await Office.countDocuments({ isActive: true });

    const departmentStats = await User.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          voted: { $sum: { $cond: ['$hasVoted', 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalVoters,
        totalVotes,
        totalCandidates,
        totalOffices,
        turnoutPercentage: totalUsers > 0 ? ((totalVoters / totalUsers) * 100).toFixed(2) : 0
      },
      departmentStats
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};

// Election Settings
export const getElectionSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await ElectionSettings.findOne();
    if (!settings) {
      settings = new ElectionSettings();
      await settings.save();
    }
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch settings', error: error.message });
  }
};

export const updateElectionSettings = async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body;
    let settings = await ElectionSettings.findOne();

    if (!settings) {
      settings = new ElectionSettings(updates);
    } else {
      Object.assign(settings, updates);
    }

    await settings.save();
    res.json({ message: 'Settings updated', settings });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update settings', error: error.message });
  }
};
