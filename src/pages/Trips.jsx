import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { tripService } from '../services/tripService';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchTrips();
  }, [statusFilter, pagination.page, searchTerm]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: ITEMS_PER_PAGE,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await tripService.getAllTrips(params);
      const data = response.data || {};
      setTrips(data.trips || []);
      setPagination({
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
        limit: data.limit || ITEMS_PER_PAGE,
      });
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'schedule' },
      'driver-assigned': { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'person_add' },
      'in-progress': { bg: 'bg-purple-100', text: 'text-purple-800', icon: 'directions_car' },
      completed: { bg: 'bg-[#2BB673]/10', text: 'text-[#2BB673]', icon: 'check_circle' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: 'cancel' },
      'payment-completed': { bg: 'bg-[#0B2C4D]/10', text: 'text-[#0B2C4D]', icon: 'payment' },
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
      'payment-completed': 'Paid',
    };
    return labels[status] || status;
  };

  if (loading && trips.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium">Loading trips...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Trips Management</h1>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by trip ID, user, or driver..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] w-full text-sm transition-all shadow-sm"
            />
            <span className="material-icons-outlined absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">search</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All', activeClass: 'from-[#0B2C4D] to-[#254f7a]' },
              { id: 'pending', label: 'Pending', activeClass: 'from-yellow-400 to-yellow-600' },
              { id: 'in-progress', label: 'In Progress', activeClass: 'from-purple-500 to-purple-600' },
              { id: 'completed', label: 'Completed', activeClass: 'from-[#2BB673] to-[#239960]' },
              { id: 'cancelled', label: 'Cancelled', activeClass: 'from-red-500 to-red-600' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleStatusFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 text-xs shadow-sm ${statusFilter === filter.id
                  ? `bg-gradient-to-r ${filter.activeClass} text-white shadow-md transform scale-[1.02]`
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#0B2C4D]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Trip ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Driver</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <span className="material-icons-outlined text-4xl text-gray-300">inbox</span>
                        <p className="text-gray-500 font-medium text-sm">No trips found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  trips.map((trip, index) => {
                    const badge = getStatusBadge(trip.status);
                    return (
                      <tr
                        key={trip._id}
                        className="hover:bg-gray-50 transition-colors duration-200 animate-fade-in group"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs font-bold text-gray-900 font-mono">
                            {trip.tripId ? `#${trip.tripId}` : trip._id.substring(0, 8) + '...'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#0B2C4D] to-[#1a3a5a] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm mr-2.5">
                              {trip.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-gray-900 group-hover:text-[#0B2C4D] transition-colors truncate max-w-[100px]">{trip.user?.name || 'Unknown'}</div>
                              <div className="text-[10px] text-gray-500 truncate max-w-[100px]">{trip.user?.phone || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {trip.driver ? (
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-[#2BB673] to-[#239960] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm mr-2.5">
                                {trip.driver.name?.charAt(0)?.toUpperCase() || 'D'}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-gray-900 truncate max-w-[100px]">{trip.driver.name}</div>
                                <div className="text-[10px] text-gray-500 truncate max-w-[100px]">{trip.driver?.phone || ''}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic flex items-center">
                              <span className="material-icons-outlined text-sm mr-1">person_off</span>
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-[#0B2C4D]">
                            <span className="material-icons-outlined text-xs mr-1">route</span>
                            {trip.tripType || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs font-bold text-gray-900">
                            ₹{trip.fareDetails?.totalAmount || trip.totalEstimatedFare || 0}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 inline-flex items-center text-[10px] uppercase font-bold tracking-wide rounded ${badge.bg} ${badge.text}`}>
                            <span className="material-icons-outlined text-xs mr-1">{badge.icon}</span>
                            {getStatusLabel(trip.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                          {new Date(trip.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/trips/${trip._id}`}
                            className="text-[#0B2C4D] hover:text-[#2BB673] font-semibold flex items-center justify-end transition-colors p-1.5 rounded-full hover:bg-gray-100"
                          >
                            <span className="material-icons-outlined text-lg">visibility</span>
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
          {trips.map((trip, index) => {
            const badge = getStatusBadge(trip.status);
            return (
              <div
                key={trip._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 mb-1 font-mono">
                      {trip.tripId ? `#${trip.tripId}` : `#${trip._id.substring(0, 8)}...`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(trip.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                    {getStatusLabel(trip.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-3">
                  <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                    <div className="w-8 h-8 bg-[#0B2C4D] rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                      {trip.user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold">User</div>
                      <div className="text-sm font-bold text-gray-900">{trip.user?.name || 'N/A'}</div>
                    </div>
                  </div>

                  {trip.driver && (
                    <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                      <div className="w-8 h-8 bg-[#2BB673] rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                        {trip.driver.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Driver</div>
                        <div className="text-sm font-bold text-gray-900">{trip.driver.name}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-sm font-bold text-gray-900">
                    ₹{trip.fareDetails?.totalAmount || trip.totalEstimatedFare || 0}
                  </div>
                  <Link
                    to={`/trips/${trip._id}`}
                    className="text-[#0B2C4D] hover:text-[#2BB673] font-semibold flex items-center space-x-1 text-sm"
                  >
                    <span>View Details</span>
                    <span className="material-icons-outlined text-lg">arrow_forward</span>
                  </Link>
                </div>
              </div>
            );
          })}
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
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center space-x-1 ${pagination.page === 1
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
                      className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm ${pagination.page === pageNum
                        ? 'bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white shadow-lg'
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
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center space-x-1 ${pagination.page === pagination.totalPages
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
      </div>
    </Layout>
  );
};

export default Trips;
