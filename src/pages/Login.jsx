import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      
      if (response.success) {
        localStorage.setItem('adminToken', response.data.token);
        // Store admin data for quick access
        if (response.data.admin) {
          localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        }
        navigate('/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl sm:text-3xl">SD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 tracking-tight">Search My Drivers</h1>
            <p className="text-blue-100 font-medium text-sm sm:text-base">Admin Panel Login</p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center animate-slide-in text-sm sm:text-base">
                  <span className="material-icons-outlined mr-2 text-red-500 text-lg sm:text-xl">error</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="label text-xs sm:text-sm">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="input-field text-sm sm:text-base"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="label text-xs sm:text-sm">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="input-field pr-10 sm:pr-12 text-sm sm:text-base"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="material-icons-outlined text-lg sm:text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 sm:py-3 text-sm sm:text-base font-semibold flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons-outlined mr-2 text-lg sm:text-xl">login</span>
                    <span>Login</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2 sm:pt-4">
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center space-x-1 text-sm sm:text-base"
                >
                  <span className="material-icons-outlined text-base sm:text-lg">lock_reset</span>
                  <span>Forgot Password?</span>
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs sm:text-sm mt-4 sm:mt-6 font-medium">
          © 2024 Search My Drivers. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
