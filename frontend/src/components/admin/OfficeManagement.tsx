import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Briefcase, GripVertical } from 'lucide-react';
import { adminService } from '../../services/api';
import { Office, Department } from '../../types';
import toast from 'react-hot-toast';

export default function OfficeManagement() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    level: 'college' as 'college' | 'department',
    department: '',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [officesRes, deptsRes] = await Promise.all([
        adminService.getOffices(),
        adminService.getDepartments()
      ]);
      setOffices(officesRes.data.offices);
      setDepartments(deptsRes.data.departments);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        department: formData.level === 'department' ? formData.department : undefined
      };

      if (editingId) {
        await adminService.updateOffice(editingId, dataToSend);
        toast.success('Office updated');
      } else {
        await adminService.createOffice(dataToSend);
        toast.success('Office created');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ title: '', level: 'college', department: '', isActive: true, order: 0 });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (office: Office) => {
    setEditingId(office._id);
    setFormData({
      title: office.title,
      level: office.level,
      department: typeof office.department === 'string' ? office.department : (office.department?._id || ''),
      isActive: office.isActive,
      order: office.order
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this office? This will affect candidates running for this position.')) return;
    try {
      await adminService.deleteOffice(id);
      toast.success('Office deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete office');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="spinner"></div></div>;

  const collegeOffices = offices.filter(o => o.level === 'college');
  const departmentOffices = offices.filter(o => o.level === 'department');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">Office Management</h2>
          <p className="text-gray-600">Manage electoral positions for college and departments</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Office
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit' : 'Add'} Office</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Office Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., President, Vice President"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
                <select
                  required
                  value={formData.level}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    level: e.target.value as 'college' | 'department',
                    department: e.target.value === 'college' ? '' : formData.department
                  })}
                  className="input-field"
                >
                  <option value="college">College Level</option>
                  <option value="department">Department Level</option>
                </select>
              </div>
            </div>

            {formData.level === 'department' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="input-field"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-nacos-green-600"
              />
              <label className="text-sm text-gray-700">Active</label>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* College Offices */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          College Level Offices
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collegeOffices.map((office, index) => (
            <OfficeCard
              key={office._id}
              office={office}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Department Offices */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
          Department Level Offices
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentOffices.map((office, index) => (
            <OfficeCard
              key={office._id}
              office={office}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              departments={departments}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OfficeCard({ 
  office, 
  index, 
  onEdit, 
  onDelete,
  departments = []
}: { 
  office: Office; 
  index: number; 
  onEdit: (office: Office) => void;
  onDelete: (id: string) => void;
  departments?: Department[];
}) {
  const getDeptName = () => {
    if (!office.department) return '';
    const dept = departments.find(d => d._id === office.department);
    return dept ? dept.shortName : '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            office.level === 'college' ? 'bg-blue-100' : 'bg-purple-100'
          }`}>
            <Briefcase className={`w-5 h-5 ${
              office.level === 'college' ? 'text-blue-600' : 'text-purple-600'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{office.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                office.level === 'college' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {office.level}
              </span>
              {office.level === 'department' && getDeptName() && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {getDeptName()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-500">#{office.order}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          office.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {office.isActive ? 'Active' : 'Inactive'}
        </span>
        <div className="flex gap-2">
          <button onClick={() => onEdit(office)} className="text-blue-600 hover:text-blue-700 p-1">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(office._id)} className="text-red-600 hover:text-red-700 p-1">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
