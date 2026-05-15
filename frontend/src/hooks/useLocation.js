import { useState, useEffect } from 'react';
import { getCurrentLocation, geocodeAddress } from '../utils/geocode';

const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromAddress = async (address) => {
    setLoading(true);
    setError(null);
    try {
      const coords = await geocodeAddress(address);
      setLocation(coords);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { location, error, loading, fetchCurrentLocation, fetchFromAddress };
};

export default useLocation;
