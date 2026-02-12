import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, UserCog, Upload, X } from 'lucide-react';
import { adminService } from '../../services/api';
import { Candidate, Office, Department } from '../../types';
import toast from 'react-hot-toast';

export default function CandidateManagement() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    fullName: '',
    office: '',
    level: 'college' as 'college' | 'department',
    department: '',
    manifesto: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidatesRes, officesRes, deptsRes] = await Promise.all([
        adminService.getCandidates(),
        adminService.getOffices(),
        adminService.getDepartments()
      ]);
      setCandidates(candidatesRes.data.candidates);
      setOffices(officesRes.data.offices);
      setDepartments(deptsRes.data.departments);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoFile && !editingId) {
      toast.error('Please upload a candidate photo');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('office', formData.office);
      formDataToSend.append('level', formData.level);
      if (formData.department) {
        formDataToSend.append('department', formData.department);
      }
      if (formData.manifesto) {
        formDataToSend.append('manifesto', formData.manifesto);
      }
      formDataToSend.append('isActive', formData.isActive.toString());

      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      if (editingId) {
        await adminService.updateCandidate(editingId, formDataToSend);
        toast.success('Candidate updated');
      } else {
        await adminService.createCandidate(formDataToSend);
        toast.success('Candidate created');
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      fullName: '',
      office: '',
      level: 'college',
      department: '',
      manifesto: '',
      isActive: true
    });
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingId(candidate._id);
    setFormData({
      fullName: candidate.fullName,
      office: typeof candidate.office === 'string' ? candidate.office : candidate.office._id,
      level: candidate.level,
      department: typeof candidate.department === 'string' ? candidate.department : (candidate.department?._id || ''),
      manifesto: candidate.manifesto || '',
      isActive: candidate.isActive
    });
    setPhotoPreview(candidate.photoUrl);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await adminService.deleteCandidate(id);
      toast.success('Candidate deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete candidate');
    }
  };

  const getOfficeName = (candidate: Candidate) => {
    if (!candidate.office) return 'No Office Assigned';

    if (typeof candidate.office === 'string') {
      const office = offices.find(o => o._id === candidate.office);
      return office?.title || 'Unknown Office';
    }
    return candidate.office.title || 'Unknown Office';
  };

  const getDepartmentName = (candidate: Candidate) => {
    if (!candidate.department) return 'N/A';

    if (typeof candidate.department === 'string') {
      const dept = departments.find(d => d._id === candidate.department);
      return dept?.name || 'Unknown';
    }
    return candidate.department.name || 'Unknown';
  };

  if (loading) return <div className="flex justify-center py-20"><div className="spinner"></div></div>;

  const collegeOffices = offices.filter(o => o.level === 'college');
  const departmentOffices = offices.filter(o => o.level === 'department');
  const filteredOffices = formData.level === 'college' ? collegeOffices : departmentOffices;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">Candidate Management</h2>
          <p className="text-gray-600">Add and manage election candidates with photos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Candidate
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{editingId ? 'Edit' : 'Add'} Candidate</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level *
                </label>
                <select
                  required
                  value={formData.level}
                  onChange={(e) => setFormData({
                    ...formData,
                    level: e.target.value as 'college' | 'department',
                    office: '', // Reset office when level changes
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position/Office *
              </label>
              <select
                required
                value={formData.office}
                onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                className="input-field"
              >
                <option value="">Select Position</option>
                {filteredOffices.map((office) => (
                  <option key={office._id} value={office._id}>
                    {office.title} {office.level === 'department' && office.department ?
                      `(${departments.find(d => d._id === office.department)?.shortName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Candidate Photo *
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-nacos-green-500 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {photoFile ? photoFile.name : 'Choose photo (max 5MB)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {photoPreview && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-nacos-green-500">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manifesto (Optional)
              </label>
              <textarea
                value={formData.manifesto}
                onChange={(e) => setFormData({ ...formData, manifesto: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Brief manifesto or campaign message..."
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
              <button type="submit" className="btn-primary">
                {editingId ? 'Update' : 'Create'} Candidate
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No candidates added yet. Click "Add Candidate" to get started.
          </div>
        ) : (
          candidates.map((candidate, index) => (
            <motion.div
              key={candidate._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-nacos-green-600 mb-3">
                  <img
                    src={candidate.photoUrl}
                    alt={candidate.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-gray-900">{candidate.fullName}</h3>
                <p className="text-sm text-nacos-green-600 font-medium mt-1">
                  {getOfficeName(candidate)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${candidate.level === 'college'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                    }`}>
                    {candidate.level === 'college' ? 'College' : 'Department'}
                  </span>
                  {candidate.level === 'department' && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {getDepartmentName(candidate)}
                    </span>
                  )}
                </div>
                {candidate.manifesto && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                    {candidate.manifesto}
                  </p>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium mt-2 ${candidate.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                  {candidate.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(candidate)}
                  className="btn-secondary text-sm py-2 flex-1 flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(candidate._id)}
                  className="bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}