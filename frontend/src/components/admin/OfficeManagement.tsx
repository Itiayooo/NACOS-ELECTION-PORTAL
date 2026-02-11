import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';

export default function OfficeManagement() {
  const [offices, setOffices] = useState([]);
  const [departments, setDepartments] = useState([]);

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
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Office Management</h2>
      <p className="text-gray-600">Manage electoral positions for college and departments</p>
      <div className="mt-6">
        {/* Similar CRUD interface as DepartmentManagement */}
        <p className="text-sm text-gray-500">{offices.length} offices configured</p>
      </div>
    </div>
  );
}
