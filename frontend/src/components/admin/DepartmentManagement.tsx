import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { adminService } from '../../services/api';
import { Department } from '../../types';
import toast from 'react-hot-toast';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', shortName: '', isActive: true });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await adminService.getDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateDepartment(editingId, formData);
        toast.success('Department updated');
      } else {
        await adminService.createDepartment(formData);
        toast.success('Department created');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', shortName: '', isActive: true });
      fetchDepartments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingId(dept._id);
    setFormData({ name: dept.name, shortName: dept.shortName, isActive: dept.isActive });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await adminService.deleteDepartment(id);
      toast.success('Department deleted');
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to delete department');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="spinner"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">Department Management</h2>
          <p className="text-gray-600">Manage departments in the college</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Department
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit' : 'Add'} Department</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Name</label>
              <input
                type="text"
                required
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="input-field"
                placeholder="CS"
              />
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept, index) => (
          <motion.div
            key={dept._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-nacos-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-nacos-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{dept.name}</h3>
                  <p className="text-sm text-gray-600">{dept.shortName}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${dept.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {dept.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(dept)} className="btn-secondary text-sm py-2 flex-1 flex items-center justify-center gap-1">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => handleDelete(dept._id)} className="bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
