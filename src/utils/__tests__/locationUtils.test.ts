import { calculateDistance, isPointInCircle, toRad } from '../locationUtils';

describe('locationUtils', () => {
  describe('toRad', () => {
    it('should convert degrees to radians correctly', () => {
      expect(toRad(0)).toBe(0);
      expect(toRad(90)).toBe(Math.PI / 2);
      expect(toRad(180)).toBe(Math.PI);
      expect(toRad(360)).toBe(2 * Math.PI);
      expect(toRad(45)).toBe(Math.PI / 4);
    });

    it('should handle negative degrees', () => {
      expect(toRad(-90)).toBe(-Math.PI / 2);
      expect(toRad(-180)).toBe(-Math.PI);
    });
  });

  describe('calculateDistance', () => {
    it('should return 0 for same coordinates', () => {
      const lat = 51.5074;
      const lon = -0.1278;
      expect(calculateDistance(lat, lon, lat, lon)).toBeCloseTo(0, 2);
    });

    it('should calculate distance between London and Paris', () => {
      // London coordinates
      const londonLat = 51.5074;
      const londonLon = -0.1278;

      // Paris coordinates
      const parisLat = 48.8566;
      const parisLon = 2.3522;

      const distance = calculateDistance(londonLat, londonLon, parisLat, parisLon);
      // Expected distance is approximately 344 km
      expect(distance).toBeCloseTo(344, 0);
    });

    it('should calculate distance between New York and Los Angeles', () => {
      // New York coordinates
      const nyLat = 40.7128;
      const nyLon = -74.006;

      // Los Angeles coordinates
      const laLat = 34.0522;
      const laLon = -118.2437;

      const distance = calculateDistance(nyLat, nyLon, laLat, laLon);
      // Expected distance is approximately 3935 km
      expect(distance).toBeCloseTo(3935, 0);
    });

    it('should handle antipodal points (opposite sides of Earth)', () => {
      // Point 1: London
      const lat1 = 51.5074;
      const lon1 = -0.1278;

      // Point 2: Approximately opposite side of Earth
      const lat2 = -51.5074;
      const lon2 = 179.8722;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      // Should be approximately half the Earth's circumference
      expect(distance).toBeCloseTo(20000, -2); // Within 200 km
    });

    it('should handle very small distances', () => {
      const lat1 = 51.5074;
      const lon1 = -0.1278;
      const lat2 = 51.5074;
      const lon2 = -0.1279; // Very small change in longitude

      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1); // Should be less than 1 km
    });

    it('should handle coordinates at different hemispheres', () => {
      // Northern hemisphere
      const lat1 = 51.5074;
      const lon1 = -0.1278;

      // Southern hemisphere
      const lat2 = -33.8688;
      const lon2 = 151.2093;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('isPointInCircle', () => {
    it('should return true when point is at the center', () => {
      const centerLat = 51.5074;
      const centerLon = -0.1278;
      const radiusKm = 1;

      const result = isPointInCircle(centerLat, centerLon, centerLat, centerLon, radiusKm);
      expect(result).toBe(true);
    });

    it('should return true when point is inside the circle', () => {
      const centerLat = 51.5074;
      const centerLon = -0.1278;
      const pointLat = 51.5074;
      const pointLon = -0.1279; // Very close to center
      const radiusKm = 1;

      const result = isPointInCircle(pointLat, pointLon, centerLat, centerLon, radiusKm);
      expect(result).toBe(true);
    });

    it('should return false when point is outside the circle', () => {
      const centerLat = 51.5074;
      const centerLon = -0.1278;
      const pointLat = 52.5074; // 1 degree north (about 111 km)
      const pointLon = -0.1278;
      const radiusKm = 1;

      const result = isPointInCircle(pointLat, pointLon, centerLat, centerLon, radiusKm);
      expect(result).toBe(false);
    });

    it('should return true when point is exactly at the circle boundary', () => {
      const centerLat = 51.5074;
      const centerLon = -0.1278;
      const radiusKm = 1;

      // Calculate a point exactly 1 km north of center using more precise calculation
      const pointLat = centerLat + 1 / 111.32; // More precise conversion
      const pointLon = centerLon;

      const result = isPointInCircle(pointLat, pointLon, centerLat, centerLon, radiusKm);
      expect(result).toBe(true);
    });

    it('should handle edge case with very small radius', () => {
      const centerLat = 51.5074;
      const centerLon = -0.1278;
      const radiusKm = 0.001; // 1 meter

      // Point very close to center but still outside 1 meter radius
      const pointLat = centerLat + 0.00001; // About 1.1 meters north
      const pointLon = centerLon + 0.00001; // About 1.1 meters east

      const result = isPointInCircle(pointLat, pointLon, centerLat, centerLon, radiusKm);
      expect(result).toBe(false); // Should be outside such a small circle
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle extreme latitude values', () => {
      // North Pole
      const lat1 = 90;
      const lon1 = 0;

      // South Pole
      const lat2 = -90;
      const lon2 = 0;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeCloseTo(20000, -2); // Should be approximately half Earth's circumference
    });

    it('should handle longitude wrapping', () => {
      const lat1 = 51.5074;
      const lon1 = 179.9; // Near 180 degrees
      const lat2 = 51.5074;
      const lon2 = -179.9; // Near -180 degrees

      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(100); // Should be small distance
    });

    it('should handle zero radius circle', () => {
      const centerLat = 51.5074;
      const centerLon = -0.1278;
      const radiusKm = 0;

      // Point at center
      const result1 = isPointInCircle(centerLat, centerLon, centerLat, centerLon, radiusKm);
      expect(result1).toBe(true);

      // Point slightly away
      const result2 = isPointInCircle(centerLat + 0.001, centerLon, centerLat, centerLon, radiusKm);
      expect(result2).toBe(false);
    });
  });
});
