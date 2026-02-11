import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Settings, Power } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ElectionSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminService.getSettings();
      setSettings(response.data.settings);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleElection = async () => {
    try {
      await adminService.updateSettings({
        ...settings,
        isElectionActive: !settings.isElectionActive
      });
      toast.success(`Election ${!settings.isElectionActive ? 'activated' : 'deactivated'}`);
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-nacos-green-600" />
        <div>
          <h2 className="text-2xl font-bold">Election Settings</h2>
          <p className="text-gray-600">Configure election parameters</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Power className={`w-6 h-6 ${settings?.isElectionActive ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <h3 className="font-bold text-lg">Election Status</h3>
                <p className="text-sm text-gray-600">
                  {settings?.isElectionActive ? 'Election is currently active' : 'Election is currently inactive'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleElection}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                settings?.isElectionActive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {settings?.isElectionActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
