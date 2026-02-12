import { Response } from 'express';
import Vote from '../models/Vote';
import User from '../models/User';
import Candidate from '../models/Candidate';
import Office from '../models/Office';
import ElectionSettings from '../models/ElectionSettings';
import { AuthRequest } from '../middleware/auth';
import { DepartmentEligibility } from '../models/Eligibility';

// export const getVotingData = async (req: AuthRequest, res: Response) => {
//   try {
//     const user = req.user!;

//     // Get election settings
//     const settings = await ElectionSettings.findOne().populate('allowedDepartments');
//     if (!settings?.isElectionActive) {
//       return res.status(400).json({ message: 'Election is not currently active' });
//     }

//     // Check if user's department is allowed to vote
//     const userDeptId = typeof user.department === 'string' ? user.department : user.department._id.toString();
//     const allowedDeptIds = settings.allowedDepartments.map((d: any) =>
//       typeof d === 'string' ? d : d._id.toString()
//     );

//     if (!allowedDeptIds.includes(userDeptId)) {
//       return res.status(403).json({
//         message: 'Your department is not participating in this election',
//         allowedToVote: false
//       });
//     }

//     // Get college-level offices and candidates (everyone can see)
//     const collegeOffices = await Office.find({ level: 'college', isActive: true }).sort('order');
//     const collegeCandidates = await Candidate.find({
//       level: 'college',
//       isActive: true,
//       office: { $in: collegeOffices.map(o => o._id) }
//     }).populate('office');

//     let departmentOffices: any[] = [];
//     let departmentCandidates: any[] = [];

//     // Only show department positions if user is in department eligibility list
//     if (user.canVoteInDepartment) {
//       departmentOffices = await Office.find({
//         level: 'department',
//         department: user.department,
//         isActive: true
//       }).sort('order');

//       departmentCandidates = await Candidate.find({
//         level: 'department',
//         department: user.department,
//         isActive: true,
//         office: { $in: departmentOffices.map(o => o._id) }
//       }).populate('office');
//     }

//     res.json({
//       collegeOffices,
//       departmentOffices,
//       collegeCandidates,
//       departmentCandidates,
//       hasVoted: user.hasVoted,
//       allowedToVote: true,
//       canVoteInDepartment: user.canVoteInDepartment,
//       userDepartment: user.department
//     });
//   } catch (error: any) {
//     res.status(500).json({ message: 'Failed to fetch voting data', error: error.message });
//   }
// };

export const getVotingData = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    // Get election settings
    const settings = await ElectionSettings.findOne().populate('allowedDepartments');
    if (!settings?.isElectionActive) {
      return res.status(400).json({ message: 'Election is not currently active' });
    }

    // Check if user's department is allowed to vote
    const userDeptId = typeof user.department === 'string' ? user.department : user.department._id.toString();
    const allowedDeptIds = settings.allowedDepartments.map((d: any) =>
      typeof d === 'string' ? d : d._id.toString()
    );

    if (!allowedDeptIds.includes(userDeptId)) {
      return res.status(403).json({
        message: 'Your department is not participating in this election',
        allowedToVote: false
      });
    }

    // Get college-level offices and candidates (EVERYONE in college sees these)
    const collegeOffices = await Office.find({ level: 'college', isActive: true }).sort('order');
    const collegeCandidates = await Candidate.find({
      level: 'college',
      isActive: true,
      office: { $in: collegeOffices.map(o => o._id) }
    }).populate('office');

    // Check if user is in THEIR department's eligibility list
    const deptEligible = await DepartmentEligibility.findOne({
      studentId: user.studentId,
      department: user.department,
      isActive: true
    });

    let departmentOffices: any[] = [];
    let departmentCandidates: any[] = [];

    // Only show THEIR department's positions if they're in that department's list
    if (deptEligible) {
      departmentOffices = await Office.find({
        level: 'department',
        department: user.department,
        isActive: true
      }).sort('order');

      departmentCandidates = await Candidate.find({
        level: 'department',
        department: user.department,
        isActive: true,
        office: { $in: departmentOffices.map(o => o._id) }
      }).populate('office');
    }

    res.json({
      collegeOffices,
      departmentOffices,
      collegeCandidates,
      departmentCandidates,
      hasVoted: user.hasVoted,
      allowedToVote: true,
      canVoteInDepartment: !!deptEligible,
      userDepartment: user.department
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch voting data', error: error.message });
  }
};

export const castVote = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { votes } = req.body; // Array of { officeId, candidateId }

    if (user.hasVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    const settings = await ElectionSettings.findOne().populate('allowedDepartments');
    if (!settings?.isElectionActive) {
      return res.status(400).json({ message: 'Election is not currently active' });
    }

    // Check if user's department is allowed to vote
    const userDeptId = typeof user.department === 'string' ? user.department : user.department._id.toString();
    const allowedDeptIds = settings.allowedDepartments.map((d: any) =>
      typeof d === 'string' ? d : d._id.toString()
    );

    if (!allowedDeptIds.includes(userDeptId)) {
      return res.status(403).json({
        message: 'Your department is not participating in this election'
      });
    }

    // Validate all votes before saving
    const votePromises = votes.map(async (vote: any) => {
      const office = await Office.findById(vote.officeId);
      const candidate = await Candidate.findById(vote.candidateId);

      if (!office || !candidate) {
        throw new Error('Invalid office or candidate');
      }

      if (candidate.office.toString() !== office._id.toString()) {
        throw new Error('Candidate does not belong to this office');
      }

      // IMPORTANT: Ensure user can only vote for their own department's positions
      if (office.level === 'department') {
        const officeDeptId = typeof office.department === 'string' ? office.department : office.department?.toString();
        if (officeDeptId !== userDeptId) {
          throw new Error('You cannot vote for positions in other departments');
        }
      }

      // Ensure candidate belongs to user's department (for department-level)
      if (candidate.level === 'department') {
        const candidateDeptId = typeof candidate.department === 'string' ? candidate.department : candidate.department?.toString();
        if (candidateDeptId !== userDeptId) {
          throw new Error('You cannot vote for candidates from other departments');
        }
      }

      return new Vote({
        voter: user._id,
        candidate: candidate._id,
        office: office._id,
        level: office.level,
        department: office.level === 'department' ? office.department : undefined
      });
    });

    const voteRecords = await Promise.all(votePromises);
    await Vote.insertMany(voteRecords);

    // Mark user as voted
    user.hasVoted = true;
    user.votedAt = new Date();
    await user.save();

    // Return voting receipt
    const receipt = await Vote.find({ voter: user._id })
      .populate('office')
      .populate('candidate');

    res.json({
      message: 'Votes cast successfully',
      receipt: receipt.map(vote => ({
        office: (vote.office as any).title,
        candidate: (vote.candidate as any).fullName,
        candidatePhoto: (vote.candidate as any).photoUrl,
        level: vote.level,
        timestamp: vote.timestamp
      }))
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to cast vote', error: error.message });
  }
};

export const getVotingReceipt = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    if (!user.hasVoted) {
      return res.status(400).json({ message: 'You have not voted yet' });
    }

    const receipt = await Vote.find({ voter: user._id })
      .populate('office')
      .populate('candidate');

    res.json({
      receipt: receipt.map(vote => ({
        office: (vote.office as any).title,
        candidate: (vote.candidate as any).fullName,
        candidatePhoto: (vote.candidate as any).photoUrl,
        level: vote.level,
        timestamp: vote.timestamp
      })),
      votedAt: user.votedAt
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch receipt', error: error.message });
  }
};
