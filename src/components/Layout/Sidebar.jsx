import { Link, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/drivers', label: 'All Drivers', icon: '👥' },
    { path: '/drivers/pending', label: 'Pending Verification', icon: '⏳' },
    { path: '/drivers/verified', label: 'Verified Drivers', icon: '✅' },
    { path: '/drivers/rejected', label: 'Rejected Drivers', icon: '❌' },
    { path: '/trips', label: 'All Trips', icon: '🚗' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary-600">Search My Drivers</h1>
        <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
              isActive(item.path) ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : ''
            }`}
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-6 border-t">
        <button
          onClick={() => authService.logout()}
          className="w-full btn-danger flex items-center justify-center"
        >
          <span className="mr-2">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

