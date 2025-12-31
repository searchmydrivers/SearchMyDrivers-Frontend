import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { authService } from '../../services/authService';
import api from '../../config/api';
import { requestForToken, onMessageListener } from '../../config/firebase';
import { toast, Toaster } from 'react-hot-toast';
import SOSAlertSystem from './SOSAlertSystem';
import { socketService } from '../../services/socketService';

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
    // Request FCM Token
    const initFirebase = async () => {
      const token = await requestForToken();
      if (token) {
        // Save to backend
        try {
          await api.put('/admins/profile', { fcmToken: token });
        } catch (err) {
          console.error('Failed to update FCM token', err);
        }
      }
    };
    initFirebase();

    // Foreground Listener
    onMessageListener().then(payload => {
      setUnreadCount(prev => prev + 1);
      fetchNotifications();
      toast((t) => (
        <span onClick={() => {
          if (payload.data?.type === 'sos-alert' && payload.data?.tripId) {
            navigate(`/trip-bookings/${payload.data.tripId}`);
          } else {
            navigate('/notifications');
          }
        }}>
          <b>{payload.notification.title}</b>
          <br />
          {payload.notification.body}
        </span>
      ), { duration: 5000 });
    }).catch(err => console.log('failed: ', err));

    const loadAdmin = async () => {
      // ... existing loadAdmin logic ...
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
      if (admin._id || admin.id) {
        console.log('🔌 [Layout] Connecting socket with admin data:', admin);
        socketService.connect(admin || {});
      } else {
        console.warn('⚠️ [Layout] Admin object loaded but MISSING ID. Socket will not function correctly for private events.', admin);
        // Still connect to receive public 'admins' room events if possible? 
        // socketService.connect requires ID to join private room.
      }

      fetchNotifications();
      // Poll for new notifications every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => {
        clearInterval(interval);
        socketService.disconnect();
      };
    }
  }, [admin]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/admins/notifications', {
        params: { limit: 10, unreadOnly: 'true' },
      });
      if (response.data.success) {
        // We only show unread in the dropdown as queue
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

  const toggleNotificationDropdown = async () => {
    const newState = !showNotificationDropdown;
    setShowNotificationDropdown(newState);

    if (newState) {
      // Mark top 3 as read if they are unread
      const unreadToMark = notifications.filter(n => !n.isRead).slice(0, 3);
      if (unreadToMark.length > 0) {
        try {
          Promise.all(unreadToMark.map(n => api.put(`/admins/notifications/${n._id}/read`))).catch(console.error);

          const updatedNotifications = notifications.map(n => {
            if (unreadToMark.find(u => u._id === n._id)) {
              return { ...n, isRead: true };
            }
            return n;
          });
          setNotifications(updatedNotifications);
          setUnreadCount(Math.max(0, unreadCount - unreadToMark.length));
        } catch (error) {
          console.error('Error marking notifications as read', error);
        }
      }
    }
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

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initialize on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);

  useEffect(() => {
    // Only lock body scroll on mobile when sidebar is open
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
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
      '/settings': {
        breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Settings' }],
        title: 'Settings',
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
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Toaster position="top-right" />
      <SOSAlertSystem />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300">
        {/* Professional Header */}
        <header className="bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-b border-gray-100 sticky top-0 z-30">
          <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              id="menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100/80 transition-all mr-3"
              aria-label="Toggle menu"
            >
              <span className="material-icons-outlined text-2xl">
                {sidebarOpen ? 'close' : 'menu'}
              </span>
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 rounded-xl text-gray-500 hover:bg-gray-100/80 hover:text-[#2BB673] transition-all mr-3 items-center justify-center"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <span className={`material-icons-outlined text-2xl transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
                menu_open
              </span>
            </button>

            {/* Breadcrumb & Title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-x-2 text-sm text-gray-500 mb-1 font-medium">
                {pageInfo.breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-x-2">
                    {index > 0 && <span className="material-icons-outlined text-xs text-gray-400">chevron_right</span>}
                    {crumb.path ? (
                      <button
                        onClick={() => navigate(crumb.path)}
                        className="hover:text-[#2BB673] transition-colors duration-200"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className={index === pageInfo.breadcrumbs.length - 1 ? 'text-[#0B2C4D] font-semibold' : ''}>
                        {crumb.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-[#0B2C4D] tracking-tight truncate">
                {pageInfo.title}
              </h2>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 pl-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  id="notification-button"
                  onClick={toggleNotificationDropdown}
                  className="relative w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#2BB673] hover:bg-[#2BB673]/5 rounded-xl transition-all duration-200 group"
                >
                  <span className="material-icons-outlined text-2xl group-hover:scale-110 transition-transform duration-200">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ring-1 ring-red-500/20 shadow-sm"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotificationDropdown && (
                  <div
                    id="notification-dropdown"
                    className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 z-50 max-h-[32rem] overflow-hidden animation-fade-in-down"
                  >
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                      <h3 className="font-bold text-[#0B2C4D]">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-[#2BB673]/10 text-[#2BB673] px-2.5 py-1 rounded-full font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-icons-outlined text-gray-300 text-3xl">notifications_none</span>
                          </div>
                          <h4 className="text-gray-900 font-medium mb-1">No notifications</h4>
                          <p className="text-gray-500 text-sm">You are all caught up!</p>
                        </div>
                      ) : (
                        notifications.slice(0, 3).map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => handleNotificationClick()}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50/80 cursor-pointer transition-colors ${!notification.isRead ? 'bg-[#2BB673]/5' : ''
                              }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1.5">
                                  <h4 className={`text-sm truncate ${!notification.isRead ? 'font-bold text-[#0B2C4D]' : 'font-medium text-gray-700'}`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.isRead && (
                                    <span className="w-2 h-2 bg-[#2BB673] rounded-full flex-shrink-0 shadow-sm shadow-[#2BB673]/50"></span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">{notification.message}</p>
                                <p className="text-xs text-gray-400 font-medium">{formatTime(notification.createdAt)}</p>
                              </div>
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => handleMarkAsRead(notification._id, e)}
                                  className="p-1.5 text-gray-400 hover:text-[#2BB673] hover:bg-[#2BB673]/10 rounded-full transition-all"
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
                    <div className="p-3 border-t border-gray-50 bg-gray-50/50">
                      <button
                        onClick={handleNotificationClick}
                        className="w-full text-sm text-[#0B2C4D] hover:text-[#2BB673] font-semibold text-center py-2 hover:bg-white rounded-lg transition-all shadow-sm"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button
                onClick={() => navigate('/settings')}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#0B2C4D] hover:bg-[#0B2C4D]/5 rounded-xl transition-all duration-200"
              >
                <span className="material-icons-outlined text-2xl hover:rotate-90 transition-transform duration-500">settings</span>
              </button>

              <div className="h-8 w-px bg-gray-200 mx-2 lg:mx-3"></div>

              {/* User Profile */}
              <div
                onClick={() => navigate('/admin-profile')}
                className="flex items-center gap-3 pl-1 cursor-pointer group rounded-xl p-1 hover:bg-gray-50 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-[#0B2C4D] group-hover:text-[#2BB673] transition-colors">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500 font-medium">{admin?.email || 'admin@example.com'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-[#0B2C4D] to-[#254f7a] rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-[#0B2C4D]/20 ring-2 ring-white group-hover:scale-105 transition-transform duration-200 overflow-hidden">
                  {admin?.profileImage ? (
                    <img src={admin.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">{admin?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
