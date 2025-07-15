import * as Location from 'expo-location';
import { useCallback } from 'react';

export const useLocationPermission = () => {
  const [permissionStatus, requestPermission] = Location.useForegroundPermissions();
  const isGranted = !!permissionStatus?.granted;

  const request = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  return {
    permissionStatus,
    isGranted,
    requestPermission: request,
  };
};
