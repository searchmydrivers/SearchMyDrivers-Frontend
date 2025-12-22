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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="bg-[#0B2C4D] p-6 sm:p-8 text-center relative overflow-hidden">
            {/* Decorative circle */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white/5 blur-3xl"></div>

            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg border border-white/10">
              <span className="material-icons-outlined text-[#2BB673] text-3xl sm:text-4xl">lock_reset</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 tracking-tight">Forgot Password</h1>
            <p className="text-gray-300 font-medium text-sm sm:text-base">Enter your email to reset password</p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            {success ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-icons-outlined text-[#2BB673] text-3xl sm:text-4xl">check_circle</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Email Sent!</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  If an account with that email exists, a password reset link has been sent to your email.
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                  Please check your inbox and click on the reset link to set a new password.
                </p>
                <Link
                  to="/login"
                  className="inline-block mt-4 sm:mt-6 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#2BB673] to-[#239960] text-white rounded-lg sm:rounded-xl hover:from-[#239960] hover:to-[#1a7548] transition-all duration-300 shadow-lg shadow-green-900/20 font-semibold text-sm sm:text-base"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center animate-slide-in">
                    <span className="material-icons-outlined mr-2 text-red-500">error</span>
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="label flex items-center text-gray-700 font-bold text-sm mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2BB673]/20 focus:border-[#2BB673] transition-all font-medium"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <span className="material-icons-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">email</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-base font-bold text-white bg-gradient-to-r from-[#2BB673] to-[#239960] hover:from-[#239960] hover:to-[#1a7548] rounded-xl shadow-lg shadow-green-900/20 transition-all duration-300 flex items-center justify-center transform active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-icons-outlined mr-2">send</span>
                      <span>Send Reset Link</span>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

