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
import { GoogleMap, LoadScript, Marker, InfoWindow, HeatmapLayer } from '@react-google-maps/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-100 ring-1 ring-black/5">
        <p className="text-sm font-bold text-gray-900 mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full shadow-sm`} style={{ backgroundColor: entry.color }}></div>
                <span className="text-gray-500">{entry.name}</span>
              </div>
              <span className="text-gray-900 font-bold font-mono">₹{entry.value.toLocaleString()}</span>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between gap-4 text-xs">
            <span className="font-semibold text-gray-600">Total Revenue</span>
            <span className="text-[#0B2C4D] font-bold font-mono text-sm">
              ₹{(payload.reduce((acc, curr) => acc + curr.value, 0)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const libraries = ['visualization'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [revenueFilter, setRevenueFilter] = useState('last_7_days');
  const [chartData, setChartData] = useState([]); // Revenue
  const [statusData, setStatusData] = useState([]); // Trip Status
  const [growthData, setGrowthData] = useState([]); // User/Driver Growth
  const [hourlyData, setHourlyData] = useState([]); // Hourly bookings
  const [recentActivity, setRecentActivity] = useState({ drivers: [], trips: [], cancellations: [], topDrivers: [] });
  const [heatmapData, setHeatmapData] = useState({ fulfilled: [], unfulfilled: [] });
  const [showHeatmap, setShowHeatmap] = useState(false);

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
    'Payment completed': '#2BB673', // Green
    'Cancelled': '#EF4444', // Red
    'Driver assigned': '#0B2C4D', // Navy
    'Pending': '#F59E0B', // Amber
    'Payment pending': '#8B5CF6', // Violet
    'In progress': '#3B82F6', // Blue
    'Pin verified': '#06B6D4', // Cyan
  };

  useEffect(() => {
    fetchDashboardData();
  }, [revenueFilter]);

  // ... (fetchDashboardData and map handlers remain the same) ...
  const fetchDashboardData = async () => {
    try {
      // Don't set full loading to true on filter change to avoid full page flicker, maybe just chart loading?
      // For now, let's keep it simple.
      if (!stats) setLoading(true);

      const response = await api.get('/admins/dashboard-stats', {
        params: { revenueFilter }
      });
      if (response.data.success) {
        setStats(response.data.data.stats);
        setChartData(response.data.data.charts.revenue);
        setStatusData(response.data.data.charts.status);
        setGrowthData(response.data.data.charts.growth);
        setHourlyData(response.data.data.charts.hourly);
        setRecentActivity({
          drivers: response.data.data.recentActivity.drivers,
          trips: response.data.data.recentActivity.trips,
          cancellations: response.data.data.recentActivity.cancellations || [],
          topDrivers: response.data.data.recentActivity.topDrivers || []
        });
      }

      // Fetch Heatmap Data if not already
      const heatmapRes = await api.get('/admins/analytics/heatmap');
      if (heatmapRes.data.success) {
        setHeatmapData(heatmapRes.data.data);
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
      }
    } catch (error) {
      console.error('Error searching drivers:', error);
    } finally {
      setMapLoading(false);
    }
  }, [mapSearchTerm, mapLoading, selectedDriver]);

  const handleSelectDriver = async (driverBasic) => {
    // Show loading state or at least select the driver immediately so UI reflects it
    setMapSearchTerm('');
    setSearchResults([]);
    setShowSuggestions(false);
    setMapLoading(true);

    try {
      const response = await api.get(`/admins/drivers/${driverBasic._id}/live-location`);
      if (response.data.success) {
        const fullDriver = response.data.data.driver;
        setSelectedDriver(fullDriver);

        if (fullDriver.location?.latitude) {
          setMapCenter({
            lat: fullDriver.location.latitude,
            lng: fullDriver.location.longitude,
          });
          setMapZoom(15);
          setShowInfoWindow(true);
        } else {
          alert(`Driver ${fullDriver.name} does not have a current location available.`);
        }
      }
    } catch (error) {
      console.error('Error fetching driver live location:', error);
      alert('Failed to fetch driver location');
    } finally {
      setMapLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mapSearchTerm.trim().length >= 2) {
        handleDriverSearch(mapSearchTerm);
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 500);
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
      chartColor: '#2BB673',
      link: '/transactions'
    },
    {
      label: 'Today Bookings',
      value: stats.trips.today,
      subValue: `${stats.trips.active} active now`,
      icon: 'today',
      color: 'text-[#0B2C4D]', // Navy
      bg: 'bg-blue-50',
      chartColor: '#0B2C4D',
      link: '/trip-bookings'
    },
    {
      label: 'Fleet Uptime',
      value: `${stats.drivers.onlinePercentage}%`,
      subValue: `${stats.drivers.online} / ${stats.drivers.verified} Drivers Online`,
      icon: 'speed',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      chartColor: '#3B82F6',
      link: '/drivers'
    },
    {
      label: 'Cancellation Rate',
      value: `${stats.trips.cancellationRate}%`,
      subValue: 'Last 30 Days',
      icon: 'warning',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      chartColor: '#EF4444',
      link: '/trip-bookings'
    },
    {
      label: 'Pending Approvals',
      value: stats.drivers.pendingApprovals || 0,
      subValue: 'Waiting for action',
      icon: 'verified_user',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      chartColor: '#F97316',
      link: '/drivers/pending'
    },
    {
      label: 'Open Tickets',
      value: stats.support?.openTickets || 0,
      subValue: 'Needs attention',
      icon: 'support_agent',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      chartColor: '#9333EA',
      link: '/tickets'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpiCards.map((stat, index) => (
            <Link
              to={stat.link}
              key={index}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group block relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color} bg-opacity-50`}>
                  <span className="material-icons-outlined text-xl">{stat.icon}</span>
                </div>
                {/* Micro Chart Placeholder */}
                <div className="h-8 w-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{ val: 10 }, { val: 30 }, { val: 20 }, { val: 50 }, { val: 40 }, { val: 70 }]}>
                      <Line type="monotone" dataKey="val" stroke={stat.chartColor} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</h3>
              <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-[10px] font-semibold ${stat.color} flex items-center mt-1`}>
                {stat.subValue}
              </p>
            </Link>
          ))}
        </div>

        {/* Charts Section 1: Revenue & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Revenue Analytics</h3>
              <div className="flex items-center gap-3">
                <select
                  value={revenueFilter}
                  onChange={(e) => setRevenueFilter(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0B2C4D]"
                >
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="current_month_weeks">This Month (Weekly)</option>
                  <option value="current_year_months">This Year (Monthly)</option>
                  <option value="five_years">Last 5 Years</option>
                </select>
                <div className="flex space-x-2">
                  <span className="flex items-center text-[10px] text-gray-500"><div className="w-1.5 h-1.5 rounded-full bg-[#0B2C4D] mr-1.5"></div>InCity</span>
                  <span className="flex items-center text-[10px] text-gray-500"><div className="w-1.5 h-1.5 rounded-full bg-[#2BB673] mr-1.5"></div>Outstation</span>
                  <span className="flex items-center text-[10px] text-gray-500"><div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] mr-1.5"></div>Hiring</span>
                </div>
              </div>
            </div>
            {stats.financials?.revenueSplit && (
              <div className="flex gap-4 mb-4 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-700">Sources:</span>
                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#0B2C4D] mr-1.5"></div>InCity: <span className="font-mono ml-1">₹{(stats.financials.revenueSplit.incity || 0).toLocaleString()}</span></span>
                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#2BB673] mr-1.5"></div>Outstation: <span className="font-mono ml-1">₹{(stats.financials.revenueSplit.outstation || 0).toLocaleString()}</span></span>
                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#06B6D4] mr-1.5"></div>Hiring: <span className="font-mono ml-1">₹{(stats.financials.revenueSplit.hiring || 0).toLocaleString()}</span></span>
              </div>
            )}
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorInCity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B2C4D" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0B2C4D" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorOutstation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2BB673" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#2BB673" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorHiring" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    axisLine={{ stroke: '#F3F4F6', strokeWidth: 1 }}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 500 }}
                    tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  {/* Layered Areas (Unstacked) */}
                  <Area
                    type="monotone"
                    dataKey="outstation"
                    stroke="#2BB673"
                    strokeWidth={2}
                    fill="url(#colorOutstation)"
                    name="Outstation"
                    animationDuration={1500}
                    connectNulls={true}
                  />
                  <Area
                    type="monotone"
                    dataKey="incity"
                    stroke="#0B2C4D"
                    strokeWidth={2}
                    fill="url(#colorInCity)"
                    name="InCity"
                    animationDuration={1500}
                    connectNulls={true}
                  />
                  <Area
                    type="monotone"
                    dataKey="hiring"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fill="url(#colorHiring)"
                    name="Hiring"
                    animationDuration={1500}
                    connectNulls={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trip Status */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-4">Trip Distribution</h3>
            <div className="h-64 w-full relative min-w-0">
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
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.trips.total}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Trips</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section 2: Growth & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-4">Platform Growth</h3>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} name="New Users" />
                  <Line type="monotone" dataKey="drivers" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} name="New Drivers" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-4">Peak Booking Hours</h3>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} interval={2} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#0B2C4D" radius={[3, 3, 0, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Activity & Map */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Cancellations List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden xl:col-span-1">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-red-50/50">
              <h3 className="font-bold text-red-900 flex items-center text-sm">
                <span className="material-icons-outlined mr-2 text-base">cancel_presentation</span>
                Recent Cancellations
              </h3>
            </div>
            <div className="overflow-y-auto max-h-[450px]">
              {recentActivity.cancellations && recentActivity.cancellations.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentActivity.cancellations.map((trip) => (
                    <div key={trip._id} className="p-3 hover:bg-red-50/30 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-gray-900 px-1.5 py-0.5 bg-gray-100 rounded">
                          {new Date(trip.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-medium text-red-600">
                          {trip.cancellationPenalty?.cancelledBy === 'user' ? 'By User' : 'By Driver'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-800 font-medium mb-0.5 truncate">
                        {trip.pickupLocation?.address || 'Unknown Pickup'}
                      </div>
                      <div className="text-[10px] text-gray-500 mb-1">
                        Reason: {trip.cancellationPenalty?.penaltyReason || 'No reason provided'}
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center text-gray-600">
                          <span className="material-icons-outlined text-xs mr-1">person</span>
                          {trip.user?.name || 'N/A'}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="material-icons-outlined text-xs mr-1">drive_eta</span>
                          {trip.driver?.name || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <span className="material-icons-outlined text-4xl mb-2">check_circle</span>
                  <p className="text-sm">No recent cancellations</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Drivers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden xl:col-span-1">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-blue-50/50">
              <h3 className="font-bold text-blue-900 flex items-center text-sm">
                <span className="material-icons-outlined mr-2 text-base">emoji_events</span>
                Top Performers
              </h3>
            </div>
            <div className="overflow-y-auto max-h-[450px]">
              {recentActivity.topDrivers && recentActivity.topDrivers.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentActivity.topDrivers.map((driver, idx) => (
                    <div key={driver._id} className="p-3 flex items-center gap-3 hover:bg-gray-50/50">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{driver.name}</p>
                        <p className="text-[10px] text-gray-500">{driver.totalRides} Rides</p>
                      </div>
                      <div className="flex items-center bg-green-50 px-2 py-1 rounded-lg">
                        <span className="material-icons text-[10px] text-green-600 mr-1">star</span>
                        <span className="text-xs font-bold text-green-700">{driver.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <p className="text-sm">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Live Map */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 xl:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Live Driver Map</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">Real-time fleet tracking</p>
                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`text-[10px] px-2 py-0.5 rounded border ${showHeatmap ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                  >
                    {showHeatmap ? 'Hide Heatmap' : 'Show Demand'}
                  </button>
                </div>
              </div>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={mapSearchTerm}
                  onChange={(e) => {
                    setMapSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder="Search driver by name/phone..."
                  className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2BB673] focus:border-transparent transition-all"
                />
                <span className="material-icons-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">search</span>

                {mapLoading && (
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 border-2 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {showSuggestions && mapSearchTerm.trim().length >= 2 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((d) => (
                        <div
                          key={d._id}
                          onClick={() => handleSelectDriver(d)}
                          className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 border-b border-gray-50 last:border-0"
                        >
                          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center font-bold text-[10px] text-[#0B2C4D]">
                            {d.name ? d.name[0].toUpperCase() : '?'}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-medium text-gray-900 truncate">{d.name}</p>
                            <p className="text-[10px] text-gray-500">{d.phone}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      !mapLoading && (
                        <div className="p-3 text-center text-gray-500 text-xs">
                          No drivers found with active location.
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="h-[450px] w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative">
              {!GOOGLE_MAPS_API_KEY ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gray-100">
                  <span className="material-icons-outlined text-4xl text-gray-400 mb-2">map_off</span>
                  <p className="text-gray-600 font-medium text-sm">Map Unavailable</p>
                  <p className="text-xs text-gray-500">API Key missing</p>
                </div>
              ) : (
                <LoadScript
                  googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                  libraries={libraries}
                  loadingElement={<div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">Loading Map...</div>}
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
                    {/* Heatmap Layer */}
                    {heatmapData.unfulfilled.length > 0 && (
                      <HeatmapLayer
                        data={showHeatmap
                          ? heatmapData.unfulfilled.map(p => new window.google.maps.LatLng(p.lat, p.lng))
                          : []
                        }
                        options={{
                          radius: 20,
                          opacity: 0.8,
                          gradient: [
                            'rgba(0, 255, 255, 0)',
                            'rgba(0, 255, 255, 1)',
                            'rgba(0, 191, 255, 1)',
                            'rgba(0, 127, 255, 1)',
                            'rgba(0, 63, 255, 1)',
                            'rgba(0, 0, 255, 1)',
                            'rgba(0, 0, 223, 1)',
                            'rgba(0, 0, 191, 1)',
                            'rgba(0, 0, 159, 1)',
                            'rgba(0, 0, 127, 1)',
                            'rgba(63, 0, 91, 1)',
                            'rgba(127, 0, 63, 1)',
                            'rgba(191, 0, 31, 1)',
                            'rgba(255, 0, 0, 1)'
                          ]
                        }}
                      />
                    )}

                    {/* Driver Markers */}
                    {!showHeatmap && selectedDriver && selectedDriver.location?.latitude && (
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
                            <div className="p-1.5 min-w-[180px]">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center font-bold text-[#0B2C4D] text-xs">
                                  {selectedDriver.name[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-xs">{selectedDriver.name}</p>
                                  <p className="text-[10px] text-gray-500">{selectedDriver.phone}</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 text-[10px] mt-1.5">
                                <span className={`self-start px-1.5 py-0.5 rounded-full ${selectedDriver.isOnline ? 'bg-[#2BB673]/10 text-[#2BB673]' : 'bg-gray-100 text-gray-600'}`}>
                                  {selectedDriver.isOnline ? 'Online' : 'Offline'}
                                </span>
                                <div className="flex items-start text-gray-600 mt-0.5">
                                  <span className="material-icons-outlined text-xs mr-1">location_on</span>
                                  <span className="break-words max-w-[160px]">
                                    {selectedDriver.location?.address || selectedDriver.workLocation || 'Location unavailable'}
                                  </span>
                                </div>
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
