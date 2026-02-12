export interface User {
  id: string;
  studentId: string;
  email: string;
  fullName: string;
  department: Department;
  isAdmin: boolean;
  hasVoted: boolean;  
}

export interface Department {
  _id: string;
  name: string;
  shortName: string;
  isActive: boolean;
}

export interface Office {
  _id: string;
  title: string;
  level: 'college' | 'department';
  department?: string;
  isActive: boolean;
  order: number;
}

export interface Candidate {
  _id: string;
  fullName: string;
  photoUrl: string;
  office: Office | string;
  level: 'college' | 'department';
  department?: Department | string;
  manifesto?: string;
  isActive: boolean;
}

export interface Vote {
  officeId: string;
  candidateId: string;
}

export interface VotingReceipt {
  office: string;
  candidate: string;
  candidatePhoto: string;
  level: string;
  timestamp: Date;
}

export interface ElectionSettings {
  _id: string;
  isElectionActive: boolean;
  startDate?: Date;
  endDate?: Date;
  allowedDepartments: string[];
  resultVisibility: 'hidden' | 'live' | 'post-election';
}

export interface VoteResult {
  officeId: string;
  office: string;
  candidates: {
    candidateId: string;
    name: string;
    photo: string;
    votes: number;
  }[];
}

export interface Statistics {
  overview: {
    totalUsers: number;
    totalVoters: number;
    totalVotes: number;
    totalCandidates: number;
    totalOffices: number;
    turnoutPercentage: string;
  };
  departmentStats: any[];
}
