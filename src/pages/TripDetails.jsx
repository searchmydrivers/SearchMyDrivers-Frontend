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
      'driver-assigned': { bg: 'bg-[#0B2C4D]/10', text: 'text-[#0B2C4D]', label: 'Driver Assigned' },
      'pin-verified': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'PIN Verified' },
      'in-progress': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'In Progress' },
      completed: { bg: 'bg-[#2BB673]/10', text: 'text-[#2BB673]', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      'payment-pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Payment Pending' },
      'payment-completed': { bg: 'bg-[#2BB673]/20', text: 'text-[#2BB673]', label: 'Payment Completed' },
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Unknown' };
    return (
      <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold uppercase tracking-wide rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium text-xs">Loading trip details...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-8">
          <span className="material-icons-outlined text-4xl text-gray-300 mb-2 block">route</span>
          <p className="text-gray-500 text-sm font-medium mb-3">Trip not found</p>
          <button
            onClick={() => navigate('/trip-bookings')}
            className="px-4 py-2 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 shadow-sm font-semibold text-xs"
          >
            Back to Trips
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <button
              onClick={() => navigate('/trip-bookings')}
              className="text-[#0B2C4D] hover:text-[#254f7a] font-semibold flex items-center space-x-1.5 transition-colors group mb-1.5 text-xs sm:text-sm"
            >
              <span className="material-icons-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span>Back to Trips</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-0.5">Trip Details</h1>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="font-medium">{trip.tripId ? `#${trip.tripId}` : `#${trip._id?.slice(-8)}`}</span>
              <span>•</span>
              <span className="font-medium text-gray-700">{getStatusBadge(trip.status)}</span>
            </div>
          </div>
          {!['completed', 'payment-completed', 'cancelled'].includes(trip.status) && (
            <button
              onClick={handleCancelTrip}
              disabled={cancelling}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 text-xs uppercase tracking-wide"
            >
              {cancelling ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <span className="material-icons-outlined text-sm">cancel</span>
                  <span>Cancel Trip</span>
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center animate-fade-in text-xs">
            <span className="material-icons-outlined mr-2 text-sm">error_outline</span>
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <span className="material-icons-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center animate-fade-in text-xs">
            <span className="material-icons-outlined mr-2 text-sm">check_circle</span>
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">
              <span className="material-icons-outlined text-sm">close</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Trip Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center border-b border-gray-100 pb-2">
              <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">info</span>
              Trip Information
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <span className="text-gray-500 font-medium">Trip ID</span>
                <p className="text-gray-900 font-bold">{trip.tripId ? `#${trip.tripId}` : (trip._id || 'N/A')}</p>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <span className="text-gray-500 font-medium">Status</span>
                <div>{getStatusBadge(trip.status)}</div>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <span className="text-gray-500 font-medium">Module</span>
                <p className="text-gray-900 capitalize font-medium">{trip.module || 'N/A'}</p>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <span className="text-gray-500 font-medium">Trip Type</span>
                <p className="text-gray-900 capitalize font-medium">{trip.tripType || 'N/A'}</p>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <span className="text-gray-500 font-medium">Scheduled Time</span>
                <p className="text-gray-900 font-medium">
                  {trip.scheduledTime ? new Date(trip.scheduledTime).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <span className="text-gray-500 font-medium">Created At</span>
                <p className="text-gray-900 font-medium">
                  {trip.createdAt ? new Date(trip.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              {trip.tripStartTime && (
                <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                  <span className="text-gray-500 font-medium">Start Time</span>
                  <p className="text-gray-900 font-medium">{new Date(trip.tripStartTime).toLocaleString()}</p>
                </div>
              )}
              {trip.tripEndTime && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">End Time</span>
                  <p className="text-gray-900 font-medium">{new Date(trip.tripEndTime).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* User & Driver Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center border-b border-gray-100 pb-2">
              <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">people</span>
              User & Driver
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-2">
                <span className="text-gray-500 font-medium w-20">User</span>
                <div className="text-right">
                  <p className="text-gray-900 font-bold">{trip.user?.name || 'N/A'}</p>
                  <p className="text-gray-500">{trip.user?.phone || ''}</p>
                  <p className="text-[10px] text-gray-400">{trip.user?.email || ''}</p>
                </div>
              </div>
              <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-2">
                <span className="text-gray-500 font-medium w-20">Driver</span>
                <div className="text-right">
                  {trip.driver ? (
                    <>
                      <p className="text-gray-900 font-bold">{trip.driver.name || 'N/A'}</p>
                      <p className="text-gray-500">{trip.driver.phone || ''}</p>
                      <div className="flex items-center justify-end space-x-1 text-[10px] text-gray-400 mt-0.5">
                        <span className="material-icons-outlined text-yellow-500 text-[10px]">star</span>
                        <span>{trip.driver.rating || 0}</span>
                        <span>• {trip.driver.workLocation || ''}</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">Not Assigned</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-start text-xs">
                <span className="text-gray-500 font-medium w-20">Vehicle</span>
                <div className="text-right">
                  <p className="text-gray-900 font-medium">
                    {trip.vehicle?.vehicleNumber || 'N/A'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {trip.vehicle?.carBrand || ''} {trip.vehicle?.carType || ''}
                    {trip.vehicle?.transmissionMode && ` • ${trip.vehicle.transmissionMode}`}
                  </p>
                </div>
              </div>

              {trip.driverPin && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">Verification PIN</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-mono font-bold text-blue-900 tracking-widest">{trip.driverPin}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${trip.pinVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {trip.pinVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="material-icons-outlined text-blue-600 text-base">lock</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pickup Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center border-b border-gray-100 pb-2">
              <span className="material-icons-outlined text-lg mr-2 text-[#2BB673]">location_on</span>
              Pickup Location
            </h2>
            <div>
              <p className="text-xs text-gray-900 font-medium leading-relaxed">{trip.pickupLocation?.address || 'N/A'}</p>
              <p className="text-[10px] text-gray-500 mt-1">
                {trip.pickupLocation?.city || ''}, {trip.pickupLocation?.state || ''} - {trip.pickupLocation?.pincode || 'N/A'}
              </p>
              {trip.pickupLocation?.coordinates && (
                <p className="text-[9px] text-gray-400 mt-0.5 font-mono">
                  {trip.pickupLocation.coordinates.latitude?.toFixed(6)}, {trip.pickupLocation.coordinates.longitude?.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Drop Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '250ms' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center border-b border-gray-100 pb-2">
              <span className="material-icons-outlined text-lg mr-2 text-red-600">place</span>
              Drop Location
            </h2>
            <div>
              <p className="text-xs text-gray-900 font-medium leading-relaxed">{trip.dropLocation?.address || 'N/A'}</p>
              <p className="text-[10px] text-gray-500 mt-1">
                {trip.dropLocation?.city || ''}, {trip.dropLocation?.state || ''} - {trip.dropLocation?.pincode || 'N/A'}
              </p>
              {trip.dropLocation?.coordinates && (
                <p className="text-[9px] text-gray-400 mt-0.5 font-mono">
                  {trip.dropLocation.coordinates.latitude?.toFixed(6)}, {trip.dropLocation.coordinates.longitude?.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Route Information */}
          {trip.googleMapsData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center border-b border-gray-100 pb-2">
                <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">route</span>
                Route Information
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-[10px] font-medium text-gray-500 uppercase">Distance</span>
                  <p className="text-sm font-bold text-gray-900">{trip.googleMapsData.distance?.text || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-[10px] font-medium text-gray-500 uppercase">Duration</span>
                  <p className="text-sm font-bold text-gray-900">{trip.googleMapsData.duration?.text || 'N/A'}</p>
                </div>
                {trip.googleMapsData.roundTripDuration && (
                  <div className="col-span-2 bg-gray-50 p-2 rounded border border-gray-100">
                    <span className="text-[10px] font-medium text-gray-500 uppercase">Round Trip Duration</span>
                    <p className="text-sm font-bold text-gray-900">{trip.googleMapsData.roundTripDuration.text || 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fare Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '350ms' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center border-b border-gray-100 pb-2">
              <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">attach_money</span>
              Fare Information
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Estimated Fare</span>
                <p className="text-gray-900 font-bold">
                  ₹{trip.totalEstimatedFare ? trip.totalEstimatedFare.toFixed(2) : '0.00'}
                </p>
              </div>
              {trip.fareDetails?.totalAmount > 0 && (
                <>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-50">
                    <span className="text-gray-500 font-medium">Final Fare</span>
                    <p className="text-green-600 font-bold text-sm">
                      ₹{trip.fareDetails.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-[10px] text-gray-500 space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span>Base</span>
                      <span>₹{trip.fareDetails.baseAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance</span>
                      <span>₹{trip.fareDetails.distanceAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waiting Time ({trip.fareDetails.waitingTimeMinutes || 0} min)</span>
                      <span>₹{trip.fareDetails.waitingTimeAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Night Charge</span>
                      <span>₹{trip.fareDetails.nightCharge?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-dashed border-gray-200">
                      <span>Admin Commission</span>
                      <span>₹{trip.fareDetails.adminCommission?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-700">
                      <span>Driver Amount</span>
                      <span>₹{trip.fareDetails.driverAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </>
              )}
              {trip.previousTripPenalty > 0 && (
                <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-50">
                  <span className="text-red-500 font-medium">Previous Penalty</span>
                  <p className="text-red-600 font-bold">
                    ₹{trip.previousTripPenalty.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Penalty */}
          {trip.cancellationPenalty?.penaltyApplied && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <h2 className="text-sm font-bold text-red-800 mb-3 flex items-center border-b border-red-200 pb-2">
                <span className="material-icons-outlined text-lg mr-2 text-red-600">cancel</span>
                Cancellation Penalty
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Cancelled By</span>
                  <span className="text-gray-900 capitalize font-medium">{trip.cancellationPenalty.cancelledBy || 'N/A'}</span>
                </div>
                {trip.cancellationPenalty.cancelledAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Cancelled At</span>
                    <span className="text-gray-900">{new Date(trip.cancellationPenalty.cancelledAt).toLocaleString()}</span>
                  </div>
                )}
                {trip.cancellationPenalty.userPenaltyAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">User Penalty</span>
                    <span className="text-red-600 font-bold">₹{trip.cancellationPenalty.userPenaltyAmount.toFixed(2)}</span>
                  </div>
                )}
                {trip.cancellationPenalty.driverPenaltyAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Driver Penalty</span>
                    <span className="text-red-600 font-bold">₹{trip.cancellationPenalty.driverPenaltyAmount.toFixed(2)}</span>
                  </div>
                )}
                {trip.cancellationPenalty.driverCompensationAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Driver Compensation</span>
                    <span className="text-green-600 font-bold">₹{trip.cancellationPenalty.driverCompensationAmount.toFixed(2)}</span>
                  </div>
                )}
                {trip.cancellationPenalty.penaltyReason && (
                  <div className="pt-2 mt-2 border-t border-red-100">
                    <span className="text-[10px] text-gray-500 block uppercase font-bold mb-0.5">Reason</span>
                    <p className="text-gray-600">{trip.cancellationPenalty.penaltyReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          {trip.razorpayOrderId && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '450ms' }}>
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center border-b border-gray-100 pb-2">
                <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">payment</span>
                Payment Information
              </h2>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-500 font-medium block mb-0.5">Razorpay Order ID</span>
                  <p className="text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 text-[10px]">{trip.razorpayOrderId}</p>
                </div>
                {trip.razorpayPaymentId && (
                  <div>
                    <span className="text-gray-500 font-medium block mb-0.5">Razorpay Payment ID</span>
                    <p className="text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 text-[10px]">{trip.razorpayPaymentId}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Driver Location Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:col-span-2 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center">
                <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">my_location</span>
                Driver Current Location
              </h2>
              {trip.driver && (
                <button
                  onClick={handleRequestDriverLocation}
                  disabled={loadingLocation}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 text-xs uppercase tracking-wide"
                >
                  {loadingLocation ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Requesting...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-icons-outlined text-sm">location_on</span>
                      <span>Get Location</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {trip.driver ? (
              <>
                {loadingLocation && (
                  <div className="flex items-center justify-center py-6">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-6 h-6 border-2 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-gray-600">Waiting for driver location...</p>
                    </div>
                  </div>
                )}

                {driverLocation && !loadingLocation && (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-1.5 mb-2">
                            <span className="material-icons-outlined text-[#2BB673] text-sm">location_on</span>
                            <span className="text-xs font-bold text-green-800 uppercase tracking-wide">Location Received</span>
                          </div>
                          {driverLocationAddress ? (
                            <div>
                              <span className="text-[10px] font-medium text-gray-500 uppercase block mb-0.5">Address</span>
                              <p className="text-xs text-gray-900 font-medium">{driverLocationAddress}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">Address not available</p>
                          )}
                          {driverLocation.lastUpdated && (
                            <p className="text-[10px] text-gray-400 mt-1">
                              Last Updated: {new Date(driverLocation.lastUpdated).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={handleShowMap}
                          className="px-3 py-1.5 bg-[#0B2C4D] text-white rounded hover:bg-[#254f7a] transition-colors text-xs font-semibold flex items-center space-x-1 ml-3"
                        >
                          <span className="material-icons-outlined text-sm">map</span>
                          <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
                        </button>
                      </div>
                    </div>

                    {showMap && driverLocation && (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="w-full h-80">
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
                  <div className="text-center py-6 text-gray-400">
                    <span className="material-icons-outlined text-3xl mb-1 block opacity-50">
                      location_off
                    </span>
                    <p className="text-xs">Click "Get Location" to request current location</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <span className="material-icons-outlined text-3xl mb-1 block opacity-50">
                  person_off
                </span>
                <p className="text-xs">No driver assigned to this trip.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TripDetails;
