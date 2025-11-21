import { Link, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  // Get admin data from localStorage
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const isSubAdmin = adminData.adminType === 'subadmin';

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', iconType: 'outlined' },
    { path: '/users', label: 'Users', icon: 'people', iconType: 'outlined' },
    { path: '/drivers', label: 'Drivers', icon: 'local_taxi', iconType: 'outlined' },
    { path: '/trip-bookings', label: 'Manage Trip Bookings', icon: 'route', iconType: 'outlined' },
    { path: '/content', label: 'Content Management', icon: 'description', iconType: 'outlined' },
    { path: '/banners', label: 'Manage Banners', icon: 'image', iconType: 'outlined' },
    { path: '/admin-profile', label: 'Admin Profile', icon: 'account_circle', iconType: 'outlined' },
    { path: '/notifications', label: 'Notification', icon: 'notifications', iconType: 'outlined' },
    // Only show Manage Fare for main admins
    ...(isSubAdmin ? [] : [{ path: '/fare', label: 'Manage Fare', icon: 'payments', iconType: 'outlined' }]),
    // Only show Sub-Admins management for main admins
    ...(isSubAdmin ? [] : [{ path: '/subadmins', label: 'Sub-Admins', icon: 'admin_panel_settings', iconType: 'outlined' }]),
  ];

  const isActive = (path) => {
    if (path === '/drivers') {
      return location.pathname.startsWith('/drivers') && !location.pathname.includes('/drivers/pending') && !location.pathname.includes('/drivers/verified') && !location.pathname.includes('/drivers/rejected');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      authService.logout();
    }
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const getIconClass = (iconType) => {
    switch (iconType) {
      case 'outlined':
        return 'material-icons-outlined';
      case 'round':
        return 'material-icons-round';
      default:
        return 'material-icons';
    }
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        id="sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          lg:fixed lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo Section */}
        <div className="p-4 sm:p-6 border-b border-slate-700/50 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-base sm:text-lg">SD</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Search My Drivers</h1>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-4 sm:mt-6 px-2 sm:px-3 space-y-1 overflow-y-auto h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] lg:h-[calc(100vh-200px)]">
          {menuItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`group flex items-center px-3 sm:px-4 py-2.5 sm:py-3 mb-1 rounded-xl transition-all duration-300 ${active
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:translate-x-1'
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className={`${getIconClass(item.iconType)} mr-2 sm:mr-3 text-lg sm:text-xl ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-xs sm:text-sm tracking-wide">{item.label}</span>
                {active && (
                  <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse-slow"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-3 sm:p-4 border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium transform hover:scale-105 active:scale-95 text-sm sm:text-base"
          >
            <span className="material-icons-outlined mr-2 text-base sm:text-lg">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
