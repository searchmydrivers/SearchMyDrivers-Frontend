import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { getFareSettings, updateFareSettings } from '../services/fareService';

const Fare = () => {
  const [activeModule, setActiveModule] = useState('incity'); // 'incity' or 'outstation'
  const [fareSettings, setFareSettings] = useState({
    basePrice: 300,
    perKmRate: 10,
    perMinuteRate: 2,

    nightCharge: 150,
    adminCommissionPercentage: 10,
    nightStartHour: 22,
    nightEndHour: 6,
    cancellationPenaltyAmount: 50,
    // Outstation specific
    outstationBasePrice24Hrs: 1400,
    outstationNightCharge: 500,
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch fare settings when module changes
  useEffect(() => {
    fetchFareSettings();
  }, [activeModule]);

  const fetchFareSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getFareSettings(activeModule);
      if (response.success && response.data.fare) {
        const fare = response.data.fare;
        setFareSettings({
          basePrice: fare.basePrice || 300,
          perKmRate: fare.perKmRate || 10,
          perMinuteRate: fare.perMinuteRate || 2,

          nightCharge: fare.nightCharge || 150,
          adminCommissionPercentage: fare.adminCommissionPercentage || 10,
          nightStartHour: fare.nightStartHour || 22,
          nightEndHour: fare.nightEndHour || 6,
          cancellationPenaltyAmount: fare.cancellationPenaltyAmount || 50,
          outstationBasePrice24Hrs: fare.outstationBasePrice24Hrs || 1400,
          outstationNightCharge: fare.outstationNightCharge || 500,
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
      const updateData = {
        basePrice: fareSettings.basePrice,
        perKmRate: fareSettings.perKmRate,
        perMinuteRate: fareSettings.perMinuteRate,

        nightCharge: fareSettings.nightCharge,
        nightStartHour: fareSettings.nightStartHour,
        nightEndHour: fareSettings.nightEndHour,
        adminCommissionPercentage: fareSettings.adminCommissionPercentage,
        cancellationPenaltyAmount: fareSettings.cancellationPenaltyAmount,
      };

      // Add outstation-specific fields if module is outstation
      if (activeModule === 'outstation') {
        updateData.outstationBasePrice24Hrs = fareSettings.outstationBasePrice24Hrs;
        updateData.outstationNightCharge = fareSettings.outstationNightCharge;
      }

      const response = await updateFareSettings(activeModule, updateData);

      if (response.success) {
        setSuccess('Fare settings updated successfully!');
        setEditing(false);
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium text-xs">Loading fare settings...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          {/* Module Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setActiveModule('incity');
                setEditing(false);
                setError('');
                setSuccess('');
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center space-x-2 ${activeModule === 'incity'
                ? 'bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
            >
              <span className="material-icons-outlined text-base">location_on</span>
              <span>InCity</span>
            </button>
            <button
              onClick={() => {
                setActiveModule('outstation');
                setEditing(false);
                setError('');
                setSuccess('');
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center space-x-2 ${activeModule === 'outstation'
                ? 'bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
            >
              <span className="material-icons-outlined text-base">flight_takeoff</span>
              <span>Outstation</span>
            </button>
          </div>

          {!editing && (
            <button
              onClick={() => {
                setEditing(true);
                setError('');
                setSuccess('');
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded-lg hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 shadow-md font-semibold flex items-center justify-center space-x-1.5 text-xs sm:text-sm"
            >
              <span className="material-icons-outlined text-base">edit</span>
              <span>Edit Settings</span>
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center animate-fade-in text-xs">
            <span className="material-icons-outlined mr-2 text-sm">error_outline</span>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center animate-fade-in text-xs">
            <span className="material-icons-outlined mr-2 text-sm">check_circle</span>
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Fare Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">attach_money</span>
              Fare Settings - {activeModule === 'incity' ? 'InCity' : 'Outstation'}
            </h2>
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                {activeModule === 'incity' ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Base Price (₹)
                      </label>
                      <input
                        type="number"
                        value={fareSettings.basePrice}
                        onChange={(e) =>
                          setFareSettings({ ...fareSettings, basePrice: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                        required
                      />
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Base price for trips &lt; 2 hours
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Per Kilometer Rate (₹)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={fareSettings.perKmRate}
                        onChange={(e) =>
                          setFareSettings({ ...fareSettings, perKmRate: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                        required
                      />
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Convenience amount for driver
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Base Price for 24 Hours (₹)
                      </label>
                      <input
                        type="number"
                        value={fareSettings.outstationBasePrice24Hrs}
                        onChange={(e) =>
                          setFareSettings({ ...fareSettings, outstationBasePrice24Hrs: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                        required
                      />
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Base price for outstation trips &lt;= 24 hours
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Per Kilometer Rate (₹)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={fareSettings.perKmRate}
                        onChange={(e) =>
                          setFareSettings({ ...fareSettings, perKmRate: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                        required
                      />
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Convenience amount for driver
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Per Minute Rate (₹)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={fareSettings.perMinuteRate}
                    onChange={(e) =>
                      setFareSettings({ ...fareSettings, perMinuteRate: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Rate per minute for trip time calculation
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Rate per minute for trip time calculation
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Night Charges (₹)
                  </label>
                  <input
                    type="number"
                    value={activeModule === 'incity' ? fareSettings.nightCharge : fareSettings.outstationNightCharge}
                    onChange={(e) =>
                      setFareSettings({
                        ...fareSettings,
                        [activeModule === 'incity' ? 'nightCharge' : 'outstationNightCharge']: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                    required
                    min="0"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Fixed charge applied during night hours
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Night Start (0-23)
                    </label>
                    <input
                      type="number"
                      value={fareSettings.nightStartHour}
                      onChange={(e) =>
                        setFareSettings({ ...fareSettings, nightStartHour: parseInt(e.target.value, 10) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                      required
                      min="0"
                      max="23"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Current: {hourToTimeString(fareSettings.nightStartHour)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Night End (0-23)
                    </label>
                    <input
                      type="number"
                      value={fareSettings.nightEndHour}
                      onChange={(e) =>
                        setFareSettings({ ...fareSettings, nightEndHour: parseInt(e.target.value, 10) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                      required
                      min="0"
                      max="23"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Current: {hourToTimeString(fareSettings.nightEndHour)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Cancellation Penalty (₹)
                  </label>
                  <input
                    type="number"
                    value={fareSettings.cancellationPenaltyAmount}
                    onChange={(e) =>
                      setFareSettings({ ...fareSettings, cancellationPenaltyAmount: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                    required
                    min="0"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Penalty charged when trip is cancelled less than 30 minutes before scheduled time
                  </p>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5 text-xs"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-icons-outlined text-sm">save</span>
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
                      fetchFareSettings();
                    }}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {activeModule === 'incity' ? (
                  <>
                    <div className="py-2.5 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Base Price</span>
                        <span className="font-bold text-gray-800 text-sm">₹{fareSettings.basePrice}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Base price for trips &lt; 2 hours
                      </p>
                    </div>
                    <div className="py-2.5 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Per Kilometer Rate</span>
                        <span className="font-bold text-gray-800 text-sm">₹{fareSettings.perKmRate}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Convenience amount for driver
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="py-2.5 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Base Price (24 Hours)</span>
                        <span className="font-bold text-gray-800 text-sm">₹{fareSettings.outstationBasePrice24Hrs}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Base price for outstation trips &lt;= 24 hours
                      </p>
                    </div>
                    <div className="py-2.5 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Per Kilometer Rate</span>
                        <span className="font-bold text-gray-800 text-sm">₹{fareSettings.perKmRate}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Convenience amount for driver
                      </p>
                    </div>
                  </>
                )}
                <div className="py-2.5 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Per Minute Rate</span>
                    <span className="font-bold text-gray-800 text-sm">₹{fareSettings.perMinuteRate}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Rate per minute for trip time calculation
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Rate per minute for trip time calculation
                  </p>
                </div>

                <div className="py-2.5 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Night Charges</span>
                    <span className="font-bold text-gray-800 text-sm">
                      ₹{activeModule === 'incity' ? fareSettings.nightCharge : fareSettings.outstationNightCharge}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Fixed charge applied during night hours
                  </p>
                </div>
                <div className="py-2.5 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Night Time</span>
                    <span className="font-bold text-gray-800 text-sm">
                      {hourToTimeString(fareSettings.nightStartHour)} - {hourToTimeString(fareSettings.nightEndHour)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Night hours when additional charges apply
                  </p>
                </div>
                <div className="py-2.5 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Cancellation Penalty</span>
                    <span className="font-bold text-gray-800 text-sm">₹{fareSettings.cancellationPenaltyAmount}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Penalty charged when trip is cancelled less than 30 minutes before scheduled time
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Commission Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Commission Settings</h2>
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Admin Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={fareSettings.adminCommissionPercentage}
                    onChange={(e) =>
                      setFareSettings({ ...fareSettings, adminCommissionPercentage: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                    required
                    min="0"
                    max="100"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Commission percentage deducted from each trip
                  </p>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    Example Calculation:
                  </p>
                  <p className="text-[10px] text-gray-500 mb-2">
                    For a trip with ₹500 total fare:
                  </p>
                  <div className="flex justify-between text-xs border-t border-green-200 pt-2">
                    <span className="text-gray-600">Admin Commission:</span>
                    <span className="font-bold text-gray-800">₹{(500 * fareSettings.adminCommissionPercentage) / 100}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-600">Driver Earnings:</span>
                    <span className="font-bold text-gray-800">₹{500 - (500 * fareSettings.adminCommissionPercentage) / 100}</span>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="py-2.5 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Admin Commission</span>
                    <span className="font-bold text-gray-800 text-sm">{fareSettings.adminCommissionPercentage}%</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Commission percentage deducted from each trip
                  </p>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    Commission Calculation:
                  </p>
                  <p className="text-[10px] text-gray-500">
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
