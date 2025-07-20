export const toRad = (value: number): number => (value * Math.PI) / 180;

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const r = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = r * c; // Distance in kilometers
  return d;
};

export const isPointInCircle = (
  pointLat: number,
  pointLon: number,
  centerLat: number,
  centerLon: number,
  radiusKm: number,
): boolean => {
  const distance = calculateDistance(pointLat, pointLon, centerLat, centerLon);
  return distance <= radiusKm;
};

/** Validate if a coordinate is valid (finite and within reasonable bounds)  */
export const isValidCoordinate = (value: number): boolean => {
  return isFinite(value) && value >= -90 && value <= 90;
};

/** Validate if a longitude coordinate is valid */
export const isValidLongitude = (value: number): boolean => {
  return isFinite(value) && value >= -180 && value <= 180;
};

/** Validate if a latitude coordinate is valid */
export const isValidLatitude = (value: number): boolean => {
  return isValidCoordinate(value);
};

/** Get a safe coordinate value with fallback */
export const getSafeCoordinate = (value: number, fallback: number = 0): number => {
  return isValidCoordinate(value) ? value : fallback;
};

/** Get a safe longitude value with fallback */
export const getSafeLongitude = (value: number, fallback: number = 0): number => {
  return isValidLongitude(value) ? value : fallback;
};

/** Get a safe latitude value with fallback */
export const getSafeLatitude = (value: number, fallback: number = 0): number => {
  return isValidLatitude(value) ? value : fallback;
};

/** Validate and get safe coordinate pair */
export const getSafeCoordinatePair = (
  latitude: number,
  longitude: number,
  fallbackLat: number = 0,
  fallbackLng: number = 0,
): { latitude: number; longitude: number } => {
  return {
    latitude: getSafeLatitude(latitude, fallbackLat),
    longitude: getSafeLongitude(longitude, fallbackLng),
  };
};

/** Validate and get safe radius value */
export const getSafeRadius = (radius: number, fallback: number = 100): number => {
  return isFinite(radius) && radius > 0 ? radius : fallback;
};

/**
 * Calculate latitudeDelta and longitudeDelta so the entire circle (safe zone) is visible on the map.
 * 1 degree latitude ≈ 111,000 meters; longitude needs to be adjusted by latitude.
 */
export const getMapDelta = (
  radius: number,
  latitude: number,
  buffer = 1.1,
): { latitudeDelta: number; longitudeDelta: number } => {
  // Validate inputs
  if (!isFinite(radius) || !isFinite(latitude) || !isFinite(buffer)) {
    console.warn('Invalid input to getMapDelta:', { radius, latitude, buffer });
    return { latitudeDelta: 0.01, longitudeDelta: 0.01 };
  }

  // Clamp latitude to valid range to prevent division by zero
  const clampedLatitude = Math.max(-89.9, Math.min(89.9, latitude));

  const latitudeDelta = (radius * 2 * buffer) / 111000;

  // Calculate longitude delta with safety checks
  const cosLatitude = Math.cos((clampedLatitude * Math.PI) / 180);
  const longitudeDelta = cosLatitude > 0.001 ? latitudeDelta / cosLatitude : latitudeDelta;

  // Ensure the deltas are finite and reasonable
  const finalLatitudeDelta = isFinite(latitudeDelta)
    ? Math.max(0.001, Math.min(10, latitudeDelta))
    : 0.01;
  const finalLongitudeDelta = isFinite(longitudeDelta)
    ? Math.max(0.001, Math.min(10, longitudeDelta))
    : 0.01;

  return {
    latitudeDelta: finalLatitudeDelta,
    longitudeDelta: finalLongitudeDelta,
  };
};
