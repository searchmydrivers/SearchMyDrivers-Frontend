import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { driverService } from '../services/driverService';
import { tripService } from '../services/tripService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    pendingDrivers: 0,
    verifiedDrivers: 0,
    rejectedDrivers: 0,
    totalTrips: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [allDriversResponse, allTripsResponse] = await Promise.all([
        driverService.getAllDrivers(),
        tripService.getAllTrips(),
      ]);

      const allDrivers = allDriversResponse.data?.drivers || [];
      
      // Count drivers by status
      const pendingCount = allDrivers.filter(d => 
        d.verificationStatus === 'pending' || 
        d.verificationStatus === 'documents-uploaded' || 
        d.verificationStatus === 'otp-verified'
      ).length;
      const verifiedCount = allDrivers.filter(d => d.verificationStatus === 'verified').length;
      const rejectedCount = allDrivers.filter(d => d.verificationStatus === 'rejected').length;

      setStats({
        totalDrivers: allDrivers.length,
        pendingDrivers: pendingCount,
        verifiedDrivers: verifiedCount,
        rejectedDrivers: rejectedCount,
        totalTrips: allTripsResponse.data?.trips?.length || 0,
        totalUsers: 0, // Will be updated when users API is available
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats.totalUsers, 
      color: 'from-blue-500 to-blue-600', 
      icon: 'people',
      link: '/users',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Total Drivers', 
      value: stats.totalDrivers, 
      color: 'from-indigo-500 to-indigo-600', 
      icon: 'local_taxi',
      link: '/drivers',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    { 
      label: 'Pending Verification', 
      value: stats.pendingDrivers, 
      color: 'from-yellow-500 to-yellow-600', 
      icon: 'pending',
      link: '/drivers/pending',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    { 
      label: 'Verified Drivers', 
      value: stats.verifiedDrivers, 
      color: 'from-green-500 to-green-600', 
      icon: 'verified',
      link: '/drivers/verified',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      label: 'Rejected Drivers', 
      value: stats.rejectedDrivers, 
      color: 'from-red-500 to-red-600', 
      icon: 'cancel',
      link: '/drivers/rejected',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    { 
      label: 'Total Trips', 
      value: stats.totalTrips, 
      color: 'from-purple-500 to-purple-600', 
      icon: 'route',
      link: '/trip-bookings',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium">Loading dashboard...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">Welcome to Search My Drivers Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {statCards.map((stat, index) => (
            <Link
              key={stat.label}
              to={stat.link}
              className="group bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 lg:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-2 sm:mb-3 uppercase tracking-wide truncate">{stat.label}</p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</p>
                  <div className="flex items-center text-xs font-medium text-gray-500">
                    <span className="material-icons-outlined text-xs sm:text-sm mr-1">trending_up</span>
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                  </div>
                </div>
                <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 ${stat.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0 ml-2`}>
                  <span className={`material-icons-round text-2xl sm:text-3xl lg:text-4xl ${stat.textColor}`}>{stat.icon}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Quick Actions</h2>
            <span className="material-icons-outlined text-gray-400 text-xl sm:text-2xl">bolt</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link
              to="/drivers/pending"
              className="group px-3 sm:px-4 lg:px-6 py-4 sm:py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg sm:rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center font-semibold transform hover:-translate-y-1 active:translate-y-0 text-sm sm:text-base"
            >
              <span className="material-icons-outlined block mb-1 sm:mb-2 text-2xl sm:text-3xl">pending_actions</span>
              <span className="block">Review Pending</span>
            </Link>
            <Link
              to="/drivers"
              className="group px-3 sm:px-4 lg:px-6 py-4 sm:py-5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center font-semibold transform hover:-translate-y-1 active:translate-y-0 text-sm sm:text-base"
            >
              <span className="material-icons-outlined block mb-1 sm:mb-2 text-2xl sm:text-3xl">people</span>
              <span className="block">All Drivers</span>
            </Link>
            <Link
              to="/trip-bookings"
              className="group px-3 sm:px-4 lg:px-6 py-4 sm:py-5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center font-semibold transform hover:-translate-y-1 active:translate-y-0 text-sm sm:text-base"
            >
              <span className="material-icons-outlined block mb-1 sm:mb-2 text-2xl sm:text-3xl">route</span>
              <span className="block">Manage Trips</span>
            </Link>
            <Link
              to="/users"
              className="group px-3 sm:px-4 lg:px-6 py-4 sm:py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center font-semibold transform hover:-translate-y-1 active:translate-y-0 text-sm sm:text-base"
            >
              <span className="material-icons-outlined block mb-1 sm:mb-2 text-2xl sm:text-3xl">person</span>
              <span className="block">All Users</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 animate-fade-in" style={{ animationDelay: '700ms' }}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Drivers</h2>
              <span className="material-icons-outlined text-gray-400 text-xl sm:text-2xl">local_taxi</span>
            </div>
            <div className="flex items-center justify-center h-24 sm:h-32 bg-gray-50 rounded-lg sm:rounded-xl">
              <p className="text-xs sm:text-sm text-gray-500 font-medium text-center px-4">Driver management section coming soon...</p>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 animate-fade-in" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Trips</h2>
              <span className="material-icons-outlined text-gray-400 text-xl sm:text-2xl">route</span>
            </div>
            <div className="flex items-center justify-center h-24 sm:h-32 bg-gray-50 rounded-lg sm:rounded-xl">
              <p className="text-xs sm:text-sm text-gray-500 font-medium text-center px-4">Trip management section coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
