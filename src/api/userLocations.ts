import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { z } from 'zod';

import { axiosClientWithAuth } from '@/api/axiosClient';
import API_PATH from '@/api/path';
import type { SafeZone } from '@/types/connect';
import type { LocationData } from '@/types/location';

/* =============================================================================
 * API Schema Definitions
 * ============================================================================= */

const UserLocationResponseSchema = z.object({
  id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timestamp: z.string(), // ISO timestamp
});

const CanGetLocationResponseSchema = z.object({
  can_get_location: z.boolean(),
});

const SafeZoneResponseSchema = z.object({
  safe_zone: z
    .object({
      location: z.object({
        name: z.string(),
        address: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      }),
      radius: z.number(),
    })
    .nullable(),
});

/* =============================================================================
 * Type Definitions
 * ============================================================================= */

type UserLocationCreate = {
  latitude: number;
  longitude: number;
};
type UserLocationResponse = z.infer<typeof UserLocationResponseSchema>;

/* =============================================================================
 * Data Transform Functions
 * ============================================================================= */

// Transform API user location to frontend format
const transformUserLocationFromAPI = (apiLocation: UserLocationResponse): LocationData => ({
  latitude: apiLocation.latitude,
  longitude: apiLocation.longitude,
  lastUpdate: apiLocation.timestamp,
});

// Transform frontend location to API format
const transformUserLocationToAPI = (location: { latitude: number; longitude: number }) => ({
  latitude: location.latitude,
  longitude: location.longitude,
});

/* =============================================================================
 * API Hooks
 * ============================================================================= */

export const useGetLinkedLocation = (
  targetEmail: string,
  options?: Omit<
    UseQueryOptions<ReturnType<typeof transformUserLocationFromAPI> | null>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: ['linkedLocation', targetEmail],
    queryFn: async (): Promise<ReturnType<typeof transformUserLocationFromAPI> | null> => {
      const res = await axiosClientWithAuth.get(`${API_PATH.USER_LINKED_LOCATION}/${targetEmail}`);
      const validatedData = UserLocationResponseSchema.parse(res.data);
      return transformUserLocationFromAPI(validatedData);
    },
    enabled: !!targetEmail,
    ...options,
  });

export const useGetCanGetLocation = (
  targetEmail: string,
  options?: Omit<UseQueryOptions<boolean>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: ['canGetLocation', targetEmail],
    queryFn: async (): Promise<boolean> => {
      const res = await axiosClientWithAuth.get(`${API_PATH.USER_CAN_GET_LOCATION}/${targetEmail}`);
      const validatedData = CanGetLocationResponseSchema.parse(res.data);
      return validatedData.can_get_location;
    },
    enabled: !!targetEmail,
    ...options,
  });

export const useUpdateLocation = (
  options?: Omit<
    UseMutationOptions<ReturnType<typeof transformUserLocationFromAPI>, Error, UserLocationCreate>,
    'mutationFn' | 'onSuccess'
  >,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      location: UserLocationCreate,
    ): Promise<ReturnType<typeof transformUserLocationFromAPI>> => {
      const requestData = transformUserLocationToAPI(location);
      const res = await axiosClientWithAuth.post(API_PATH.USER_LOCATION, requestData);
      const validatedData = UserLocationResponseSchema.parse(res.data);
      return transformUserLocationFromAPI(validatedData);
    },
    onSuccess: () => {
      // Invalidate linked location queries for this user
      queryClient.invalidateQueries({ queryKey: ['linkedLocation'] });
    },
    ...options,
  });
};

export const useGetLinkedSafeZone = (
  targetEmail: string,
  options?: Omit<UseQueryOptions<SafeZone | null>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: ['linkedSafeZone', targetEmail],
    queryFn: async (): Promise<SafeZone | null> => {
      const res = await axiosClientWithAuth.get(`${API_PATH.SAFE_ZONE}/${targetEmail}`);
      const validatedData = SafeZoneResponseSchema.parse(res.data);
      return validatedData.safe_zone || null;
    },
    enabled: !!targetEmail,
    ...options,
  });

export const useUpdateSafeZone = (
  options?: Omit<
    UseMutationOptions<void, Error, { targetEmail: string; safeZone: SafeZone }>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};
  return useMutation({
    mutationFn: async ({ targetEmail, safeZone }) => {
      await axiosClientWithAuth.post(`${API_PATH.SAFE_ZONE}/${targetEmail}`, safeZone);
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['linkedSafeZone', args[1].targetEmail] });
      if (onSuccess) onSuccess(...args);
    },
    ...restOptions,
  });
};
