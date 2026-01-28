import { useState, useEffect } from 'react';
import { getAddressFromCoordinates } from '../../utils/geocoding';

const AddressDisplay = ({ location, className = "", showCity = true }) => {
  // Initial display: DB address + City (if available and requested)
  const getInitialDisplay = () => {
    if (!location) return 'N/A';
    let display = location.address || 'N/A';
    if (showCity && location.city && !display.toLowerCase().includes(location.city.toLowerCase())) {
      display += `, ${location.city}`;
    }
    return display;
  };

  const [displayAddress, setDisplayAddress] = useState(getInitialDisplay());
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchGoogleAddress = async () => {
      // Only fetch if we have coordinates
      if (location?.coordinates?.latitude && location?.coordinates?.longitude) {
        // Optimization: Use a small timeout to allow UI to settle and avoid blocking main thread immediately
        // Also helps if user scrolls fast in a list
        const address = await getAddressFromCoordinates(
          location.coordinates.latitude,
          location.coordinates.longitude
        );

        if (isMounted && address) {
          setDisplayAddress(address);
          setIsFetched(true);
        }
      }
    };

    fetchGoogleAddress();

    return () => {
      isMounted = false;
    };
  }, [location?.coordinates?.latitude, location?.coordinates?.longitude]);

  return (
    <div className={className} title={displayAddress}>
      {displayAddress}
      {/* Optional: Indicator that it's a Google Maps address */}
      {/* {isFetched && <span className="ml-1 text-[10px] text-green-600 inline-block" title="Verified by Google Maps">✓</span>} */}
    </div>
  );
};

export default AddressDisplay;
