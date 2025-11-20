import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import { tripService } from '../services/tripService';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

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
      pending: 'bg-yellow-100 text-yellow-800',
      'driver-assigned': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'payment-completed': 'bg-green-100 text-green-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading trips...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">All Trips</h1>

        {trips.length === 0 ? (
          <div className="card text-center py-8 sm:py-12">
            <p className="text-gray-500 text-base sm:text-lg">No trips found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trip ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trips.map((trip) => (
                      <tr key={trip._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {trip._id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {trip.user?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{trip.user?.phone || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {trip.driver?.name || 'Not assigned'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trip.tripType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{trip.fareDetails?.totalAmount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                              trip.status
                            )}`}
                          >
                            {trip.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(trip.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip._id}
                  className="card p-4 sm:p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                        Trip #{trip._id.substring(0, 8)}...
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mb-2">
                        {new Date(trip.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                        trip.status
                      )}`}
                    >
                      {trip.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="font-medium text-gray-700">User: </span>
                      <span className="text-gray-900">{trip.user?.name || 'N/A'}</span>
                      {trip.user?.phone && (
                        <span className="text-gray-500 ml-2">({trip.user.phone})</span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Driver: </span>
                      <span className="text-gray-900">{trip.driver?.name || 'Not assigned'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Type: </span>
                      <span className="text-gray-900">{trip.tripType || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Amount: </span>
                      <span className="text-gray-900 font-semibold">₹{trip.fareDetails?.totalAmount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Trips;

