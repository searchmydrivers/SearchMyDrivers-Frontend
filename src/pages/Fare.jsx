import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { getFareSettings, updateFareSettings } from '../services/fareService';

const Fare = () => {
  const [fareSettings, setFareSettings] = useState({
    basePrice: 300,
    perKmRate: 10,
    perMinuteRate: 2,
    waitingTimePerMinute: 5,
    nightCharge: 150,
    adminCommissionPercentage: 10,
    nightStartHour: 22,
    nightEndHour: 6,
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch fare settings on component mount
  useEffect(() => {
    fetchFareSettings();
  }, []);

  const fetchFareSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getFareSettings('onstation');
      if (response.success && response.data.fare) {
        const fare = response.data.fare;
        setFareSettings({
          basePrice: fare.basePrice || 300,
          perKmRate: fare.perKmRate || 10,
          perMinuteRate: fare.perMinuteRate || 2,
          waitingTimePerMinute: fare.waitingTimePerMinute || 5,
          nightCharge: fare.nightCharge || 150,
          adminCommissionPercentage: fare.adminCommissionPercentage || 10,
          nightStartHour: fare.nightStartHour || 22,
          nightEndHour: fare.nightEndHour || 6,
        });
      }
    } catch (error) {
      console.error('Error fetching fare settings:', error);
      setError(error.response?.data?.message || 'Failed to load fare settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await updateFareSettings('onstation', {
        basePrice: fareSettings.basePrice,
        perKmRate: fareSettings.perKmRate,
        perMinuteRate: fareSettings.perMinuteRate,
        waitingTimePerMinute: fareSettings.waitingTimePerMinute,
        nightCharge: fareSettings.nightCharge,
        nightStartHour: fareSettings.nightStartHour,
        nightEndHour: fareSettings.nightEndHour,
        adminCommissionPercentage: fareSettings.adminCommissionPercentage,
      });

      if (response.success) {
        setSuccess('Fare settings updated successfully!');
        setEditing(false);
        // Refresh fare settings
        await fetchFareSettings();
      } else {
        setError(response.message || 'Failed to update fare settings');
      }
    } catch (error) {
      console.error('Error updating fare settings:', error);
      setError(error.response?.data?.message || 'Failed to update fare settings');
    } finally {
      setSaving(false);
    }
  };

  // Convert hour (0-23) to time string (HH:MM)
  const hourToTimeString = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Convert time string (HH:MM) to hour (0-23)
  const timeStringToHour = (timeString) => {
    return parseInt(timeString.split(':')[0], 10);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Fare - Onstation</h1>
            <p className="text-gray-500 mt-1">Configure trip fare and commission settings for Onstation module</p>
          </div>
          {!editing && (
            <button
              onClick={() => {
                setEditing(true);
                setError('');
                setSuccess('');
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg font-semibold flex items-center space-x-2"
            >
              <span className="material-icons-outlined">edit</span>
              <span>Edit Settings</span>
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center animate-slide-in">
            <span className="material-icons-outlined mr-2 text-red-500">error</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center animate-slide-in">
            <span className="material-icons-outlined mr-2 text-green-500">check_circle</span>
            <span className="font-medium">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fare Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Fare Settings</h2>
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    value={fareSettings.basePrice}
                    onChange={(e) =>
                      setFareSettings({ ...fareSettings, basePrice: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per Kilometer Rate (₹)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={fareSettings.perKmRate}
                    onChange={(e) =>
                      setFareSettings({ ...fareSettings, perKmRate: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per Minute Rate (₹)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={fareSettings.perMinuteRate}
                    onChange={(e) =>
                      setFareSettings({ ...fareSettings, perMinuteRate: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waiting Time Rate (₹/min)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={fareSettings.waitingTimePerMinute}
                    onChange={(e) =>
                      setFareSettings({ ...fareSettings, waitingTimePerMinute: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Rate charged per minute for waiting time
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Night Charges (₹)
                  </label>
                  <input
                    type="number"
                    value={fareSettings.nightCharge}
                    onChange={(e) =>
                      setFareSettings({ ...fareSettings, nightCharge: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Fixed charge applied during night hours
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Night Start Hour (0-23)
                    </label>
                    <input
                      type="number"
                      value={fareSettings.nightStartHour}
                      onChange={(e) =>
                        setFareSettings({ ...fareSettings, nightStartHour: parseInt(e.target.value, 10) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                      max="23"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {hourToTimeString(fareSettings.nightStartHour)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Night End Hour (0-23)
                    </label>
                    <input
                      type="number"
                      value={fareSettings.nightEndHour}
                      onChange={(e) =>
                        setFareSettings({ ...fareSettings, nightEndHour: parseInt(e.target.value, 10) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                      max="23"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {hourToTimeString(fareSettings.nightEndHour)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-icons-outlined">save</span>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setError('');
                      setSuccess('');
                      fetchFareSettings(); // Reset to original values
                    }}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-semibold text-gray-800">₹{fareSettings.basePrice}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Per Kilometer Rate</span>
                  <span className="font-semibold text-gray-800">₹{fareSettings.perKmRate}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Per Minute Rate</span>
                  <span className="font-semibold text-gray-800">₹{fareSettings.perMinuteRate}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Waiting Time Rate</span>
                  <span className="font-semibold text-gray-800">₹{fareSettings.waitingTimePerMinute}/min</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Night Charges</span>
                  <span className="font-semibold text-gray-800">₹{fareSettings.nightCharge}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Night Time</span>
                  <span className="font-semibold text-gray-800">
                    {hourToTimeString(fareSettings.nightStartHour)} - {hourToTimeString(fareSettings.nightEndHour)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Commission Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Commission Settings</h2>
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={fareSettings.adminCommissionPercentage}
                    onChange={(e) =>
                      setFareSettings({ ...fareSettings, adminCommissionPercentage: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Commission percentage deducted from each trip
                  </p>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Example Calculation:</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    For a trip with ₹500 total fare and {fareSettings.adminCommissionPercentage}% commission:
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-2">
                    Admin Commission: ₹{(500 * fareSettings.adminCommissionPercentage) / 100}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    Driver Earnings: ₹{500 - (500 * fareSettings.adminCommissionPercentage) / 100}
                  </p>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Admin Commission</span>
                  <span className="font-semibold text-gray-800">{fareSettings.adminCommissionPercentage}%</span>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Commission Calculation:</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    {fareSettings.adminCommissionPercentage}% of total trip fare is deducted as admin commission.
                    Remaining amount is credited to driver's wallet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Fare;

