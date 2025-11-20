import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../config/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/admins/reset-password', {
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/50 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons-outlined text-green-600 text-4xl">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-6">Your password has been reset successfully.</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="material-icons-outlined text-white text-4xl">lock</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Reset Password</h1>
            <p className="text-blue-100 font-medium">Enter your new password</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center animate-slide-in">
                  <span className="material-icons-outlined mr-2 text-red-500">error</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="password" className="label flex items-center">
                  <span className="material-icons-outlined text-gray-400 mr-2 text-lg">lock</span>
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="input-field pl-12 pr-12"
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <span className="material-icons-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">lock</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="material-icons-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label flex items-center">
                  <span className="material-icons-outlined text-gray-400 mr-2 text-lg">lock</span>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="input-field pl-12 pr-12"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                  <span className="material-icons-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">lock</span>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="material-icons-outlined text-xl">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full btn-primary py-3 text-base font-semibold flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons-outlined mr-2">lock_reset</span>
                    <span>Reset Password</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center space-x-1"
                >
                  <span className="material-icons-outlined text-lg">arrow_back</span>
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

