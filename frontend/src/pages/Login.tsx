import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Loader } from 'lucide-react';
import { authService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const response = await authService.login(formData);
  //     const { user, token } = response.data;

  //     login(user, token);
  //     toast.success('Login successful!');

  //     if (user.isAdmin) {
  //       navigate('/admin');
  //     } else {
  //       navigate('/vote');
  //     }
  //   } catch (error: any) {
  //     toast.error(error.response?.data?.message || 'Login failed');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData);
      const { user, token } = response.data;

      login(user, token);
      toast.success('Login successful!');

      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/vote');
      }
    } catch (error: any) {
      // Handle eligibility revoked error
      if (error.response?.data?.reason === 'eligibility_revoked') {
        toast.error('Access Revoked: Your eligibility has been removed. Contact the electoral committee.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block p-4 bg-nacos-green-600 rounded-full mb-4"
          >
            <LogIn className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-nacos-green-800 font-display mb-2">
            NACOS Voting
          </h1>
          <p className="text-gray-600">College of Computing Sciences Election</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-display">Login to Vote</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-nacos-green-600 hover:text-nacos-green-700 font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-500"
        >
          <p>National Association of Computing Students</p>
          <p className="mt-1">College of Computing Sciences</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
