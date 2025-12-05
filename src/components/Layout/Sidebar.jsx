import { Link, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const isSubAdmin = adminData.adminType === 'subadmin';

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', section: 'main' },
    { path: '/users', label: 'Users', icon: 'people', section: 'main' },
    { path: '/drivers', label: 'Drivers', icon: 'local_taxi', section: 'main' },
    { path: '/trip-bookings', label: 'Trip Bookings', icon: 'route', section: 'main' },
    { path: '/transactions', label: 'Transactions', icon: 'receipt_long', section: 'main' },
    { path: '/content', label: 'Content', icon: 'description', section: 'management' },
    { path: '/banners', label: 'Banners', icon: 'image', section: 'management' },
    { path: '/notifications', label: 'Notifications', icon: 'notifications', section: 'management' },
    { path: '/admin-profile', label: 'Profile', icon: 'account_circle', section: 'settings' },
    ...(isSubAdmin ? [] : [
      { path: '/fare', label: 'Fare Management', icon: 'payments', section: 'management' },
      { path: '/subadmins', label: 'Sub-Admins', icon: 'admin_panel_settings', section: 'settings' },
    ]),
  ];

  const isActive = (path) => {
    if (path === '/drivers') {
      return location.pathname.startsWith('/drivers') && 
             !location.pathname.includes('/drivers/pending') && 
             !location.pathname.includes('/drivers/verified') && 
             !location.pathname.includes('/drivers/rejected');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      authService.logout();
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const groupedMenuItems = {
    main: menuItems.filter(item => item.section === 'main'),
    management: menuItems.filter(item => item.section === 'management'),
    settings: menuItems.filter(item => item.section === 'settings'),
  };

  return (
    <>
      <div
        id="sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-xl
          transform transition-transform duration-300 ease-in-out
          lg:fixed lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-blue-600 font-bold text-lg">SD</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Search My Drivers</h1>
              <p className="text-xs text-blue-100 mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {/* Main Section */}
          <div className="mb-6">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main</p>
            <div className="space-y-1">
              {groupedMenuItems.main.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`material-icons-outlined mr-3 text-xl ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                      {item.icon}
                    </span>
                    <span className={`font-medium text-sm ${active ? 'font-semibold' : ''}`}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Management Section */}
          {groupedMenuItems.management.length > 0 && (
            <div className="mb-6">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Management</p>
              <div className="space-y-1">
                {groupedMenuItems.management.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`material-icons-outlined mr-3 text-xl ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                        {item.icon}
                      </span>
                      <span className={`font-medium text-sm ${active ? 'font-semibold' : ''}`}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Settings Section */}
          {groupedMenuItems.settings.length > 0 && (
            <div>
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Settings</p>
              <div className="space-y-1">
                {groupedMenuItems.settings.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`material-icons-outlined mr-3 text-xl ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                        {item.icon}
                      </span>
                      <span className={`font-medium text-sm ${active ? 'font-semibold' : ''}`}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm shadow-sm"
          >
            <span className="material-icons-outlined mr-2 text-lg">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
