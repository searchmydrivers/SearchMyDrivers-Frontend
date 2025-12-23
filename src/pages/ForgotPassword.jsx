import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/admins/forgot-password', { email });
      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || 'Failed to send reset email');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset email. Please try again.';
      const errorHint = err.response?.data?.hint || '';
      setError(errorMessage + (errorHint ? ` ${errorHint}` : ''));
      console.error('Forgot password error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="bg-[#0B2C4D] p-6 text-center relative overflow-hidden">
            {/* Decorative circle */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-white/5 blur-3xl"></div>

            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md border border-white/10">
              <span className="material-icons-outlined text-[#2BB673] text-3xl">lock_reset</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-1 tracking-tight">Forgot Password</h1>
            <p className="text-gray-300 font-medium text-xs">Enter your email to reset password</p>
          </div>

          {/* Form */}
          <div className="p-6">
            {success ? (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-icons-outlined text-[#2BB673] text-3xl">check_circle</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Email Sent!</h2>
                <p className="text-xs text-gray-600 mb-1">
                  If an account with that email exists, a password reset link has been sent to your email.
                </p>
                <p className="text-[10px] text-gray-500 mb-4">
                  Please check your inbox and click on the reset link.
                </p>
                <Link
                  to="/login"
                  className="inline-block mt-2 px-6 py-2 bg-gradient-to-r from-[#2BB673] to-[#239960] text-white rounded-lg hover:from-[#239960] hover:to-[#1a7548] transition-all duration-300 shadow-md shadow-green-900/20 font-semibold text-sm"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded flex items-center animate-slide-in">
                    <span className="material-icons-outlined mr-2 text-red-500 text-base">error</span>
                    <span className="font-medium text-xs">{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2BB673] focus:border-[#2BB673] transition-all font-medium text-xs sm:text-sm"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <span className="material-icons-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base">email</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2BB673] to-[#239960] hover:from-[#239960] hover:to-[#1a7548] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center transform active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-icons-outlined mr-2 text-lg">send</span>
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-[#2BB673] hover:text-[#239960] font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                  >
                    <span className="material-icons-outlined text-sm">arrow_back</span>
                    <span>Back to Login</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
