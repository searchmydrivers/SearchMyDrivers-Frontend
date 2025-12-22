import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const Notifications = () => {
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'all',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admins/notifications', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
        setUnreadCount(response.data.data.unreadCount || 0);
        setPagination({
          page: response.data.data.pagination?.page || 1,
          totalPages: response.data.data.pagination?.totalPages || 1,
          total: response.data.data.pagination?.total || 0,
          limit: response.data.data.pagination?.limit || 20,
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/admins/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/admins/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/admins/notifications/send', formData);
      if (response.data.success) {
        const data = response.data.data;
        let successMessage = `Notification sent successfully!\n\n`;
        successMessage += `📊 Summary:\n`;
        successMessage += `• Total Users Found: ${data.totalUsers}\n`;
        successMessage += `• Users Sent: ${data.usersSent || 0}\n`;
        successMessage += `• Users Failed: ${data.usersFailed || 0}\n`;
        successMessage += `• Total Drivers Found: ${data.totalDrivers}\n`;
        successMessage += `• Drivers Sent: ${data.driversSent || 0}\n`;
        successMessage += `• Drivers Failed: ${data.driversFailed || 0}\n`;
        successMessage += `• Total Sent: ${data.totalSent}\n`;
        successMessage += `• Total Failed: ${data.totalFailed}`;

        setSuccess(successMessage);
        setFormData({ title: '', message: '', target: 'all' });
        setShowModal(false);
        fetchNotifications();
      } else {
        setError(response.data.message || 'Failed to send notification');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'new-driver-registration': 'person_add',
      'trip-request': 'route',
      'payment-received': 'payments',
      'driver-verification': 'verified',
      'system-alert': 'warning',
      'admin-notification': 'admin_panel_settings',
      'other': 'notifications',
    };
    return icons[type] || 'notifications';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'new-driver-registration': 'bg-blue-100 text-blue-700',
      'trip-request': 'bg-purple-100 text-purple-700',
      'payment-received': 'bg-green-100 text-green-700',
      'driver-verification': 'bg-amber-100 text-amber-700',
      'system-alert': 'bg-red-100 text-red-700',
      'admin-notification': 'bg-indigo-100 text-indigo-700',
      'other': 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Mark All as Read
              </button>
            )}
            <button
              onClick={() => {
                setShowModal(true);
                setError('');
                setSuccess('');
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded-lg hover:from-[#091E3A] hover:to-[#1a3a5a] transition-colors text-sm font-medium flex items-center space-x-2"
            >
              <span className="material-icons-outlined text-lg">send</span>
              <span>Send Notification</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center animate-fade-in">
            <span className="material-icons-outlined mr-2">error_outline</span>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-fade-in">
            <div className="flex items-start">
              <span className="material-icons-outlined mr-2 mt-0.5">check_circle</span>
              <div className="flex-1">
                <p className="font-medium mb-2">Notification sent successfully!</p>
                <pre className="text-sm whitespace-pre-wrap font-mono bg-green-100 p-3 rounded-lg overflow-x-auto">
                  {success}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="material-icons-outlined text-xl mr-2 text-[#0B2C4D]">notifications</span>
                All Notifications {unreadCount > 0 && <span className="text-sm font-normal text-gray-500 ml-2">({unreadCount} unread)</span>}
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#0B2C4D] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-gray-500 font-medium">Loading notifications...</div>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons-outlined text-6xl text-gray-300 mb-4 block">notifications_none</span>
              <p className="text-gray-500 font-medium">No notifications found</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {notifications.map((notification, index) => (
                  <div
                    key={notification._id}
                    className={`p-6 hover:bg-gray-50 transition-colors duration-200 animate-fade-in ${!notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        <span className="material-icons-outlined">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-base font-semibold text-gray-900">{notification.title}</h3>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-[#0B2C4D] rounded-full"></span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getNotificationColor(
                                  notification.type
                                )}`}
                              >
                                {notification.type.replace(/-/g, ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <p className="text-xs text-gray-400">{formatDate(notification.createdAt)}</p>
                          </div>
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="ml-4 p-2 text-gray-400 hover:text-[#0B2C4D] transition-colors"
                              title="Mark as read"
                            >
                              <span className="material-icons-outlined">check_circle</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notifications
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className={`px-3 py-2 rounded-lg font-medium text-sm ${pagination.page === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm text-gray-700">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className={`px-3 py-2 rounded-lg font-medium text-sm ${pagination.page === pagination.totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Send Notification Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Send Notification</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="label">Target Audience</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="all">All (Users + Drivers)</option>
                    <option value="users">Users Only</option>
                    <option value="drivers">Drivers Only</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="label">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="Enter notification title"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="mb-4">
                  <label className="label">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input-field h-32 resize-none"
                    placeholder="Enter notification message"
                    required
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500 characters</p>
                </div>
                <div className="flex space-x-3">
                  <button type="submit" disabled={actionLoading} className="flex-1 btn-primary">
                    {actionLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-icons-outlined mr-2">send</span>
                        <span>Send</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ title: '', message: '', target: 'all' });
                      setError('');
                      setSuccess('');
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
