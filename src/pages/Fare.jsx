import { useState } from 'react';
import Layout from '../components/Layout/Layout';

const Fare = () => {
  const [fareSettings, setFareSettings] = useState({
    basePrice: 300,
    perKmRate: 5,
    perMinuteRate: 2,
    waitingTimeRate: 1,
    nightCharges: 150,
    adminCommission: 10,
    nightStartTime: '22:00',
    nightEndTime: '06:00',
  });

  const [editing, setEditing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save fare settings API call here
    alert('Fare settings updated successfully!');
    setEditing(false);
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Fare</h1>
            <p className="text-gray-500 mt-1">Configure trip fare and commission settings</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg font-medium"
            >
              Edit Settings
            </button>
          )}
        </div>

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
                    value={fareSettings.waitingTimeRate}
                    onChange={(e) =>
                      setFareSettings({ ...fareSettings, waitingTimeRate: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Night Charges (₹)
                  </label>
                  <input
                    type="number"
                    value={fareSettings.nightCharges}
                    onChange={(e) =>
                      setFareSettings({ ...fareSettings, nightCharges: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Night Start Time
                    </label>
                    <input
                      type="time"
                      value={fareSettings.nightStartTime}
                      onChange={(e) =>
                        setFareSettings({ ...fareSettings, nightStartTime: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Night End Time
                    </label>
                    <input
                      type="time"
                      value={fareSettings.nightEndTime}
                      onChange={(e) =>
                        setFareSettings({ ...fareSettings, nightEndTime: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
                  <span className="font-semibold text-gray-800">₹{fareSettings.waitingTimeRate}/min</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Night Charges</span>
                  <span className="font-semibold text-gray-800">₹{fareSettings.nightCharges}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Night Time</span>
                  <span className="font-semibold text-gray-800">
                    {fareSettings.nightStartTime} - {fareSettings.nightEndTime}
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
                    value={fareSettings.adminCommission}
                    onChange={(e) =>
                      setFareSettings({ ...fareSettings, adminCommission: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
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
                    For a trip with ₹500 total fare and {fareSettings.adminCommission}% commission:
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-2">
                    Admin Commission: ₹{(500 * fareSettings.adminCommission) / 100}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    Driver Earnings: ₹{500 - (500 * fareSettings.adminCommission) / 100}
                  </p>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Admin Commission</span>
                  <span className="font-semibold text-gray-800">{fareSettings.adminCommission}%</span>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Commission Calculation:</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    {fareSettings.adminCommission}% of total trip fare is deducted as admin commission.
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

