import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  UserCog, 
  BarChart3, 
  Settings,
  LogOut 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import DashboardOverview from '../components/admin/DashboardOverview';
import DepartmentManagement from '../components/admin/DepartmentManagement';
import OfficeManagement from '../components/admin/OfficeManagement';
import CandidateManagement from '../components/admin/CandidateManagement';
import ResultsView from '../components/admin/ResultsView';
import ElectionSettingsPanel from '../components/admin/ElectionSettings';

type Tab = 'overview' | 'departments' | 'offices' | 'candidates' | 'results' | 'settings';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user?.isAdmin) {
    navigate('/login');
    return null;
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'departments' as Tab, label: 'Departments', icon: Building2 },
    { id: 'offices' as Tab, label: 'Offices', icon: Briefcase },
    { id: 'candidates' as Tab, label: 'Candidates', icon: UserCog },
    { id: 'results' as Tab, label: 'Results', icon: BarChart3 },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-nacos-green-50/20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-nacos-green-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-display">NACOS Admin</h1>
                <p className="text-xs text-gray-500">Election Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-nacos-green-600 text-white shadow-lg shadow-nacos-green-600/30'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <DashboardOverview />}
          {activeTab === 'departments' && <DepartmentManagement />}
          {activeTab === 'offices' && <OfficeManagement />}
          {activeTab === 'candidates' && <CandidateManagement />}
          {activeTab === 'results' && <ResultsView />}
          {activeTab === 'settings' && <ElectionSettingsPanel />}
        </motion.div>
      </div>
    </div>
  );
}
