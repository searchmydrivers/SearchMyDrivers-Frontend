import { Link, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', iconType: 'outlined' },
    { path: '/users', label: 'Users', icon: 'people', iconType: 'outlined' },
    { path: '/drivers', label: 'Drivers', icon: 'local_taxi', iconType: 'outlined' },
    { path: '/content', label: 'Content Management', icon: 'description', iconType: 'outlined' },
    { path: '/trip-bookings', label: 'Manage Trip Bookings', icon: 'route', iconType: 'outlined' },
    { path: '/banners', label: 'Manage Banners', icon: 'image', iconType: 'outlined' },
    { path: '/admin-profile', label: 'Admin Profile', icon: 'account_circle', iconType: 'outlined' },
    { path: '/notifications', label: 'Notification', icon: 'notifications', iconType: 'outlined' },
    { path: '/fare', label: 'Manage Fare', icon: 'payments', iconType: 'outlined' },
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
    <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen fixed left-0 top-0 shadow-2xl z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700/50 animate-fade-in">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
            <span className="text-white font-bold text-lg">SD</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Search My Drivers</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3 space-y-1 overflow-y-auto h-[calc(100vh-200px)]">
        {menuItems.map((item, index) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center px-4 py-3 mb-1 rounded-xl transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:translate-x-1'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className={`${getIconClass(item.iconType)} mr-3 text-xl ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm tracking-wide">{item.label}</span>
              {active && (
                <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse-slow"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium transform hover:scale-105 active:scale-95"
        >
          <span className="material-icons-outlined mr-2 text-lg">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
