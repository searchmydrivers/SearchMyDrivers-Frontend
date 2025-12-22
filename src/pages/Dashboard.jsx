import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import api from '../config/api';
import {
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
  LineChart,
  Line
} from 'recharts';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]); // Revenue
  const [statusData, setStatusData] = useState([]); // Trip Status
  const [growthData, setGrowthData] = useState([]); // User/Driver Growth
  const [hourlyData, setHourlyData] = useState([]); // Hourly bookings
  const [recentActivity, setRecentActivity] = useState({ drivers: [], trips: [], cancellations: [] });

  // Map States
  const [mapSearchTerm, setMapSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 22.7196, lng: 75.8577 });
  const [mapZoom, setMapZoom] = useState(12);
  const [mapLoading, setMapLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [mapError, setMapError] = useState(null);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBEIm7hwzYIXr2Dwxb31Xh8GsJ1JQzP7xY';

  const COLORS = {
    primary: '#0B2C4D', // Navy
    secondary: '#2BB673', // Green
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    dark: '#0B2C4D',
    light: '#F3F4F6',
    chart1: '#0B2C4D',
    chart2: '#2BB673',
    chart3: '#ffc658',
    chart4: '#ff8042'
  };

  const STATUS_COLORS = {
    'Completed': '#2BB673',
    'Cancelled': '#EF4444',
    'Driver Assigned': '#0B2C4D',
    'Pending': '#F59E0B',
    'Payment Pending': '#8B5CF6'
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ... (fetchDashboardData and map handlers remain the same) ...
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admins/dashboard-stats');
      if (response.data.success) {
        setStats(response.data.data.stats);
        setChartData(response.data.data.charts.revenue);
        setStatusData(response.data.data.charts.status);
        setGrowthData(response.data.data.charts.growth);
        setHourlyData(response.data.data.charts.hourly);
        setRecentActivity({
          drivers: response.data.data.recentActivity.drivers,
          trips: response.data.data.recentActivity.trips,
          cancellations: response.data.data.recentActivity.cancellations || []
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDriverSearch = useCallback(async (searchValue = null) => {
    const searchQuery = searchValue || mapSearchTerm;
    if (!searchQuery.trim()) return;

    if (selectedDriver) return;
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
        if (drivers.length === 1 && drivers[0].location?.latitude) {
          handleSelectDriver(drivers[0]);
        }
      }
    } catch (error) {
      console.error('Error searching drivers:', error);
    } finally {
      setMapLoading(false);
    }
  }, [mapSearchTerm, mapLoading, selectedDriver]);

  const handleSelectDriver = (driver) => {
    setSelectedDriver(driver);
    setMapSearchTerm('');
    setSearchResults([]);
    setShowSuggestions(false);
    setShowInfoWindow(false);
    if (driver.location?.latitude) {
      setMapCenter({
        lat: driver.location.latitude,
        lng: driver.location.longitude,
      });
      setMapZoom(15);
    } else {
      alert(`Driver ${driver.name} does not have a current location available.`);
    }
  };

  useEffect(() => {
    if (selectedDriver) return;
    const timeoutId = setTimeout(() => {
      if (mapSearchTerm.trim().length >= 2) {
        handleDriverSearch(mapSearchTerm);
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [mapSearchTerm, handleDriverSearch, selectedDriver]);

  if (loading || !stats) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading Analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: `₹${stats.financials.totalRevenue.toLocaleString()}`,
      subValue: `+₹${stats.financials.todayRevenue.toLocaleString()} today`,
      icon: 'account_balance_wallet',
      color: 'text-[#2BB673]',
      bg: 'bg-green-50',
      chartColor: '#2BB673'
    },
    {
      label: 'Today Bookings',
      value: stats.trips.today,
      subValue: `${stats.trips.active} active now`,
      icon: 'today',
      color: 'text-[#0B2C4D]', // Navy
      bg: 'bg-blue-50',
      chartColor: '#0B2C4D'
    },
    {
      label: 'Fleet Uptime',
      value: `${stats.drivers.onlinePercentage}%`,
      subValue: `${stats.drivers.online} / ${stats.drivers.verified} Drivers Online`,
      icon: 'speed',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      chartColor: '#3B82F6'
    },
    {
      label: 'Cancellation Rate',
      value: `${stats.trips.cancellationRate}%`,
      subValue: 'Last 30 Days',
      icon: 'warning',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      chartColor: '#EF4444'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8 font-sans bg-gray-50/50 min-h-screen p-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
            <p className="text-gray-500 mt-1">Real-time overview & analytics</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-[#2BB673] transition-colors shadow-sm"
          >
            <span className="material-icons-outlined text-lg mr-2">refresh</span>
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} bg-opacity-50`}>
                  <span className="material-icons-outlined text-2xl">{stat.icon}</span>
                </div>
                {/* Micro Chart Placeholder */}
                <div className="h-10 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{ val: 10 }, { val: 30 }, { val: 20 }, { val: 50 }, { val: 40 }, { val: 70 }]}>
                      <Line type="monotone" dataKey="val" stroke={stat.chartColor} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-xs font-semibold ${stat.color} flex items-center mt-2`}>
                {stat.subValue}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Section 1: Revenue & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
              <div className="flex space-x-2">
                <span className="flex items-center text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-[#2BB673] mr-2"></div>Commission</span>
                <span className="flex items-center text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-[#0B2C4D] mr-2"></div>Driver Earnings</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDriver" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B2C4D" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0B2C4D" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2BB673" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2BB673" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="driverShare"
                    stackId="1"
                    stroke="#0B2C4D"
                    fill="url(#colorDriver)"
                    name="Driver Earnings"
                  />
                  <Area
                    type="monotone"
                    dataKey="commission"
                    stackId="1"
                    stroke="#2BB673"
                    fill="url(#colorCommission)"
                    name="Commission"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trip Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Trip Distribution</h3>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS.chart1} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{stats.trips.total}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total Trips</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section 2: Growth & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Growth</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="New Users" />
                  <Line type="monotone" dataKey="drivers" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="New Drivers" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Peak Booking Hours</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} interval={2} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="count" fill="#0B2C4D" radius={[4, 4, 0, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Recent Cancellations & Map */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Cancellations List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden xl:col-span-1">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-red-50/50">
              <h3 className="font-bold text-red-900 flex items-center">
                <span className="material-icons-outlined mr-2">cancel_presentation</span>
                Recent Cancellations
              </h3>
            </div>
            <div className="overflow-y-auto max-h-[500px]">
              {recentActivity.cancellations && recentActivity.cancellations.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentActivity.cancellations.map((trip) => (
                    <div key={trip._id} className="p-4 hover:bg-red-50/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-900 px-2 py-1 bg-gray-100 rounded-md">
                          {new Date(trip.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-medium text-red-600">
                          {trip.cancellationPenalty?.cancelledBy === 'user' ? 'By User' : 'By Driver'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-800 font-medium mb-1">
                        {trip.pickupLocation?.address || 'Unknown Pickup'}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        Reason: {trip.cancellationPenalty?.penaltyReason || 'No reason provided'}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center text-gray-600">
                          <span className="material-icons-outlined text-sm mr-1">person</span>
                          {trip.user?.name || 'N/A'}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="material-icons-outlined text-sm mr-1">drive_eta</span>
                          {trip.driver?.name || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <span className="material-icons-outlined text-4xl mb-2">check_circle</span>
                  <p>No recent cancellations</p>
                </div>
              )}
            </div>
          </div>

          {/* Live Map (Already Existing, just restyled container) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 xl:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Live Driver Map</h3>
                <p className="text-sm text-gray-500">Real-time fleet tracking</p>
              </div>
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  value={mapSearchTerm}
                  onChange={(e) => {
                    setMapSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder="Search driver..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2BB673] focus:border-transparent transition-all"
                />
                <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                {showSuggestions && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {searchResults.map((d) => (
                      <div
                        key={d._id}
                        onClick={() => handleSelectDriver(d)}
                        className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-xs text-[#0B2C4D]">
                          {d.name[0]}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-gray-900 truncate">{d.name}</p>
                          <p className="text-xs text-gray-500">{d.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 relative">
              {!GOOGLE_MAPS_API_KEY ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gray-100">
                  <span className="material-icons-outlined text-4xl text-gray-400 mb-2">map_off</span>
                  <p className="text-gray-600 font-medium">Map Unavailable</p>
                  <p className="text-sm text-gray-500">API Key missing</p>
                </div>
              ) : (
                <LoadScript
                  googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                  loadingElement={<div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">Loading Map...</div>}
                >
                  <GoogleMap
                    mapContainerStyle={{ height: '100%', width: '100%' }}
                    center={mapCenter}
                    zoom={mapZoom}
                    options={{
                      disableDefaultUI: false,
                      zoomControl: true,
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: true,
                      styles: [
                        {
                          featureType: "poi",
                          elementType: "labels",
                          stylers: [{ visibility: "off" }]
                        }
                      ]
                    }}
                  >
                    {selectedDriver && selectedDriver.location?.latitude && (
                      <>
                        <Marker
                          position={{ lat: selectedDriver.location.latitude, lng: selectedDriver.location.longitude }}
                          onClick={() => setShowInfoWindow(true)}
                          animation={window.google?.maps?.Animation?.DROP}
                        />
                        {showInfoWindow && (
                          <InfoWindow
                            position={{ lat: selectedDriver.location.latitude, lng: selectedDriver.location.longitude }}
                            onCloseClick={() => setShowInfoWindow(false)}
                          >
                            <div className="p-2 min-w-[200px]">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-[#0B2C4D] text-sm">
                                  {selectedDriver.name[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{selectedDriver.name}</p>
                                  <p className="text-xs text-gray-500">{selectedDriver.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs mt-2">
                                <span className={`px-2 py-0.5 rounded-full ${selectedDriver.isOnline ? 'bg-[#2BB673]/10 text-[#2BB673]' : 'bg-gray-100 text-gray-600'}`}>
                                  {selectedDriver.isOnline ? 'Online' : 'Offline'}
                                </span>
                                <span className="text-gray-400 border-l pl-2 border-gray-300">
                                  {selectedDriver.workLocation || 'Unknown'}
                                </span>
                              </div>
                            </div>
                          </InfoWindow>
                        )}
                      </>
                    )}
                  </GoogleMap>
                </LoadScript>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
