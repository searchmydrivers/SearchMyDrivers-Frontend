import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import BackgroundImg from '../assets/SearchMyDriver-Background.png';
import Logo from '../assets/SearchMyDriver.png';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isExiting, setIsExiting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted', formData);
    setError('');
    setLoading(true);

    try {
      console.log('Calling authService.login...');
      const response = await authService.login(formData.email, formData.password);
      console.log('Login response:', response);

      if (response.success) {
        localStorage.setItem('adminToken', response.data.token);
        // Store admin data for quick access (including adminType and workLocation)
        if (response.data.admin) {
          localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        }

        // Trigger Exit Animation
        setIsExiting(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 500); // Wait for 500ms (animation duration)

      } else {
        setError(response.message || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full relative overflow-hidden">
      {/* Background Image - Full Screen with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform hover:scale-105 transition-transform duration-[30s]"
          style={{ backgroundImage: `url(${BackgroundImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
      </div>

      {/* Main Content Container */}
      <div className={`relative z-10 w-full flex flex-col lg:flex-row min-h-screen ${isExiting ? 'page-slide-out-left' : ''}`}>

        {/* Left Side - Tagline & Project Info */}
        <div className="hidden lg:flex flex-1 flex-col justify-end p-12 xl:p-20 pb-24 animate-fade-in-up">
          <div className="max-w-2xl">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md mb-4">
              <span className="text-blue-300 font-semibold tracking-wide text-xs uppercase">Admin Portal</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white mb-4 leading-tight">
              Drive Your Business <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                With Verified Talent
              </span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed font-light max-w-xl">
              The ultimate platform for seamless driver recruitment, real-time background checks, and fleet management optimization.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 mt-6">
              {['Secure Verification', 'Real-time Tracking', 'Fleet Analytics'].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-white/80 bg-white/5 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                  <span className="material-icons-outlined text-blue-400 text-sm">check_circle</span>
                  <span className="text-xs font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Glassmorphic Login Panel */}
        <div className="w-full lg:w-[450px] xl:w-[500px] flex flex-col justify-center px-8 sm:px-12 py-10 
          bg-white/90 backdrop-blur-xl border-l border-white/40 shadow-[-20px_0_40px_rgba(0,0,0,0.1)] relative animate-slide-in">

          <div className="w-full max-w-xs mx-auto">
            {/* Logo & Header */}
            <div className="text-center mb-8">
              <div className="inline-flex justify-center mb-6 relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                <img
                  src={Logo}
                  alt="Search My Driver"
                  className="h-32 w-auto object-contain relative z-10 drop-shadow-md hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Welcome Back</h2>
              <p className="text-gray-500 font-medium text-sm">Sign in to manage your drivers</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50/90 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded flex items-start animate-shake shadow-sm backdrop-blur-sm">
                  <span className="material-icons-outlined mr-2 text-red-500 text-lg">error_outline</span>
                  <span className="font-medium text-xs leading-relaxed">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="group">
                  <label htmlFor="email" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                    Email Address
                  </label>
                  <div className="relative transition-all duration-300 focus-within:scale-[1.01]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <span className="material-icons-outlined text-gray-400 text-lg group-focus-within:text-[#2BB673] transition-colors">email</span>
                    </div>
                    <input
                      type="email"
                      id="email"
                      className="block w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2BB673] focus:border-[#2BB673] transition-all duration-200 font-medium text-xs sm:text-sm"
                      placeholder="admin@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="password" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative transition-all duration-300 focus-within:scale-[1.01]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <span className="material-icons-outlined text-gray-400 text-lg group-focus-within:text-[#2BB673] transition-colors">lock</span>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="block w-full pl-9 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2BB673] focus:border-[#2BB673] transition-all duration-200 font-medium text-xs sm:text-sm"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-gray-400 hover:text-[#2BB673] transition-colors focus:outline-none z-10"
                    >
                      <span className="material-icons-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-[#2BB673] hover:text-[#239960] transition-colors hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3 px-4 border border-transparent rounded-lg shadow-md hover:shadow-lg text-sm font-bold text-white bg-gradient-to-r from-[#2BB673] to-[#1e8553] hover:from-[#1e8553] hover:to-[#16633d] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#2BB673] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <span className="material-icons-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-gray-400 text-[10px] mt-8 font-medium">
              © 2024 Search My Driver. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
