import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { tripService } from '../services/tripService';
import io from 'socket.io-client';

const TripDetails = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverLocationAddress, setDriverLocationAddress] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const socketRef = useRef(null);
  const adminDataRef = useRef(null);

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  // Socket.io connection setup
  useEffect(() => {
    // Get admin data from localStorage
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
    adminDataRef.current = adminData;
    const adminId = adminData._id || adminData.id;

    if (!adminId) return;

    // Get API base URL
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const socketURL = API_BASE_URL.includes('/api')
      ? API_BASE_URL.replace('/api', '')
      : API_BASE_URL;

    console.log('🔌 [ADMIN] Connecting to socket:', socketURL);

    // Connect to socket
    socketRef.current = io(socketURL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('✅ [ADMIN] Socket connected');
      socketRef.current.emit('join-room', {
        adminId: adminId,
        role: 'admin',
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ [ADMIN] Socket disconnected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ [ADMIN] Socket connection error:', error);
    });

    // Listen for driver location updates
    socketRef.current.on('driver-location-updated', async (data) => {
      console.log('📍 [ADMIN] Driver location received:', data);
      if (data.tripId === tripId) {
        setDriverLocation(data.location);
        setLoadingLocation(false);
        // Get address from coordinates
        await fetchLocationAddress(data.location.latitude, data.location.longitude);
        setSuccess('Driver location received');
        setTimeout(() => setSuccess(''), 3000);
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await tripService.getTripById(tripId);
      if (response.success && response.data.trip) {
        setTrip(response.data.trip);
      } else {
        setError('Failed to load trip details');
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
      setError(error.response?.data?.message || 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBEIm7hwzYIXr2Dwxb31Xh8GsJ1JQzP7xY`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setDriverLocationAddress(data.results[0].formatted_address);
      } else {
        setDriverLocationAddress('Address not available');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setDriverLocationAddress('Unable to fetch address');
    }
  };

  const handleCancelTrip = async () => {
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
        setTimeout(() => {
          navigate('/trip-bookings');
        }, 2000);
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

  const handleRequestDriverLocation = async () => {
    if (!trip || !trip.driver) {
      setError('No driver assigned to this trip');
      return;
    }

    try {
      setLoadingLocation(true);
      setError('');
      setSuccess('');
      setDriverLocation(null);
      setDriverLocationAddress('');

      const response = await tripService.requestDriverLocation(tripId);
      if (response.success) {
        setSuccess('Location request sent to driver. Waiting for response...');
        setTimeout(() => {
          if (loadingLocation) {
            setLoadingLocation(false);
            setError('Driver did not respond. Please try again.');
          }
        }, 30000);
      } else {
        setError(response.message || 'Failed to request driver location');
        setLoadingLocation(false);
      }
    } catch (error) {
      console.error('Error requesting driver location:', error);
      setError(error.response?.data?.message || 'Failed to request driver location');
      setLoadingLocation(false);
    }
  };

  const handleShowMap = () => {
    if (driverLocation) {
      setShowMap(!showMap);
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium">Loading trip details...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500 font-medium">Trip not found</p>
            <button
              onClick={() => navigate('/trip-bookings')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Trips
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
          <div>
            <button
              onClick={() => navigate('/trip-bookings')}
              className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="material-icons-outlined">arrow_back</span>
              <span>Back to Trips</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Trip Details</h1>
            <p className="text-sm sm:text-base text-gray-500">Trip ID: #{trip._id?.slice(-8)}</p>
          </div>
          {!['completed', 'payment-completed', 'cancelled'].includes(trip.status) && (
            <button
              onClick={handleCancelTrip}
              disabled={cancelling}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {cancelling ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <span className="material-icons-outlined">cancel</span>
                  <span>Cancel Trip</span>
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center animate-slide-in">
            <span className="material-icons-outlined mr-2 text-red-500">error</span>
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
              <span className="material-icons-outlined">close</span>
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg flex items-center animate-slide-in">
            <span className="material-icons-outlined mr-2 text-green-500">check_circle</span>
            <span className="font-medium">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">
              <span className="material-icons-outlined">close</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Trip Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-2">
              Trip Information
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <div className="mt-1">{getStatusBadge(trip.status)}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Module:</span>
                <p className="text-sm text-gray-900 capitalize">{trip.module || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Trip Type:</span>
                <p className="text-sm text-gray-900 capitalize">{trip.tripType || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Scheduled Time:</span>
                <p className="text-sm text-gray-900">
                  {trip.scheduledTime ? new Date(trip.scheduledTime).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Created At:</span>
                <p className="text-sm text-gray-900">
                  {trip.createdAt ? new Date(trip.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              {trip.tripStartTime && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Trip Start Time:</span>
                  <p className="text-sm text-gray-900">{new Date(trip.tripStartTime).toLocaleString()}</p>
                </div>
              )}
              {trip.tripEndTime && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Trip End Time:</span>
                  <p className="text-sm text-gray-900">{new Date(trip.tripEndTime).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* User & Driver Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-2">
              User & Driver
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-600">User:</span>
                <p className="text-sm text-gray-900">{trip.user?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500">{trip.user?.phone || ''}</p>
                <p className="text-xs text-gray-500">{trip.user?.email || ''}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Driver:</span>
                {trip.driver ? (
                  <>
                    <p className="text-sm text-gray-900">{trip.driver.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{trip.driver.phone || ''}</p>
                    <p className="text-xs text-gray-500">
                      Rating: {trip.driver.rating || 0} • {trip.driver.workLocation || ''}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Not Assigned</p>
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Vehicle:</span>
                <p className="text-sm text-gray-900">
                  {trip.vehicle?.vehicleNumber || 'N/A'} • {trip.vehicle?.carBrand || ''}{' '}
                  {trip.vehicle?.carType || ''}
                </p>
                <p className="text-xs text-gray-500">{trip.vehicle?.transmissionMode || ''}</p>
              </div>
              {trip.driverPin && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Driver PIN:</span>
                  <p className="text-sm text-gray-900 font-mono">{trip.driverPin}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-600">PIN Verified:</span>
                <p className="text-sm text-gray-900">{trip.pinVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Pickup Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-2">
              Pickup Location
            </h2>
            <div>
              <p className="text-sm text-gray-900 font-medium">{trip.pickupLocation?.address || 'N/A'}</p>
              <p className="text-xs text-gray-500">
                {trip.pickupLocation?.city || ''}, {trip.pickupLocation?.state || ''}
              </p>
              <p className="text-xs text-gray-500">Pincode: {trip.pickupLocation?.pincode || 'N/A'}</p>
              {trip.pickupLocation?.coordinates && (
                <p className="text-xs text-gray-400 mt-1">
                  Lat: {trip.pickupLocation.coordinates.latitude?.toFixed(6)}, Lng:{' '}
                  {trip.pickupLocation.coordinates.longitude?.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Drop Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-2">
              Drop Location
            </h2>
            <div>
              <p className="text-sm text-gray-900 font-medium">{trip.dropLocation?.address || 'N/A'}</p>
              <p className="text-xs text-gray-500">
                {trip.dropLocation?.city || ''}, {trip.dropLocation?.state || ''}
              </p>
              <p className="text-xs text-gray-500">Pincode: {trip.dropLocation?.pincode || 'N/A'}</p>
              {trip.dropLocation?.coordinates && (
                <p className="text-xs text-gray-400 mt-1">
                  Lat: {trip.dropLocation.coordinates.latitude?.toFixed(6)}, Lng:{' '}
                  {trip.dropLocation.coordinates.longitude?.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Route Information */}
          {trip.googleMapsData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-2">
                Route Information
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Distance:</span>
                  <p className="text-sm text-gray-900">{trip.googleMapsData.distance?.text || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Duration:</span>
                  <p className="text-sm text-gray-900">{trip.googleMapsData.duration?.text || 'N/A'}</p>
                </div>
                {trip.googleMapsData.roundTripDuration && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Round Trip Duration:</span>
                    <p className="text-sm text-gray-900">
                      {trip.googleMapsData.roundTripDuration.text || 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fare Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-2">
              Fare Information
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Estimated Fare:</span>
                <p className="text-sm text-gray-900 font-semibold">
                  ₹{trip.totalEstimatedFare ? trip.totalEstimatedFare.toFixed(2) : '0.00'}
                </p>
              </div>
              {trip.fareDetails?.totalAmount > 0 && (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Final Fare:</span>
                    <p className="text-sm text-gray-900 font-semibold">
                      ₹{trip.fareDetails.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                    <p>Base: ₹{trip.fareDetails.baseAmount?.toFixed(2) || '0.00'}</p>
                    <p>Distance: ₹{trip.fareDetails.distanceAmount?.toFixed(2) || '0.00'}</p>
                    <p>
                      Waiting Time: ₹{trip.fareDetails.waitingTimeAmount?.toFixed(2) || '0.00'} (
                      {trip.fareDetails.waitingTimeMinutes || 0} min)
                    </p>
                    <p>Night Charge: ₹{trip.fareDetails.nightCharge?.toFixed(2) || '0.00'}</p>
                    <p className="pt-2 border-t">
                      Admin Commission: ₹{trip.fareDetails.adminCommission?.toFixed(2) || '0.00'}
                    </p>
                    <p className="font-semibold">
                      Driver Amount: ₹{trip.fareDetails.driverAmount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </>
              )}
              {trip.previousTripPenalty > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Previous Trip Penalty:</span>
                  <p className="text-sm text-red-600 font-semibold">
                    ₹{trip.previousTripPenalty.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Penalty */}
          {trip.cancellationPenalty?.penaltyApplied && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-red-800 mb-4 sm:mb-6 border-b border-red-200 pb-2">
                Cancellation Penalty
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Cancelled By:</span>
                  <p className="text-sm text-gray-900 capitalize">
                    {trip.cancellationPenalty.cancelledBy || 'N/A'}
                  </p>
                </div>
                {trip.cancellationPenalty.cancelledAt && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Cancelled At:</span>
                    <p className="text-sm text-gray-900">
                      {new Date(trip.cancellationPenalty.cancelledAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {trip.cancellationPenalty.userPenaltyAmount > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">User Penalty:</span>
                    <p className="text-sm text-red-600 font-semibold">
                      ₹{trip.cancellationPenalty.userPenaltyAmount.toFixed(2)}
                    </p>
                  </div>
                )}
                {trip.cancellationPenalty.driverPenaltyAmount > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Driver Penalty:</span>
                    <p className="text-sm text-red-600 font-semibold">
                      ₹{trip.cancellationPenalty.driverPenaltyAmount.toFixed(2)}
                    </p>
                  </div>
                )}
                {trip.cancellationPenalty.driverCompensationAmount > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Driver Compensation:</span>
                    <p className="text-sm text-green-600 font-semibold">
                      ₹{trip.cancellationPenalty.driverCompensationAmount.toFixed(2)}
                    </p>
                  </div>
                )}
                {trip.cancellationPenalty.penaltyReason && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Reason:</span>
                    <p className="text-xs text-gray-600">{trip.cancellationPenalty.penaltyReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          {trip.razorpayOrderId && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-2">
                Payment Information
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Razorpay Order ID:</span>
                  <p className="text-sm text-gray-900 font-mono text-xs">{trip.razorpayOrderId}</p>
                </div>
                {trip.razorpayPaymentId && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Razorpay Payment ID:</span>
                    <p className="text-sm text-gray-900 font-mono text-xs">{trip.razorpayPaymentId}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Driver Location Section */}
          {trip.driver && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:col-span-2">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Driver Current Location</h2>
                <button
                  onClick={handleRequestDriverLocation}
                  disabled={loadingLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loadingLocation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Requesting...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-icons-outlined text-base">location_on</span>
                      <span>Get Driver Location</span>
                    </>
                  )}
                </button>
              </div>

              {loadingLocation && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600">Waiting for driver location...</p>
                  </div>
                </div>
              )}

              {driverLocation && !loadingLocation && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="material-icons-outlined text-green-600">location_on</span>
                          <span className="text-sm font-semibold text-green-800">Location Received</span>
                        </div>
                        {driverLocationAddress ? (
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium text-gray-600">Address:</span>
                              <p className="text-sm text-gray-900 font-medium mt-1">{driverLocationAddress}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-500">Address not available</p>
                          </div>
                        )}
                        {driverLocation.lastUpdated && (
                          <p className="text-xs text-gray-500 mt-2">
                            Last Updated: {new Date(driverLocation.lastUpdated).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleShowMap}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center space-x-1 ml-4"
                      >
                        <span className="material-icons-outlined text-base">map</span>
                        <span>{showMap ? 'Hide Map' : 'Show on Map'}</span>
                      </button>
                    </div>
                  </div>

                  {showMap && driverLocation && (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-800">Driver Location on Map</h5>
                      </div>
                      <div className="w-full h-96">
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBEIm7hwzYIXr2Dwxb31Xh8GsJ1JQzP7xY&q=${driverLocation.latitude},${driverLocation.longitude}&zoom=15`}
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!driverLocation && !loadingLocation && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <span className="material-icons-outlined text-4xl text-gray-300 mb-2 block">
                    location_off
                  </span>
                  <p>Click "Get Driver Location" to request current location from driver</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TripDetails;

