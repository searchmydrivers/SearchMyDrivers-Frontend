import { useState } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const Notifications = () => {
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'all', // all, users, drivers
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      } else {
        setError(response.data.message || 'Failed to send notification');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Notifications</h1>
            <p className="text-sm sm:text-base text-gray-500">Send push notifications to users and drivers</p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setError('');
              setSuccess('');
            }}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <span className="material-icons-outlined text-lg sm:text-xl">send</span>
            <span>Send Notification</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center animate-slide-in">
            <span className="material-icons-outlined mr-2 text-red-500">error</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6 animate-slide-in">
            <div className="flex items-start">
              <span className="material-icons-outlined mr-2 text-green-500 mt-0.5">check_circle</span>
              <div className="flex-1">
                <p className="font-medium mb-2">Notification sent successfully!</p>
                <pre className="text-sm whitespace-pre-wrap font-mono bg-green-100 p-3 rounded-lg overflow-x-auto">
                  {success}
                </pre>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="material-icons-outlined text-blue-600 text-3xl sm:text-4xl">notifications</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Send Push Notifications</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
            Send notifications to all users, all drivers, or both. Only users/drivers with FCM tokens will receive notifications.
          </p>
          <button
            onClick={() => {
              setShowModal(true);
              setError('');
              setSuccess('');
            }}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg font-semibold flex items-center justify-center space-x-2 mx-auto text-sm sm:text-base"
          >
            <span className="material-icons-outlined text-lg sm:text-xl">send</span>
            <span>Send Notification</span>
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
            <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Send Notification</h2>
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
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 btn-primary"
                  >
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
