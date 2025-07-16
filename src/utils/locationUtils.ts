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

/**
 * Calculate latitudeDelta and longitudeDelta so the entire circle (safe zone) is visible on the map.
 * 1 degree latitude ≈ 111,000 meters; longitude needs to be adjusted by latitude.
 */
export const getMapDelta = (
  radius: number,
  latitude: number,
  buffer = 1.1,
): { latitudeDelta: number; longitudeDelta: number } => {
  const latitudeDelta = (radius * 2 * buffer) / 111000;
  const longitudeDelta = latitudeDelta / Math.cos((latitude * Math.PI) / 180);
  return { latitudeDelta, longitudeDelta };
};
