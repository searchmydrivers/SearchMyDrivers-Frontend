import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { authService } from '../../services/authService';
import api from '../../config/api';

const Layout = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadAdmin = async () => {
      const adminData = authService.getCurrentUser();
      if (adminData) {
        setAdmin(adminData);
        setLoading(false);
      } else {
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

  useEffect(() => {
    if (admin) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [admin]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/admins/notifications', {
        params: { limit: 5, unreadOnly: false },
      });
      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
        setUnreadCount(response.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
    setShowNotificationDropdown(false);
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await api.put(`/admins/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        const menuButton = document.getElementById('menu-button');
        if (sidebar && !sidebar.contains(e.target) && menuButton && !menuButton.contains(e.target)) {
          setSidebarOpen(false);
        }
      }
      // Close notification dropdown when clicking outside
      if (showNotificationDropdown) {
        const notificationButton = document.getElementById('notification-button');
        const notificationDropdown = document.getElementById('notification-dropdown');
        if (
          notificationButton &&
          !notificationButton.contains(e.target) &&
          notificationDropdown &&
          !notificationDropdown.contains(e.target)
        ) {
          setShowNotificationDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, showNotificationDropdown]);

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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Get breadcrumbs and page title based on current route
  const getPageInfo = () => {
    const pathname = location.pathname;
    
    // Route mapping for breadcrumbs and titles
    const routeMap = {
      '/dashboard': {
        breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Overview' }],
        title: 'Admin Control Panel',
      },
      '/users': {
        breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Users' }],
        title: 'Users',
      },
      '/drivers': {
        breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Drivers' }],
        title: 'Drivers',
      },
      '/trip-bookings': {
        breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Trip Bookings' }],
        title: 'Trip Bookings',
      },
      '/transactions': {
        breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Transactions' }],
        title: 'Transactions',
      },
      '/content': {
        breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Content' }],
        title: 'Content Management',
      },
      '/banners': {
        breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Banners' }],
        title: 'Banner Management',
      },
      '/notifications': {
        breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Notifications' }],
        title: 'Notifications',
      },
      '/fare': {
        breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Fare Management' }],
        title: 'Fare Management',
      },
      '/subadmins': {
        breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Sub-Admins' }],
        title: 'Sub-Admins',
      },
      '/admin-profile': {
        breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Profile' }],
        title: 'Admin Profile',
      },
    };

    // Check for nested routes
    if (pathname.startsWith('/drivers/') && pathname !== '/drivers') {
      const driverId = pathname.split('/drivers/')[1];
      if (driverId && driverId !== 'pending' && driverId !== 'verified' && driverId !== 'rejected') {
        return {
          breadcrumbs: [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Drivers', path: '/drivers' },
            { label: 'Driver Details' },
          ],
          title: 'Driver Details',
        };
      }
    }

    if (pathname.startsWith('/trip-bookings/') && pathname !== '/trip-bookings') {
      return {
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Trip Bookings', path: '/trip-bookings' },
          { label: 'Trip Details' },
        ],
        title: 'Trip Details',
      };
    }

    if (pathname.startsWith('/users/') && pathname !== '/users') {
      return {
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Users', path: '/users' },
          { label: 'User Details' },
        ],
        title: 'User Details',
      };
    }

    // Return default or matched route
    return routeMap[pathname] || {
      breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Overview' }],
      title: 'Admin Control Panel',
    };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full lg:w-auto">
        {/* Professional Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
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

            {/* Breadcrumb & Title */}
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-x-2 text-sm text-gray-500 mb-1">
                {pageInfo.breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-x-2">
                    {index > 0 && <span className="material-icons-outlined text-xs text-gray-400">chevron_right</span>}
                    {crumb.path ? (
                      <button
                        onClick={() => navigate(crumb.path)}
                        className="hover:text-gray-900 transition-colors"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className={index === pageInfo.breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                        {crumb.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {pageInfo.title}
              </h2>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  id="notification-button"
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="material-icons-outlined">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotificationDropdown && (
                  <div
                    id="notification-dropdown"
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <span className="material-icons-outlined text-gray-300 text-5xl mb-2 block">notifications_none</span>
                          <p className="text-gray-500 text-sm">No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => handleNotificationClick()}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold text-sm text-gray-900 truncate">{notification.title}</h4>
                                  {!notification.isRead && (
                                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2">{notification.message}</p>
                                <p className="text-xs text-gray-400">{formatTime(notification.createdAt)}</p>
                              </div>
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => handleMarkAsRead(notification._id, e)}
                                  className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Mark as read"
                                >
                                  <span className="material-icons-outlined text-sm">check_circle</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                      <button
                        onClick={handleNotificationClick}
                        className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium text-center"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="material-icons-outlined">settings</span>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{admin?.email || 'admin@example.com'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-md">
                  {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
