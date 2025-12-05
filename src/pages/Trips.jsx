import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { tripService } from '../services/tripService';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await tripService.getAllTrips();
      setTrips(response.data?.trips || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'schedule' },
      'driver-assigned': { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'person_add' },
      'in-progress': { bg: 'bg-purple-100', text: 'text-purple-800', icon: 'directions_car' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: 'check_circle' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: 'cancel' },
      'payment-completed': { bg: 'bg-green-100', text: 'text-green-800', icon: 'payment' },
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'help' };
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      'driver-assigned': 'Driver Assigned',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      'payment-completed': 'Payment Completed',
    };
    return labels[status] || status;
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      !searchTerm ||
      trip._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.user?.phone?.includes(searchTerm) ||
      trip.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && trips.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium">Loading trips...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-1 sm:mb-2">Trips Management</h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium">View and manage all trip bookings</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by trip ID, user name, phone, or driver name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
            />
            <span className="material-icons-outlined absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg sm:text-xl">search</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                statusFilter === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('in-progress')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                statusFilter === 'in-progress'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('payment-completed')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                statusFilter === 'payment-completed'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                statusFilter === 'cancelled'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Trip ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <span className="material-icons-outlined text-6xl text-gray-300">inbox</span>
                        <p className="text-gray-500 font-medium">No trips found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((trip, index) => {
                    const badge = getStatusBadge(trip.status);
                    return (
                      <tr
                        key={trip._id}
                        className="hover:bg-gray-50 transition-colors duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 font-mono">
                            {trip._id.substring(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg mr-3">
                              {trip.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{trip.user?.name || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{trip.user?.phone || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {trip.driver ? (
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg mr-3">
                                {trip.driver.name?.charAt(0)?.toUpperCase() || 'D'}
                              </div>
                              <div className="text-sm font-semibold text-gray-900">{trip.driver.name}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                            <span className="material-icons-outlined text-sm mr-1">route</span>
                            {trip.tripType || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            ₹{trip.fareDetails?.totalAmount || trip.payment?.amount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${badge.bg} ${badge.text}`}>
                            <span className="material-icons-outlined text-sm mr-1">{badge.icon}</span>
                            {getStatusLabel(trip.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(trip.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/trips/${trip._id}`}
                            className="text-blue-600 hover:text-blue-900 font-semibold flex items-center space-x-1 group"
                          >
                            <span>View</span>
                            <span className="material-icons-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-3 sm:space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {filteredTrips.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="flex flex-col items-center space-y-3">
                <span className="material-icons-outlined text-6xl text-gray-300">inbox</span>
                <p className="text-gray-500 font-medium">No trips found</p>
              </div>
            </div>
          ) : (
            filteredTrips.map((trip, index) => {
              const badge = getStatusBadge(trip.status);
              return (
                <div
                  key={trip._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-semibold text-gray-900 mb-1 font-mono">
                        Trip #{trip._id.substring(0, 8)}...
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mb-2">
                        {new Date(trip.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${badge.bg} ${badge.text}`}>
                      <span className="material-icons-outlined text-xs sm:text-sm mr-1">{badge.icon}</span>
                      {getStatusLabel(trip.status)}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg mr-2 text-xs">
                        {trip.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">User: </span>
                        <span className="text-gray-900">{trip.user?.name || 'N/A'}</span>
                        {trip.user?.phone && (
                          <span className="text-gray-500 ml-2">({trip.user.phone})</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {trip.driver ? (
                        <>
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg mr-2 text-xs">
                            {trip.driver.name?.charAt(0)?.toUpperCase() || 'D'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Driver: </span>
                            <span className="text-gray-900">{trip.driver.name}</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Driver: Not assigned</span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Type: </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                        {trip.tripType || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Amount: </span>
                      <span className="text-gray-900 font-bold">₹{trip.fareDetails?.totalAmount || trip.payment?.amount || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                    <Link
                      to={`/trips/${trip._id}`}
                      className="text-blue-600 hover:text-blue-900 font-semibold flex items-center space-x-1 group text-xs sm:text-sm"
                    >
                      <span>View Details</span>
                      <span className="material-icons-outlined text-base sm:text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {filteredTrips.length > 0 && (
          <div className="text-xs sm:text-sm text-gray-500 font-medium animate-fade-in" style={{ animationDelay: '300ms' }}>
            Showing {filteredTrips.length} of {trips.length} trip{filteredTrips.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Trips;
