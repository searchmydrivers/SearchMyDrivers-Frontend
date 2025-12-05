import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import { tripService } from '../services/tripService';

const TripBookings = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTrips();
  }, [filter, pagination.page]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 10,
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await tripService.getAllTrips(params);
      // Response structure: { success: true, data: { trips: [], count, page, limit, totalPages } }
      const responseData = response?.data || {};
      setTrips(responseData.trips || []);
      setPagination({
        page: responseData.page || 1,
        totalPages: responseData.totalPages || 1,
        total: responseData.total || 0,
        limit: responseData.limit || 10,
      });
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'driver-assigned': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Driver Assigned' },
      'pin-verified': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'PIN Verified' },
      'in-progress': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'In Progress' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      'payment-pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Payment Pending' },
      'payment-completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Payment Completed' },
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Unknown' };
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleViewTrip = (tripId) => {
    // Navigate to trip details page
    window.location.href = `/trip-bookings/${tripId}`;
  };

  const handleCancelTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to cancel this trip? This action cannot be undone.')) {
      return;
    }

    try {
      setCancelling(true);
      setError('');
      setSuccess('');
      const response = await tripService.cancelTripByAdmin(tripId);
      if (response.success) {
        setSuccess('Trip cancelled successfully');
        // Refresh trips list
        await fetchTrips();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to cancel trip');
      }
    } catch (error) {
      console.error('Error cancelling trip:', error);
      setError(error.response?.data?.message || 'Failed to cancel trip');
    } finally {
      setCancelling(false);
    }
  };

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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center animate-fade-in">
            <span className="material-icons-outlined mr-2">error_outline</span>
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <span className="material-icons-outlined">close</span>
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center animate-fade-in">
            <span className="material-icons-outlined mr-2">check_circle</span>
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">
              <span className="material-icons-outlined">close</span>
            </button>
          </div>
        )}
       

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('pending')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                filter === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleFilterChange('driver-assigned')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                filter === 'driver-assigned'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Driver Assigned
            </button>
            <button
              onClick={() => handleFilterChange('in-progress')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                filter === 'in-progress'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => handleFilterChange('completed')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                filter === 'completed'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => handleFilterChange('cancelled')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                filter === 'cancelled'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Cancelled
            </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in" style={{ animationDelay: '100ms' }}>
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
                    Route
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Module/Type
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
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-3">
                        <span className="material-icons-outlined text-6xl text-gray-300">inbox</span>
                        <p className="text-gray-500 font-medium">No trips found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  trips.map((trip, index) => (
                    <tr key={trip._id} className="hover:bg-gray-50 transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{trip._id?.slice(-6) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.user?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.driver?.name || 'Not Assigned'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{trip.pickupLocation?.address || 'N/A'}</div>
                          <div className="text-gray-500">→ {trip.dropLocation?.address || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <span className="font-medium">{trip.module === 'incity' ? 'InCity' : 'OutStation'}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {trip.tripType === 'one-way' ? 'One-Way' : 'Round-Trip'}
                        </div>
                        {trip.cancellationPenalty?.penaltyApplied && (
                          <div className="text-xs text-red-600 mt-1">
                            Penalty: ₹{trip.cancellationPenalty.userPenaltyAmount > 0 
                              ? trip.cancellationPenalty.userPenaltyAmount.toFixed(2)
                              : trip.cancellationPenalty.driverPenaltyAmount > 0
                                ? trip.cancellationPenalty.driverPenaltyAmount.toFixed(2)
                                : '0.00'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        <div>
                          ₹{trip.fareDetails?.totalAmount > 0 
                            ? trip.fareDetails.totalAmount.toFixed(2) 
                            : trip.totalEstimatedFare 
                              ? trip.totalEstimatedFare.toFixed(2) 
                              : '0.00'}
                        </div>
                        {trip.fareDetails?.totalAmount > 0 && (
                          <div className="text-xs text-gray-500 font-normal">Final</div>
                        )}
                        {trip.fareDetails?.totalAmount === 0 && trip.totalEstimatedFare && (
                          <div className="text-xs text-gray-500 font-normal">Estimated</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(trip.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewTrip(trip._id)}
                          className="text-blue-600 hover:text-blue-900 mr-3 font-semibold"
                        >
                          View
                        </button>
                        {!['completed', 'payment-completed', 'cancelled'].includes(trip.status) && (
                          <button
                            onClick={() => handleCancelTrip(trip._id)}
                            disabled={cancelling}
                            className="text-red-600 hover:text-red-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancelling ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-3 sm:space-y-4">
          {trips.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-12 text-center animate-fade-in">
              <div className="flex flex-col items-center space-y-3">
                <span className="material-icons-outlined text-6xl text-gray-300">inbox</span>
                <p className="text-gray-500 font-medium">No trips found</p>
              </div>
            </div>
          ) : (
            trips.map((trip, index) => (
              <div
                key={trip._id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                      Trip #{trip._id?.slice(-6) || 'N/A'}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mb-2">
                      {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div>{getStatusBadge(trip.status)}</div>
                </div>
                <div className="space-y-2 mb-3 text-xs sm:text-sm">
                  <div>
                    <span className="font-medium text-gray-700">User: </span>
                    <span className="text-gray-900">{trip.user?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Driver: </span>
                    <span className="text-gray-900">{trip.driver?.name || 'Not Assigned'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">From: </span>
                    <span className="text-gray-900">{trip.pickupLocation?.address || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">To: </span>
                    <span className="text-gray-900">{trip.dropLocation?.address || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Module: </span>
                    <span className="text-gray-900">{trip.module === 'incity' ? 'InCity' : 'OutStation'} • {trip.tripType === 'one-way' ? 'One-Way' : 'Round-Trip'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Amount: </span>
                    <span className="text-gray-900 font-semibold">
                      ₹{trip.fareDetails?.totalAmount > 0 
                        ? trip.fareDetails.totalAmount.toFixed(2) 
                        : trip.totalEstimatedFare 
                          ? trip.totalEstimatedFare.toFixed(2) 
                          : '0.00'}
                    </span>
                    {trip.fareDetails?.totalAmount > 0 && (
                      <span className="text-xs text-gray-500 ml-1">(Final)</span>
                    )}
                    {trip.fareDetails?.totalAmount === 0 && trip.totalEstimatedFare && (
                      <span className="text-xs text-gray-500 ml-1">(Estimated)</span>
                    )}
                  </div>
                  {trip.cancellationPenalty?.penaltyApplied && (
                    <div>
                      <span className="font-medium text-red-700">Penalty: </span>
                      <span className="text-red-900 font-semibold">
                        ₹{trip.cancellationPenalty.userPenaltyAmount > 0 
                          ? trip.cancellationPenalty.userPenaltyAmount.toFixed(2)
                          : trip.cancellationPenalty.driverPenaltyAmount > 0
                            ? trip.cancellationPenalty.driverPenaltyAmount.toFixed(2)
                            : '0.00'}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({trip.cancellationPenalty.cancelledBy === 'user' ? 'User' : 'Driver'} cancelled)
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleViewTrip(trip._id)}
                    className="text-blue-600 hover:text-blue-900 font-semibold text-xs sm:text-sm"
                  >
                    View
                  </button>
                  {!['completed', 'payment-completed', 'cancelled'].includes(trip.status) && (
                    <button
                      onClick={() => handleCancelTrip(trip._id)}
                      disabled={cancelling}
                      className="text-red-600 hover:text-red-900 font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} trips
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center space-x-1 ${
                  pagination.page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                <span className="material-icons-outlined text-base sm:text-lg">chevron_left</span>
                <span className="hidden sm:inline">Previous</span>
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm ${
                        pagination.page === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center space-x-1 ${
                  pagination.page === pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="material-icons-outlined text-base sm:text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {pagination.totalPages <= 1 && (
          <div className="mt-4 text-xs sm:text-sm text-gray-500">
            Showing {trips.length} of {pagination.total} trips
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TripBookings;
