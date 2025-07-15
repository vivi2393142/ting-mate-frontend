import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useUpdateLocation } from '@/api/userLocations';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import useLocationStore from '@/store/useLocationStore';
import useUserStore from '@/store/useUserStore';
import { Role } from '@/types/user';

interface UseSyncCurrentLocationOptions {
  interval?: number;
}

export const useSyncCurrentLocation = (options: UseSyncCurrentLocationOptions = {}) => {
  const user = useUserStore((s) => s.user);
  const { isGranted } = useLocationPermission();
  const isEnabledSync = useMemo(
    () =>
      user?.role === Role.CARERECEIVER &&
      user.settings.allowShareLocation &&
      user.settings.linked &&
      isGranted,
    [isGranted, user?.role, user?.settings.allowShareLocation, user?.settings.linked],
  );

  const { setCurrentLocation } = useLocationStore();
  const updateLocationMutation = useUpdateLocation();

  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const intervalRef = useRef<number>(null);

  // Do not include updateLocationMutation in deps because react-query returns a new object every render.
  const syncNow = useCallback(async () => {
    if (!isEnabledSync) return;
    setIsSyncing(true);
    setError(null);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      updateLocationMutation.mutate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsSyncing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCurrentLocation, isEnabledSync]);

  useEffect(() => {
    if (!isEnabledSync) return;
    if (!options.interval) return;

    syncNow(); // Initial sync
    intervalRef.current = setInterval(syncNow, options.interval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isEnabledSync, options.interval, syncNow]);

  return {
    isSyncing,
    error,
    syncNow,
  };
};
