import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { authService } from '../../services/authService';

const Layout = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar />
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-40 animate-fade-in">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="animate-slide-in">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Admin Dashboard</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Welcome back, {admin?.name || 'Admin'}</p>
            </div>
            <div className="flex items-center space-x-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-white px-4 py-2.5 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500 font-medium">{admin?.email || 'admin@example.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
