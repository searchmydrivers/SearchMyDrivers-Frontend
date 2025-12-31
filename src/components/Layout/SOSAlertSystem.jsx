import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../../services/socketService'; // Assuming we have a socket service wrapper


const SOSAlertSystem = () => {
  const [alert, setAlert] = useState(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Audio with a more reliable approach
    try {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audioRef.current.loop = true;
      audioRef.current.preload = 'auto';
    } catch (e) {
      console.error('Audio initialization error:', e);
    }

    const handleSOSAlert = (data) => {
      console.log('🚨 SOS ALERT RECEIVED IN COMPONENT:', data);

      // Force state update strictly
      setAlert(prev => {
        // Prevent duplicate alerts if id matches (optional logic)
        if (prev && prev.sosId === data.sosId) return prev;
        return data;
      });

      // Attempt audio play
      if (audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log('🔊 SOS Siren Playing'))
            .catch(error => {
              console.error('⚠️ Audio play prevented by browser policy (Click to enable):', error);
              // We could show a visual "Click to unmute" button here if needed
            });
        }
      }
    };

    console.log('🔌 SOSAlertSystem: Listening for "admin-sos-alert"');
    // Listen for socket event using the service wrapper
    socketService.on('admin-sos-alert', handleSOSAlert);

    return () => {
      console.log('🔌 SOSAlertSystem: Unmounting/Cleaning up');
      socketService.off('admin-sos-alert', handleSOSAlert);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleAcknowledge = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Navigate to details or just close for now
    // Ideally we navigate to a map or trip details
    if (alert?.tripId) {
      navigate(`/trip-bookings/${alert.tripId}`);
    }

    // We will just clear it for the popup, but maybe keep a small indicator? 
    // For this implementation, we close the popup.
    setAlert(null);
  };

  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-red-900/40 backdrop-blur-sm animate-pulse">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-4 border-red-600 animate-bounce-slight text-center relative overflow-hidden">

        {/* Background Animation */}
        <div className="absolute inset-0 bg-red-500/10 animate-ping opacity-20"></div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-icons-outlined text-5xl text-red-600 animate-pulse">
              notifications_active
            </span>
          </div>

          <h2 className="text-3xl font-bold text-red-700 mb-2">CRITICAL ALERT</h2>
          <p className="text-xl font-semibold text-gray-800 mb-4">
            SOS Triggered by {alert.triggeredByName || alert.triggeredBy?.toUpperCase()}
          </p>

          <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6 text-left">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-bold">Message:</span> {alert.message || 'Emergency reported'}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-bold">Trip ID:</span> {alert.tripId}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-bold">Time:</span> {new Date(alert.timestamp).toLocaleTimeString()}
            </p>
          </div>

          <button
            onClick={handleAcknowledge}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            ACKNOWLEDGE & VIEW DETAILS
          </button>
        </div>
      </div>
    </div>
  );
};

export default SOSAlertSystem;
