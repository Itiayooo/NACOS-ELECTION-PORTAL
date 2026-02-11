import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResultsView() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await adminService.getResults();
      setResults(response.data.results);
    } catch (error) {
      toast.error('Failed to fetch results');
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-8 h-8 text-nacos-green-600" />
          <div>
            <h2 className="text-2xl font-bold">Election Results</h2>
            <p className="text-gray-600">View vote counts and winners</p>
          </div>
        </div>
        <div className="mt-6">
          {results.length === 0 ? (
            <p className="text-gray-500">No results available yet</p>
          ) : (
            results.map((result: any) => (
              <div key={result.officeId} className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-lg mb-3">{result.office}</h3>
                <div className="space-y-2">
                  {result.candidates.map((candidate: any) => (
                    <div key={candidate.candidateId} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <img src={candidate.photo} alt={candidate.name} className="w-10 h-10 rounded-full object-cover" />
                        <span className="font-medium">{candidate.name}</span>
                      </div>
                      <span className="font-bold text-nacos-green-600">{candidate.votes} votes</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
