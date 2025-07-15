import { create } from 'zustand';

import type { LocationData } from '@/types/location';

interface LocationState {
  currentLocation: LocationData | null;
  setCurrentLocation: (location: Omit<LocationData, 'lastUpdate'>) => void;
  clearLocation: () => void;
}

const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  setCurrentLocation: (location) =>
    set({
      currentLocation: { ...location, lastUpdate: new Date().toISOString() },
    }),
  clearLocation: () =>
    set({
      currentLocation: null,
    }),
}));

export default useLocationStore;
