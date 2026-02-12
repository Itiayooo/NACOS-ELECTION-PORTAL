import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, CreditCard, GraduationCap, Loader } from 'lucide-react';
import { authService, adminService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Department } from '../types';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    department: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await authService.getDepartments();  // Changed from adminService
      setDepartments(response.data.departments.filter((d: Department) => d.isActive));
    } catch (error) {
      console.error('Failed to fetch departments');
      toast.error('Failed to load departments');
    }
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (formData.password !== formData.confirmPassword) {
  //     toast.error('Passwords do not match');
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const response = await authService.register({
  //       studentId: formData.studentId,
  //       email: formData.email,
  //       password: formData.password,
  //       fullName: formData.fullName,
  //       department: formData.department
  //     });

  //     const { user, token } = response.data;
  //     login(user, token);
  //     toast.success('Registration successful!');
  //     navigate('/vote');
  //   } catch (error: any) {
  //     toast.error(error.response?.data?.message || 'Registration failed');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        studentId: formData.studentId,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        department: formData.department
      });

      const { user, token } = response.data;
      login(user, token);
      toast.success('Registration successful!');
      navigate('/vote');
    } catch (error: any) {
      // Handle eligibility errors
      if (error.response?.data?.reason === 'not_in_college_eligibility_list') {
        toast.error('Access Denied: You are not eligible to register for this platform. Please contact the electoral committee.');
      } else if (error.response?.data?.expectedEmail) {
        toast.error(`Email mismatch: Please use ${error.response.data.expectedEmail}`);
      } else {
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block p-4 bg-nacos-green-600 rounded-full mb-4"
          >
            <UserPlus className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-nacos-green-800 font-display mb-2">
            Join NACOS Voting
          </h1>
          <p className="text-gray-600">Register to participate in the election</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-display">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input-field pl-11"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="input-field pl-11"
                    placeholder="CS/2020/1234"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field pl-11"
                  placeholder="student@nacos.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="input-field pl-11"
                >
                  <option value="">Select your department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-11"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input-field pl-11"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Register
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-nacos-green-600 hover:text-nacos-green-700 font-semibold">
                Login here
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
