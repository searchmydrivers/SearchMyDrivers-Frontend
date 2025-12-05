import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { driverService } from '../services/driverService';
import { tripService } from '../services/tripService';
import { transactionService } from '../services/transactionService';
import api from '../config/api';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    pendingDrivers: 0,
    verifiedDrivers: 0,
    rejectedDrivers: 0,
    suspendedDrivers: 0,
    totalTrips: 0,
    completedTrips: 0,
    pendingTrips: 0,
    cancelledTrips: 0,
    totalUsers: 0,
    todayEarnings: 0,
    totalEarnings: 0,
    adminCommission: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tripData, setTripData] = useState([]);
  const [driverStatusData, setDriverStatusData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [tripStatusData, setTripStatusData] = useState([]);
  const [mapSearchTerm, setMapSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 22.7196, lng: 75.8577 }); // Default: Indore
  const [mapZoom, setMapZoom] = useState(12);
  const [mapLoading, setMapLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Google Maps API Key - Use environment variable or fallback to provided key
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBEIm7hwzYIXr2Dwxb31Xh8GsJ1JQzP7xY';

  const COLORS = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#6366F1',
    purple: '#8B5CF6',
    teal: '#14B8A6',
  };

  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6', '#14B8A6'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [driversResponse, tripsResponse, transactionsResponse, usersResponse] = await Promise.all([
        driverService.getAllDrivers(),
        tripService.getAllTrips(),
        transactionService.getTransactionHistory({ limit: 1000 }),
        api.get('/admins/users', { params: { limit: 1000 } }).catch(() => ({ data: { data: { users: [] } } })),
      ]);

      const allDrivers = driversResponse.data?.drivers || [];
      const allTrips = tripsResponse.data?.trips || [];
      const allTransactions = transactionsResponse.data?.transactions || [];
      const allUsers = usersResponse.data?.data?.users || [];

      // Calculate driver stats
      const pendingCount = allDrivers.filter(
        (d) =>
          d.verificationStatus === 'pending' ||
          d.verificationStatus === 'documents-uploaded' ||
          d.verificationStatus === 'otp-verified'
      ).length;
      const verifiedCount = allDrivers.filter((d) => d.verificationStatus === 'verified').length;
      const rejectedCount = allDrivers.filter((d) => d.verificationStatus === 'rejected').length;
      const suspendedCount = allDrivers.filter((d) => d.isSuspended).length;

      // Calculate trip stats
      const completedTrips = allTrips.filter((t) => t.status === 'payment-completed').length;
      const pendingTrips = allTrips.filter((t) => t.status === 'pending' || t.status === 'driver-assigned').length;
      const cancelledTrips = allTrips.filter((t) => t.status === 'cancelled').length;

      // Calculate earnings
      const today = startOfDay(new Date());
      const todayTransactions = allTransactions.filter((t) => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= today && t.type === 'credit';
      });
      const todayEarnings = todayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalEarnings = transactionsResponse.data?.summary?.totalCredits || 0;
      const adminCommission = transactionsResponse.data?.summary?.totalAdminCommission || 0;

      setStats({
        totalDrivers: allDrivers.length,
        pendingDrivers: pendingCount,
        verifiedDrivers: verifiedCount,
        rejectedDrivers: rejectedCount,
        suspendedDrivers: suspendedCount,
        totalTrips: allTrips.length,
        completedTrips,
        pendingTrips,
        cancelledTrips,
        totalUsers: allUsers.length,
        todayEarnings,
        totalEarnings,
        adminCommission,
      });

      // Prepare chart data - Last 7 days trip trends
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dayTrips = allTrips.filter((trip) => {
          const tripDate = new Date(trip.createdAt);
          return format(tripDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        });
        return {
          date: format(date, 'MMM dd'),
          trips: dayTrips.length,
          completed: dayTrips.filter((t) => t.status === 'payment-completed').length,
          revenue: dayTrips
            .filter((t) => t.status === 'payment-completed' && t.fareDetails?.totalAmount)
            .reduce((sum, t) => sum + (t.fareDetails.totalAmount || 0), 0),
        };
      });
      setTripData(last7Days);

      // Driver status pie chart data
      setDriverStatusData([
        { name: 'Verified', value: verifiedCount, color: COLORS.success },
        { name: 'Pending', value: pendingCount, color: COLORS.warning },
        { name: 'Rejected', value: rejectedCount, color: COLORS.danger },
        { name: 'Suspended', value: suspendedCount, color: '#6B7280' },
      ]);

      // Revenue data (last 7 days)
      setRevenueData(last7Days.map((d) => ({ date: d.date, revenue: d.revenue })));

      // Trip status data
      setTripStatusData([
        { name: 'Completed', value: completedTrips, color: COLORS.success },
        { name: 'Pending', value: pendingTrips, color: COLORS.warning },
        { name: 'Cancelled', value: cancelledTrips, color: COLORS.danger },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.name.includes('revenue') ? `₹${entry.value.toFixed(2)}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleDriverSearch = useCallback(async (searchValue = null) => {
    const searchQuery = searchValue || mapSearchTerm;
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    // Don't search if a driver is already selected
    if (selectedDriver) {
      return;
    }

    // Prevent multiple simultaneous searches
    if (mapLoading) return;

    setMapLoading(true);
    try {
      const response = await api.get('/admins/drivers/search-location', {
        params: { search: searchQuery.trim() },
      });
      if (response.data.success) {
        const drivers = response.data.data.drivers || [];
        setSearchResults(drivers);
        setShowSuggestions(true);
        // Auto-select if only one result with location
        if (drivers.length === 1 && drivers[0].location && drivers[0].location.latitude) {
          handleSelectDriver(drivers[0]);
        }
      }
    } catch (error) {
      console.error('Error searching drivers:', error);
      setSearchResults([]);
      setShowSuggestions(false);
    } finally {
      setMapLoading(false);
    }
  }, [mapSearchTerm, mapLoading, selectedDriver]);

  // Debounced search for real-time suggestions - optimized
  useEffect(() => {
    // Don't search if a driver is already selected
    if (selectedDriver) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (mapSearchTerm.trim().length >= 2) {
        handleDriverSearch(mapSearchTerm);
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 800); // Increased debounce to 800ms to reduce API calls and lag

    return () => clearTimeout(timeoutId);
  }, [mapSearchTerm, handleDriverSearch, selectedDriver]);

  const handleSelectDriver = (driver) => {
    setSelectedDriver(driver);
    setMapSearchTerm(''); // Clear search term when driver is selected to prevent further API calls
    setSearchResults([]); // Clear search results
    setShowSuggestions(false); // Hide suggestions
    setShowInfoWindow(false); // Don't auto-show InfoWindow
    if (driver.location && driver.location.latitude && driver.location.longitude) {
      setMapCenter({
        lat: driver.location.latitude,
        lng: driver.location.longitude,
      });
      setMapZoom(15);
    } else {
      // If no location, show error message
      alert(`Driver ${driver.name} does not have a current location available.`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-600 font-medium text-lg">Loading dashboard analytics...</div>
          </div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      change: '+12%',
      changeType: 'positive',
      color: COLORS.primary,
      icon: 'people',
      link: '/users',
      bgGradient: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Total Drivers',
      value: stats.totalDrivers,
      change: `${stats.verifiedDrivers > 0 ? Math.round((stats.verifiedDrivers / stats.totalDrivers) * 100) : 0}% verified`,
      changeType: 'neutral',
      color: COLORS.info,
      icon: 'local_taxi',
      link: '/drivers',
      bgGradient: 'from-indigo-500 to-indigo-600',
    },
    {
      label: 'Pending Verification',
      value: stats.pendingDrivers,
      change: stats.pendingDrivers > 0 ? 'Action Required' : 'All Clear',
      changeType: stats.pendingDrivers > 0 ? 'warning' : 'positive',
      color: COLORS.warning,
      icon: 'pending_actions',
      link: '/drivers/pending',
      bgGradient: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Total Trips',
      value: stats.totalTrips,
      change: `${stats.completedTrips > 0 ? Math.round((stats.completedTrips / stats.totalTrips) * 100) : 0}% completed`,
      changeType: 'neutral',
      color: COLORS.purple,
      icon: 'route',
      link: '/trip-bookings',
      bgGradient: 'from-purple-500 to-purple-600',
    },
    {
      label: "Today's Earnings",
      value: `₹${stats.todayEarnings.toFixed(2)}`,
      change: 'Today',
      changeType: 'positive',
      color: COLORS.success,
      icon: 'trending_up',
      link: '/transactions',
      bgGradient: 'from-green-500 to-green-600',
    },
    {
      label: 'Admin Commission',
      value: `₹${stats.adminCommission.toFixed(2)}`,
      change: 'Total',
      changeType: 'neutral',
      color: COLORS.teal,
      icon: 'account_balance_wallet',
      link: '/transactions',
      bgGradient: 'from-teal-500 to-teal-600',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business today.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <span className="material-icons-outlined text-lg">refresh</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-medium ${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : stat.changeType === 'warning'
                          ? 'text-amber-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="material-icons-outlined text-white text-2xl">{stat.icon}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trip Trends - Line Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Trip Trends (Last 7 Days)</h3>
                <p className="text-sm text-gray-600 mt-1">Daily trip volume and completion rate</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tripData}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="trips" stroke="#3B82F6" fillOpacity={1} fill="url(#colorTrips)" name="Total Trips" />
                <Area type="monotone" dataKey="completed" stroke="#10B981" fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
                <p className="text-sm text-gray-600 mt-1">Daily revenue from completed trips</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  content={<CustomTooltip />}
                  formatter={(value) => `₹${value.toFixed(2)}`}
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Driver Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Driver Status Distribution</h3>
                <p className="text-sm text-gray-600 mt-1">Breakdown of driver verification status</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={driverStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {driverStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Trip Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Trip Status Overview</h3>
                <p className="text-sm text-gray-600 mt-1">Current trip status breakdown</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tripStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tripStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Driver Location Map */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Driver Location Tracker</h3>
              <p className="text-sm text-gray-600 mt-1">Search and track driver locations on map</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4 relative">
            <div className="relative">
              <input
                type="text"
                value={mapSearchTerm}
                onChange={(e) => {
                  setMapSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay to allow click on suggestions
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Type driver name or phone number to search..."
                className="w-full px-4 py-3 pl-12 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="material-icons-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                search
              </span>
              {mapLoading && (
                <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <button
                onClick={() => handleDriverSearch()}
                disabled={mapLoading || !mapSearchTerm.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                Search
              </button>
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                {searchResults.map((driver) => (
                  <div
                    key={driver._id}
                    onClick={() => handleSelectDriver(driver)}
                    className={`p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                      selectedDriver?._id === driver._id ? 'bg-blue-100' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {driver.profilePicture ? (
                          <img
                            src={driver.profilePicture}
                            alt={driver.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {driver.name?.charAt(0)?.toUpperCase() || 'D'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 truncate">{driver.name}</p>
                          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                            {driver.isOnline ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                Online
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                Offline
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{driver.phone}</p>
                        {driver.workLocation && (
                          <p className="text-xs text-gray-500 mb-1">
                            <span className="material-icons-outlined text-xs align-middle mr-1">location_on</span>
                            {driver.workLocation}
                          </p>
                        )}
                        {driver.rating && (
                          <p className="text-xs text-gray-500 mb-1">
                            <span className="material-icons-outlined text-xs align-middle mr-1 text-yellow-500">star</span>
                            {driver.rating.toFixed(1)} rating
                          </p>
                        )}
                        {driver.location ? (
                          <div className="mt-1">
                            <p className="text-xs text-green-600 font-medium">
                              <span className="material-icons-outlined text-xs align-middle mr-1">check_circle</span>
                              Location available
                            </p>
                            {driver.location.address && (
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                <span className="material-icons-outlined text-xs align-middle mr-1">place</span>
                                {driver.location.address}
                              </p>
                            )}
                            {driver.location.lastUpdated && (
                              <p className="text-xs text-gray-500 mt-1">
                                Updated: {new Date(driver.location.lastUpdated).toLocaleString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-amber-600 font-medium mt-1">
                            <span className="material-icons-outlined text-xs align-middle mr-1">warning</span>
                            No location data
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {showSuggestions && searchResults.length === 0 && mapSearchTerm.trim().length >= 2 && !mapLoading && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
                <p className="text-sm text-gray-500 text-center">No drivers found with location data</p>
              </div>
            )}
          </div>

          {/* Map Container */}
          <div className="relative" style={{ height: '500px', width: '100%' }}>
            {!GOOGLE_MAPS_API_KEY ? (
              <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center p-6">
                  <span className="material-icons-outlined text-6xl text-gray-400 mb-4 block">map</span>
                  <p className="text-gray-600 font-medium mb-2">Google Maps API Key not configured</p>
                  <p className="text-sm text-gray-500">Please add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
                </div>
              </div>
            ) : (
              <LoadScript
                googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                loadingElement={
                  <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading Google Maps...</p>
                    </div>
                  </div>
                }
                onError={(error) => {
                  console.error('Google Maps LoadScript error:', error);
                  setMapError('Failed to load Google Maps. Please check your API key.');
                }}
              >
                <GoogleMap
                  mapContainerStyle={{ height: '100%', width: '100%', borderRadius: '8px' }}
                  center={mapCenter}
                  zoom={mapZoom}
                  onLoad={() => setMapError(null)}
                  onError={(error) => {
                    console.error('Google Maps error:', error);
                    setMapError('Error loading map. Please check your API key and billing settings.');
                  }}
                  options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    clickableIcons: true,
                  }}
                >
                {selectedDriver && selectedDriver.location && selectedDriver.location.latitude && selectedDriver.location.longitude && (
                  <>
                    <Marker
                      position={{
                        lat: selectedDriver.location.latitude,
                        lng: selectedDriver.location.longitude,
                      }}
                      icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                      }}
                      onClick={() => setShowInfoWindow(true)}
                      title={`${selectedDriver.name} - ${selectedDriver.phone}`}
                    />
                    {showInfoWindow && (
                      <InfoWindow
                        position={{
                          lat: selectedDriver.location.latitude,
                          lng: selectedDriver.location.longitude,
                        }}
                        onCloseClick={() => setShowInfoWindow(false)}
                      >
                        <div className="p-3 max-w-xs">
                          <div className="flex items-center space-x-3 mb-2">
                            {selectedDriver.profilePicture ? (
                              <img
                                src={selectedDriver.profilePicture}
                                alt={selectedDriver.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {selectedDriver.name?.charAt(0)?.toUpperCase() || 'D'}
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-gray-900">{selectedDriver.name}</h4>
                              <p className="text-sm text-gray-600">{selectedDriver.phone}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {selectedDriver.workLocation && (
                              <p className="text-xs text-gray-500">
                                <span className="material-icons-outlined text-xs align-middle mr-1">location_on</span>
                                {selectedDriver.workLocation}
                              </p>
                            )}
                            {selectedDriver.rating && (
                              <p className="text-xs text-gray-500">
                                <span className="material-icons-outlined text-xs align-middle mr-1 text-yellow-500">star</span>
                                Rating: {selectedDriver.rating.toFixed(1)}/5.0
                              </p>
                            )}
                            {selectedDriver.location && selectedDriver.location.address && (
                              <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                                <span className="material-icons-outlined text-xs align-middle mr-1">place</span>
                                {selectedDriver.location.address}
                              </p>
                            )}
                            {selectedDriver.location && selectedDriver.location.lastUpdated && (
                              <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                                <span className="material-icons-outlined text-xs align-middle mr-1">schedule</span>
                                Last updated: {new Date(selectedDriver.location.lastUpdated).toLocaleString()}
                              </p>
                            )}
                            <p className="text-xs mt-2">
                              {selectedDriver.isOnline ? (
                                <span className="text-green-600 font-medium">
                                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
                                  Currently Online
                                </span>
                              ) : (
                                <span className="text-gray-500">Currently Offline</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </>
                )}
                </GoogleMap>
              </LoadScript>
            )}
            {mapError && (
              <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 z-10">
                <div className="flex items-center space-x-2">
                  <span className="material-icons-outlined text-red-600">error</span>
                  <p className="text-sm text-red-700 font-medium">{mapError}</p>
                </div>
              </div>
            )}
          </div>

          {selectedDriver && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {selectedDriver.profilePicture ? (
                    <img
                      src={selectedDriver.profilePicture}
                      alt={selectedDriver.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-300"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-blue-300">
                      {selectedDriver.name?.charAt(0)?.toUpperCase() || 'D'}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-semibold text-gray-900 text-lg">{selectedDriver.name}</p>
                      {selectedDriver.isOnline ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Online
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          Offline
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{selectedDriver.phone}</p>
                    {selectedDriver.workLocation && (
                      <p className="text-xs text-gray-500 mb-1">
                        <span className="material-icons-outlined text-xs align-middle mr-1">location_on</span>
                        Work Location: {selectedDriver.workLocation}
                      </p>
                    )}
                    {selectedDriver.rating && (
                      <p className="text-xs text-gray-500 mb-1">
                        <span className="material-icons-outlined text-xs align-middle mr-1 text-yellow-500">star</span>
                        Rating: {selectedDriver.rating.toFixed(1)}/5.0
                      </p>
                    )}
                    {selectedDriver.location && (
                      <p className="text-xs text-blue-600 font-medium mt-2">
                        <span className="material-icons-outlined text-xs align-middle mr-1">place</span>
                        {selectedDriver.location.address || `Location: ${selectedDriver.location.latitude.toFixed(6)}, ${selectedDriver.location.longitude.toFixed(6)}`}
                      </p>
                    )}
                    {selectedDriver.location && selectedDriver.location.lastUpdated && (
                      <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-blue-200">
                        <span className="material-icons-outlined text-xs align-middle mr-1">schedule</span>
                        Last updated: {new Date(selectedDriver.location.lastUpdated).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDriver(null);
                    setSearchResults([]);
                    setMapSearchTerm('');
                    setShowSuggestions(false);
                    setShowInfoWindow(false);
                    setMapCenter({ lat: 22.7196, lng: 75.8577 });
                    setMapZoom(12);
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium flex-shrink-0 ml-4"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/drivers/pending"
              className="flex flex-col items-center justify-center p-4 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <span className="material-icons-outlined text-amber-600 text-3xl mb-2">pending_actions</span>
              <span className="text-sm font-medium text-amber-900">Review Pending</span>
            </Link>
            <Link
              to="/drivers"
              className="flex flex-col items-center justify-center p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <span className="material-icons-outlined text-indigo-600 text-3xl mb-2">people</span>
              <span className="text-sm font-medium text-indigo-900">All Drivers</span>
            </Link>
            <Link
              to="/trip-bookings"
              className="flex flex-col items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="material-icons-outlined text-purple-600 text-3xl mb-2">route</span>
              <span className="text-sm font-medium text-purple-900">Manage Trips</span>
            </Link>
            <Link
              to="/transactions"
              className="flex flex-col items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="material-icons-outlined text-green-600 text-3xl mb-2">receipt_long</span>
              <span className="text-sm font-medium text-green-900">Transactions</span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
