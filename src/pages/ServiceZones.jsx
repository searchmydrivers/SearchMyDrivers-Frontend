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
    setCoordinates(zone.area.coordinates[0]); // GeoJSON Polygon
    setIsEditing(true);
    setIsCreating(false);

    // Pan map to the selected zone
    if (mapRef.current && zone.area.coordinates[0].length > 0) {
      setTimeout(() => {
        try {
          const bounds = new window.google.maps.LatLngBounds();
          zone.area.coordinates[0].forEach(coord => {
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
      <div className="flex h-[calc(100vh-120px)] gap-6">
        {/* Left Sidebar: List */}
        <div className="w-1/3 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-lg text-gray-800">Service Zones</h2>
            {!isCreating && !isEditing && (
              <button
                onClick={() => setIsCreating(true)}
                className="bg-[#0B2C4D] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#091E3A] transition"
              >
                + New Zone
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <p className="text-center text-gray-500 mt-4">Loading...</p>
            ) : zones.length === 0 ? (
              <p className="text-center text-gray-400 mt-4">No zones found</p>
            ) : (
              zones.map((zone) => (
                <div
                  key={zone._id}
                  onClick={() => startEdit(zone)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedZone?._id === zone._id
                    ? 'border-[#2BB673] bg-green-50 shadow-sm'
                    : 'border-gray-100 hover:border-green-200 hover:shadow-sm'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{zone.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{zone.description || 'No description'}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`w-2 h-2 rounded-full mt-2 ${zone.isActive ? 'bg-[#2BB673]' : 'bg-gray-300'}`}></span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(zone._id); }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <span className="material-icons-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Map & Form */}
        <div className="w-2/3 flex flex-col gap-4">

          {/* Form Header (Only when creating/editing) */}
          {(isCreating || isEditing) && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-down">
              <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Zone Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2BB673] outline-none"
                    placeholder="e.g. South Mumbai"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2BB673] outline-none"
                    placeholder="Optional details"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0B2C4D] text-white rounded-lg hover:bg-[#091E3A] shadow-lg shadow-blue-900/20"
                  >
                    {isEditing ? 'Update Zone' : 'Save Zone'}
                  </button>
                </div>
              </form>
              <p className="text-xs text-[#0B2C4D] mt-2 flex items-center">
                <span className="material-icons-outlined text-sm mr-1">info</span>
                Use the drawing tools on the map to {coordinates.length > 0 ? 'redraw' : 'draw'} the zone area.
              </p>
            </div>
          )}

          {/* Map Container */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            {!isLoaded ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2BB673]"></div>
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
                }}
              >

                <div className="absolute top-4 left-4 z-10 w-80">
                  <Autocomplete
                    onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search location..."
                        className="w-full px-4 py-3 pl-10 bg-white rounded-xl shadow-lg border-0 focus:ring-2 focus:ring-[#2BB673] outline-none text-sm font-medium text-gray-900"
                      />
                      <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                {!isCreating && !isEditing && zones.map((zone) => (
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
                ))}

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
