import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import toast from 'react-hot-toast';
import Logo from '../assets/SearchMyDriver.png';
import BackgroundImg from '../assets/SearchMyDriver-Background.png';

const PublicSupport = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Registration Issue',
    description: '',
    category: 'account'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/tickets/public', formData);
      if (res.data.success) {
        setSubmitted(true);
        toast.success('Support ticket raised successfully');
      }
    } catch (error) {
      console.error('Support ticket error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B2C4D]">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-icons-outlined text-green-600 text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-8">
            Our support team has received your request. We will contact you at <strong>{formData.phone}</strong> shortly.
          </p>
          <Link
            to="/login"
            className="block w-full py-3 bg-[#2BB673] text-white rounded-lg font-bold hover:bg-[#239960] transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full relative overflow-hidden bg-[#0B2C4D]">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${BackgroundImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B2C4D] via-transparent to-black/30"></div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-6">
            <img src={Logo} alt="Search My Driver" className="h-20 w-auto mx-auto brightness-0 invert" />
            <h1 className="text-2xl font-bold text-white mt-4">Help & Support</h1>
            <p className="text-blue-200 text-sm mt-1">Facing issues with registration? We're here to help.</p>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10">
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2BB673] outline-none text-sm transition-all"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
                    <input
                      required
                      type="tel"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2BB673] outline-none text-sm transition-all"
                      placeholder="10-digit number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Email (Optional)</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2BB673] outline-none text-sm transition-all"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Issue Type</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2BB673] outline-none text-sm transition-all appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="account">Registration / Account Issue</option>
                    <option value="technical">Technical Glitch</option>
                    <option value="payment">Payment Issue</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Description</label>
                  <textarea
                    required
                    rows="4"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2BB673] outline-none text-sm transition-all resize-none"
                    placeholder="Tell us what's happening..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#2BB673] to-[#1e8553] text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit Help Request'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link to="/login" className="text-blue-300 hover:text-white text-sm font-medium transition-colors">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSupport;
