import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { authService } from '../../services/authService';

const Layout = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadAdmin = async () => {
      const adminData = authService.getCurrentUser();
      if (adminData) {
        setAdmin(adminData);
        setLoading(false);
      } else {
        // If token decode fails, try to get from API
        try {
          const response = await authService.getCurrentAdmin();
          if (response.success && response.data?.admin) {
            setAdmin(response.data.admin);
          } else {
            setAdmin({ name: 'Admin', email: 'admin@example.com' });
          }
        } catch {
          setAdmin({ name: 'Admin', email: 'admin@example.com' });
        } finally {
          setLoading(false);
        }
      }
    };
    loadAdmin();
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        const menuButton = document.getElementById('menu-button');
        if (sidebar && !sidebar.contains(e.target) && menuButton && !menuButton.contains(e.target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen w-full lg:w-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-30 animate-fade-in">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              id="menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors mr-3"
              aria-label="Toggle menu"
            >
              <span className="material-icons-outlined text-2xl">
                {sidebarOpen ? 'close' : 'menu'}
              </span>
            </button>

            <div className="flex-1 animate-slide-in">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                Admin Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium hidden sm:block">
                Welcome back, {admin?.name || 'Admin'}
              </p>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-gray-50 to-white px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg text-sm sm:text-base">
                  {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500 font-medium truncate max-w-[150px]">
                    {admin?.email || 'admin@example.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
