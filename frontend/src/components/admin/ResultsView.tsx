import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Trophy, Users, Download, Filter } from 'lucide-react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';

interface CandidateResult {
  candidateId: string;
  name: string;
  photo: string;
  votes: number;
}

interface OfficeResult {
  officeId: string;
  office: string;
  level: 'college' | 'department';
  departmentId?: string | null;
  departmentName?: string | null;
  candidates: CandidateResult[];
}

export default function ResultsView() {
  const [results, setResults] = useState<OfficeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'college' | 'department'>('all');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await adminService.getResults();
      console.log('Results from backend:', response.data.results);
      setResults(response.data.results || []);
    } catch (error: any) {
      console.error('Fetch results error:', error);
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }

    // Create CSV content with proper grouping
    let csv = 'Level,Department,Office,Rank,Candidate,Votes,Percentage\n';
    
    // Sort results: college first, then by department
    const sortedResults = [...results].sort((a, b) => {
      if (a.level === 'college' && b.level === 'department') return -1;
      if (a.level === 'department' && b.level === 'college') return 1;
      if (a.departmentName && b.departmentName) {
        return a.departmentName.localeCompare(b.departmentName);
      }
      return 0;
    });

    sortedResults.forEach(office => {
      const totalVotes = office.candidates.reduce((sum, c) => sum + c.votes, 0);
      
      office.candidates.forEach((candidate, index) => {
        const percentage = totalVotes > 0 
          ? ((candidate.votes / totalVotes) * 100).toFixed(2) 
          : '0';
        const level = office.level === 'college' ? 'College' : 'Department';
        const dept = office.departmentName || 'N/A';
        const rank = index + 1;
        
        csv += `"${level}","${dept}","${office.office}",${rank},"${candidate.name}",${candidate.votes},${percentage}%\n`;
      });
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `election-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Results exported successfully');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="spinner"></div>
      </div>
    );
  }

  // Separate results by level
  const collegeResults = results.filter(r => r.level === 'college');
  const departmentResults = results.filter(r => r.level === 'department');

  // Group department results by department
  const departmentGroups: { [key: string]: OfficeResult[] } = {};
  departmentResults.forEach(result => {
    const deptName = result.departmentName || 'Unknown Department';
    if (!departmentGroups[deptName]) {
      departmentGroups[deptName] = [];
    }
    departmentGroups[deptName].push(result);
  });

  const showCollege = viewMode === 'all' || viewMode === 'college';
  const showDepartment = viewMode === 'all' || viewMode === 'department';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-nacos-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-display">Election Results</h2>
            <p className="text-gray-600">Complete breakdown of all votes</p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-white text-nacos-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => setViewMode('college')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'college'
                  ? 'bg-white text-nacos-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              College Only
            </button>
            <button
              onClick={() => setViewMode('department')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'department'
                  ? 'bg-white text-nacos-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Departments Only
            </button>
          </div>

          <button
            onClick={exportResults}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No votes have been cast yet</p>
          <p className="text-gray-400 text-sm mt-2">Results will appear here once voting begins</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* College Level Results */}
          {showCollege && collegeResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-gradient-to-r from-nacos-green-600 to-nacos-green-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <Trophy className="w-7 h-7" />
                  <div>
                    <h3 className="text-2xl font-bold font-display">
                      College of Computing Sciences
                    </h3>
                    <p className="text-nacos-green-100 text-sm mt-1">
                      {collegeResults.length} {collegeResults.length === 1 ? 'position' : 'positions'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-b-2xl shadow-lg p-6 space-y-6">
                {collegeResults.map((office, index) => (
                  <OfficeResultCard key={office.officeId} office={office} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Department Level Results */}
          {showDepartment && Object.keys(departmentGroups).length > 0 && (
            <div className="space-y-8">
              {Object.entries(departmentGroups).map(([deptName, deptOffices]) => (
                <motion.div
                  key={deptName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-7 h-7" />
                      <div>
                        <h3 className="text-2xl font-bold font-display">
                          {deptName}
                        </h3>
                        <p className="text-purple-100 text-sm mt-1">
                          {deptOffices.length} department {deptOffices.length === 1 ? 'position' : 'positions'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-b-2xl shadow-lg p-6 space-y-6">
                    {deptOffices.map((office, index) => (
                      <OfficeResultCard key={office.officeId} office={office} index={index} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* No results for selected view */}
          {((showCollege && !showDepartment && collegeResults.length === 0) ||
            (!showCollege && showDepartment && Object.keys(departmentGroups).length === 0)) && (
            <div className="card text-center py-12">
              <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No results for this view</p>
              <p className="text-gray-400 text-sm mt-2">
                Try selecting "All Results" to see all available data
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OfficeResultCard({ office, index }: { office: OfficeResult; index: number }) {
  const totalVotes = office.candidates.reduce((sum, c) => sum + c.votes, 0);
  const hasVotes = totalVotes > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
    >
      {/* Office Header */}
      <div className="mb-4">
        <h4 className="text-xl font-bold text-gray-900">{office.office}</h4>
        <p className="text-sm text-gray-600 mt-1">
          Total Votes Cast: <span className="font-semibold text-nacos-green-600">{totalVotes}</span>
        </p>
      </div>

      {/* Candidates */}
      {office.candidates.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">No candidates for this position</p>
        </div>
      ) : (
        <div className="space-y-3">
          {office.candidates.map((candidate, candidateIndex) => {
            const percentage = hasVotes ? ((candidate.votes / totalVotes) * 100).toFixed(1) : '0';
            const isWinner = candidateIndex === 0 && hasVotes;

            return (
              <motion.div
                key={candidate.candidateId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + candidateIndex * 0.05 }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isWinner
                    ? 'border-nacos-green-500 bg-nacos-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Winner Badge */}
                {isWinner && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-2 rounded-full shadow-lg">
                    <Trophy className="w-5 h-5" />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`text-2xl font-bold w-10 text-center ${
                    isWinner ? 'text-nacos-green-700' : 'text-gray-400'
                  }`}>
                    #{candidateIndex + 1}
                  </div>

                  {/* Photo */}
                  <div className={`w-16 h-16 rounded-full overflow-hidden border-4 flex-shrink-0 ${
                    isWinner ? 'border-nacos-green-500' : 'border-gray-300'
                  }`}>
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-bold text-gray-900">{candidate.name}</h5>
                      {isWinner && (
                        <span className="px-2 py-1 bg-nacos-green-600 text-white text-xs font-bold rounded-full uppercase">
                          Winner
                        </span>
                      )}
                    </div>

                    {/* Vote Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">
                          {candidate.votes} {candidate.votes === 1 ? 'vote' : 'votes'}
                        </span>
                        <span className={`font-bold ${
                          isWinner ? 'text-nacos-green-700' : 'text-gray-700'
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 + candidateIndex * 0.05 }}
                          className={`h-full ${
                            isWinner
                              ? 'bg-gradient-to-r from-nacos-green-500 to-nacos-green-600'
                              : 'bg-gray-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}