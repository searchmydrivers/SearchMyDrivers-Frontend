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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="material-icons-outlined text-white text-4xl">lock_reset</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Forgot Password</h1>
            <p className="text-blue-100 font-medium">Enter your email to reset password</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {success ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-icons-outlined text-green-600 text-4xl">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Email Sent!</h2>
                <p className="text-gray-600">
                  If an account with that email exists, a password reset link has been sent to your email.
                </p>
                <p className="text-sm text-gray-500">
                  Please check your inbox and click on the reset link to set a new password.
                </p>
                <Link
                  to="/login"
                  className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg font-semibold"
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
                  <label htmlFor="email" className="label flex items-center">
                    <span className="material-icons-outlined text-gray-400 mr-2 text-lg">email</span>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      className="input-field pl-12"
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
                  className="w-full btn-primary py-3 text-base font-semibold flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center space-x-1"
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

