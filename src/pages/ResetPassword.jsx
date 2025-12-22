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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200/50 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="material-icons-outlined text-[#2BB673] text-3xl sm:text-4xl">check_circle</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Your password has been reset successfully.</p>
            <p className="text-xs sm:text-sm text-gray-500">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="bg-[#0B2C4D] p-6 sm:p-8 text-center relative overflow-hidden">
            {/* Decorative circle */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white/5 blur-3xl"></div>

            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg border border-white/10">
              <span className="material-icons-outlined text-[#2BB673] text-3xl sm:text-4xl">lock</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 tracking-tight">Reset Password</h1>
            <p className="text-gray-300 font-medium text-sm sm:text-base">Enter your new password</p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center animate-slide-in">
                  <span className="material-icons-outlined mr-2 text-red-500">error</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="password" className="label flex items-center text-gray-700 font-bold text-sm mb-2">
                  <span className="material-icons-outlined text-gray-400 mr-2 text-lg">lock</span>
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2BB673]/20 focus:border-[#2BB673] transition-all font-medium"
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
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#2BB673] transition-colors"
                  >
                    <span className="material-icons-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label flex items-center text-gray-700 font-bold text-sm mb-2">
                  <span className="material-icons-outlined text-gray-400 mr-2 text-lg">lock</span>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2BB673]/20 focus:border-[#2BB673] transition-all font-medium"
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
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#2BB673] transition-colors"
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
                className="w-full py-3 text-base font-bold text-white bg-gradient-to-r from-[#2BB673] to-[#239960] hover:from-[#239960] hover:to-[#1a7548] rounded-xl shadow-lg shadow-green-900/20 transition-all duration-300 flex items-center justify-center transform active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
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
                  className="text-[#2BB673] hover:text-[#239960] font-bold text-sm flex items-center justify-center space-x-1 transition-colors"
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

