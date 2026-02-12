import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, CheckCircle, LogOut, Receipt, Loader, AlertCircle } from 'lucide-react';
import { voteService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Office, Candidate } from '../types';
import toast from 'react-hot-toast';
import VoteReceipt from '../components/VoteReceipt';

export default function VotingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [collegeOffices, setCollegeOffices] = useState<Office[]>([]);
  const [departmentOffices, setDepartmentOffices] = useState<Office[]>([]);
  const [collegeCandidates, setCollegeCandidates] = useState<Candidate[]>([]);
  const [departmentCandidates, setDepartmentCandidates] = useState<Candidate[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState<any[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessMessage, setAccessMessage] = useState('');

  useEffect(() => {
    if (user?.hasVoted) {
      fetchReceipt();
    } else {
      fetchVotingData();
    }
  }, [user]);

  const fetchVotingData = async () => {
    try {
      const response = await voteService.getVotingData();
      const { collegeOffices, departmentOffices, collegeCandidates, departmentCandidates, allowedToVote } = response.data;
      
      if (allowedToVote === false) {
        setAccessDenied(true);
        setAccessMessage(response.data.message || 'You are not allowed to vote in this election');
        setLoading(false);
        return;
      }

      setCollegeOffices(collegeOffices);
      setDepartmentOffices(departmentOffices);
      setCollegeCandidates(collegeCandidates);
      setDepartmentCandidates(departmentCandidates);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setAccessDenied(true);
        setAccessMessage(error.response?.data?.message || 'Access denied');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load voting data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReceipt = async () => {
    try {
      const response = await voteService.getReceipt();
      setReceipt(response.data.receipt);
      setShowReceipt(true);
    } catch (error) {
      console.error('Failed to fetch receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSelect = (officeId: string, candidateId: string) => {
    setSelectedVotes(prev => ({
      ...prev,
      [officeId]: candidateId
    }));
  };

  const handleSubmit = async () => {
    const allOffices = [...collegeOffices, ...departmentOffices];
    
    if (Object.keys(selectedVotes).length !== allOffices.length) {
      toast.error('Please vote for all positions');
      return;
    }

    setSubmitting(true);

    try {
      const votes = Object.entries(selectedVotes).map(([officeId, candidateId]) => ({
        officeId,
        candidateId
      }));

      const response = await voteService.castVote(votes);
      setReceipt(response.data.receipt);
      setShowReceipt(true);
      toast.success('Your votes have been cast successfully!');
      
      // Update user state
      if (user) {
        useAuthStore.getState().updateUser({ ...user, hasVoted: true });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cast votes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading voting data...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="glass-card text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6">{accessMessage}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Your department ({user?.department?.name || 'Unknown'}) is not participating in this election.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-primary flex items-center justify-center gap-2 w-full"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showReceipt) {
    return <VoteReceipt receipt={receipt} onClose={() => navigate('/login')} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-nacos-green-800 font-display mb-1">
                NACOS Election 2025/26
              </h1>
              <p className="text-gray-600">
                Welcome, <span className="font-semibold text-nacos-green-700">{user?.fullName}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* College Level Voting */}
        {collegeOffices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-nacos-green-600 text-white p-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold font-display">College of Computing Sciences</h2>
              <p className="text-nacos-green-100 text-sm">Select one candidate for each position</p>
            </div>
            
            <div className="bg-white rounded-b-2xl shadow-lg p-6 space-y-8">
              {collegeOffices.map((office) => {
                const candidates = collegeCandidates.filter(
                  (c) => (typeof c.office === 'string' ? c.office : c.office._id) === office._id
                );

                return (
                  <div key={office._id} className="border-b border-gray-200 last:border-0 pb-8 last:pb-0">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-nacos-green-600 rounded-full"></div>
                      {office.title}
                    </h3>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {candidates.map((candidate) => (
                        <CandidateCard
                          key={candidate._id}
                          candidate={candidate}
                          selected={selectedVotes[office._id] === candidate._id}
                          onClick={() => handleVoteSelect(office._id, candidate._id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Department Level Voting */}
        {departmentOffices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-nacos-green-700 text-white p-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold font-display">Department of Computer Science</h2>
              <p className="text-nacos-green-100 text-sm">Select one candidate for each position</p>
            </div>
            
            <div className="bg-white rounded-b-2xl shadow-lg p-6 space-y-8">
              {departmentOffices.map((office) => {
                const candidates = departmentCandidates.filter(
                  (c) => (typeof c.office === 'string' ? c.office : c.office._id) === office._id
                );

                return (
                  <div key={office._id} className="border-b border-gray-200 last:border-0 pb-8 last:pb-0">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-nacos-green-700 rounded-full"></div>
                      {office.title}
                    </h3>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {candidates.map((candidate) => (
                        <CandidateCard
                          key={candidate._id}
                          candidate={candidate}
                          selected={selectedVotes[office._id] === candidate._id}
                          onClick={() => handleVoteSelect(office._id, candidate._id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="sticky bottom-8"
        >
          <div className="glass-card">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-nacos-green-600" />
                <div>
                  <p className="font-semibold text-gray-800">
                    {Object.keys(selectedVotes).length} of {collegeOffices.length + departmentOffices.length} positions selected
                  </p>
                  <p className="text-sm text-gray-600">Make sure you've voted for all positions</p>
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(selectedVotes).length !== (collegeOffices.length + departmentOffices.length)}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Vote className="w-5 h-5" />
                    Submit Votes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CandidateCard({ candidate, selected, onClick }: { 
  candidate: Candidate; 
  selected: boolean; 
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
        selected
          ? 'border-nacos-green-600 bg-nacos-green-50 shadow-lg shadow-nacos-green-600/20'
          : 'border-gray-200 bg-white hover:border-nacos-green-300'
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="w-6 h-6 text-nacos-green-600 fill-nacos-green-100" />
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <div className={`w-24 h-24 rounded-full overflow-hidden mb-3 border-4 ${
          selected ? 'border-nacos-green-600' : 'border-gray-200'
        }`}>
          <img
            src={candidate.photoUrl}
            alt={candidate.fullName}
            className="w-full h-full object-cover"
          />
        </div>
        
        <h4 className="font-bold text-gray-800 text-center">{candidate.fullName}</h4>
        
        {candidate.manifesto && (
          <p className="text-xs text-gray-600 mt-2 text-center line-clamp-2">
            {candidate.manifesto}
          </p>
        )}
      </div>
    </motion.button>
  );
}
