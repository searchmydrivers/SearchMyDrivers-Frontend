const CACHE = new Map();
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const getAddressFromCoordinates = async (lat, lng) => {
  if (!lat || !lng) return null;

  // Create a cache key
  const key = `${lat},${lng}`;

  // Return cached result if available
  if (CACHE.has(key)) {
    return CACHE.get(key);
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      // Prefer the first result which is usually the most specific
      const address = data.results[0].formatted_address;

      // Cache the result
      CACHE.set(key, address);
      return address;
    } else {
      console.warn('Geocoding API returned status:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching address from Google Maps:', error);
    return null;
  }
};
