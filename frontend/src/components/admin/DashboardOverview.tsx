import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Vote, UserCheck, Award, TrendingUp, Building2 } from 'lucide-react';
import { adminService } from '../../services/api';
import { Statistics } from '../../types';

export default function DashboardOverview() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await adminService.getStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Students',
      value: stats.overview.totalUsers,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50'
    },
    {
      title: 'Total Voters',
      value: stats.overview.totalVoters,
      icon: UserCheck,
      color: 'green',
      bgColor: 'bg-green-500',
      lightBg: 'bg-green-50'
    },
    {
      title: 'Total Votes Cast',
      value: stats.overview.totalVotes,
      icon: Vote,
      color: 'purple',
      bgColor: 'bg-purple-500',
      lightBg: 'bg-purple-50'
    },
    {
      title: 'Voter Turnout',
      value: `${stats.overview.turnoutPercentage}%`,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-500',
      lightBg: 'bg-orange-50'
    },
    {
      title: 'Total Candidates',
      value: stats.overview.totalCandidates,
      icon: Award,
      color: 'pink',
      bgColor: 'bg-pink-500',
      lightBg: 'bg-pink-50'
    },
    {
      title: 'Active Positions',
      value: stats.overview.totalOffices,
      icon: Building2,
      color: 'indigo',
      bgColor: 'bg-indigo-500',
      lightBg: 'bg-indigo-50'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-display mb-2">Election Overview</h2>
        <p className="text-gray-600">Real-time statistics and insights</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-xl transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.lightBg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Department Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Department Breakdown</h3>
        
        <div className="space-y-4">
          {stats.departmentStats.map((dept: any, index: number) => {
            const turnout = dept.total > 0 ? ((dept.voted / dept.total) * 100).toFixed(1) : 0;
            const deptName = dept.department[0]?.name || 'Unknown';

            return (
              <div key={index} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{deptName}</h4>
                  <span className="text-sm font-medium text-nacos-green-600">
                    {dept.voted} / {dept.total} voted
                  </span>
                </div>
                
                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${turnout}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-nacos-green-500 to-nacos-green-600"
                  />
                </div>
                
                <p className="text-xs text-gray-600 mt-2">{turnout}% turnout</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
