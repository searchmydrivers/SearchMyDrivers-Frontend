import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, DrawingManager, Autocomplete } from '@react-google-maps/api';
import Layout from '../components/Layout/Layout';
import api from '../config/api';
import { toast } from 'react-hot-toast';

const libraries = ['drawing', 'geometry', 'places'];

const ServiceZones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState([]);

  // Map State
  const mapRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries
  });

  const center = useMemo(() => ({ lat: 20.5937, lng: 78.9629 }), []); // India Center

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await api.get('/zones');
      if (res.data.success) {
        setZones(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast.error('Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  const handlePolygonComplete = (polygon) => {
    const path = polygon.getPath();
    const coords = [];
    for (let i = 0; i < path.getLength(); i++) {
      const lat = path.getAt(i).lat();
      const lng = path.getAt(i).lng();
      coords.push([lng, lat]); // GeoJSON expects [lng, lat]
    }
    // Close the loop
    if (coords.length > 0) {
      coords.push(coords[0]);
    }
    setCoordinates(coords);

    // Remove the drawn polygon instance as we store coordinates
    polygon.setMap(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (coordinates.length === 0) {
      toast.error('Please draw a zone on the map');
      return;
    }

    try {
      const payload = {
        name,
        description,
        coordinates, // [[lng, lat], ...]
      };

      if (isEditing && selectedZone) {
        await api.put(`/zones/${selectedZone._id}`, payload);
        toast.success('Zone updated successfully');
      } else {
        await api.post('/zones', payload);
        toast.success('Zone created successfully');
      }

      resetForm();
      fetchZones();
    } catch (error) {
      console.error('Error saving zone:', error);
      toast.error(error.response?.data?.message || 'Failed to save zone');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this zone?')) return;
    try {
      await api.delete(`/zones/${id}`);
      toast.success('Zone deleted');
      fetchZones();
      if (selectedZone?._id === id) resetForm();
    } catch (error) {
      toast.error('Failed to delete zone');
    }
  };

  const startEdit = (zone) => {
    setSelectedZone(zone);
    setName(zone.name);
    setDescription(zone.description || '');

    // Safety check
    const zoneCoords = zone.area?.coordinates?.[0] || [];
    setCoordinates(zoneCoords);

    setIsEditing(true);
    setIsCreating(false);

    // Pan map to the selected zone
    if (mapRef.current && zoneCoords.length > 0) {
      setTimeout(() => {
        try {
          if (!window.google) return;
          const bounds = new window.google.maps.LatLngBounds();
          zoneCoords.forEach(coord => {
            // GeoJSON coordinates are [lng, lat], Google Maps needs {lat, lng}
            bounds.extend({ lat: coord[1], lng: coord[0] });
          });
          mapRef.current.fitBounds(bounds);
        } catch (error) {
          console.error("Error fitting bounds:", error);
        }
      }, 100);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCoordinates([]);
    setIsCreating(false);
    setIsEditing(false);
    setSelectedZone(null);
  };

  const onLoad = useCallback(function callback(map) {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(function callback(map) {
    mapRef.current = null;
  }, []);

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        mapRef.current.panTo(place.geometry.location);
        mapRef.current.setZoom(12);
      } else {
        toast.error("No details available for input: '" + place.name + "'");
      }
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] gap-3 animate-fade-in p-2">
        {/* Left Sidebar: List */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-64 lg:h-auto">
          <div className="p-2.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-sm text-gray-800">Service Zones</h2>
            {!isCreating && !isEditing && (
              <button
                onClick={() => setIsCreating(true)}
                className="bg-[#0B2C4D] text-white px-3 py-1 rounded text-xs hover:bg-[#091E3A] transition font-medium"
              >
                + New Zone
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {loading ? (
              <p className="text-center text-gray-500 mt-4 text-xs">Loading...</p>
            ) : zones.length === 0 ? (
              <p className="text-center text-gray-400 mt-4 text-xs">No zones found</p>
            ) : (
              zones.map((zone) => (
                <div
                  key={zone._id}
                  onClick={() => startEdit(zone)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${selectedZone?._id === zone._id
                    ? 'border-[#2BB673] bg-green-50 shadow-sm'
                    : 'border-gray-100 hover:border-green-200 hover:shadow-sm'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-xs">{zone.name}</h3>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{zone.description || 'No description'}</p>
                    </div>
                    <div className="flex gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${zone.isActive ? 'bg-[#2BB673]' : 'bg-gray-300'}`}></span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(zone._id); }}
                        className="text-gray-400 hover:text-red-500 ml-1"
                      >
                        <span className="material-icons-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Map & Form */}
        <div className="w-full lg:w-2/3 flex flex-col gap-2 h-full">

          {/* Form Header (Only when creating/editing) */}
          {(isCreating || isEditing) && (
            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 animate-fade-in-down">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Zone Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-[#2BB673] outline-none text-xs"
                    placeholder="e.g. South Mumbai"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-[#2BB673] outline-none text-xs"
                    placeholder="Optional details"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-gray-500 bg-gray-100 rounded text-xs hover:bg-gray-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-4 py-1.5 bg-[#0B2C4D] text-white rounded text-xs hover:bg-[#091E3A] shadow-sm font-medium"
                  >
                    {isEditing ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
              <p className="text-[10px] text-[#0B2C4D] mt-1.5 flex items-center">
                <span className="material-icons-outlined text-xs mr-1">info</span>
                Use the drawing tools on the map to {coordinates.length > 0 ? 'redraw' : 'draw'} the zone area.
              </p>
            </div>
          )}

          {/* Map Container */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[300px]">
            {!isLoaded ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2BB673]"></div>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={center}
                zoom={5}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: true,
                  zoomControl: true,
                  zoomControlOptions: { position: window.google?.maps?.ControlPosition?.RIGHT_CENTER }
                }}
              >

                <div className="absolute top-2 left-2 z-10 w-64 max-w-[90%]">
                  <Autocomplete
                    onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search location..."
                        className="w-full px-3 py-1.5 pl-8 bg-white rounded-lg shadow-sm border-0 focus:ring-1 focus:ring-[#2BB673] outline-none text-xs font-medium text-gray-900"
                      />
                      <span className="material-icons-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        search
                      </span>
                    </div>
                  </Autocomplete>
                </div>

                {/* Drawing Manager - Only Active when Creating/Editing */}
                {(isCreating || isEditing) && (
                  <DrawingManager
                    onLoad={(manager) => (drawingManagerRef.current = manager)}
                    onPolygonComplete={handlePolygonComplete}
                    options={{
                      drawingControl: true,
                      drawingControlOptions: {
                        position: window.google?.maps?.ControlPosition?.TOP_CENTER,
                        drawingModes: ['polygon'],
                      },
                      polygonOptions: {
                        fillColor: '#2BB673',
                        fillOpacity: 0.3,
                        strokeWeight: 2,
                        strokeColor: '#0B2C4D',
                        editable: true,
                        draggable: true,
                      }
                    }}
                  />
                )}

                {/* Render Existing Zones */}
                {!isCreating && !isEditing && zones.map((zone) => {
                  // Safety check for valid coordinates
                  if (!zone.area?.coordinates?.[0]) return null;

                  return (
                    <Polygon
                      key={zone._id}
                      paths={zone.area.coordinates[0].map(c => ({ lat: c[1], lng: c[0] }))}
                      options={{
                        fillColor: '#2BB673',
                        fillOpacity: 0.2,
                        strokeColor: '#0B2C4D',
                        strokeWeight: 2,
                      }}
                      onClick={() => startEdit(zone)}
                    />
                  );
                })}

                {/* Render Zone Currently Being Edited (if saved coordinates exist) */}
                {(isEditing || isCreating) && coordinates.length > 0 && (
                  <Polygon
                    paths={coordinates.map(c => ({ lat: c[1], lng: c[0] }))}
                    options={{
                      fillColor: '#2BB673',
                      fillOpacity: 0.4,
                      strokeColor: '#0B2C4D',
                      strokeWeight: 2,
                      editable: false,
                    }}
                  />
                )}

              </GoogleMap>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ServiceZones;
