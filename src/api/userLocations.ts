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
import type { LocationData } from '@/types/location';

/* =============================================================================
 * API Schema Definitions
 * ============================================================================= */

const UserLocationResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  created_at: z.string(), // ISO timestamp
  updated_at: z.string(), // ISO timestamp
});

const CanGetLocationResponseSchema = z.boolean();

const SafeZoneResponseSchema = z.object({
  location: z.object({
    name: z.string(),
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  radius: z.number(),
});

/* =============================================================================
 * Type Definitions
 * ============================================================================= */

type UserLocationCreate = {
  latitude: number;
  longitude: number;
};
type UserLocationResponse = z.infer<typeof UserLocationResponseSchema>;

type CanGetLocationResponse = z.infer<typeof CanGetLocationResponseSchema>;

type SafeZoneResponse = z.infer<typeof SafeZoneResponseSchema>;

/* =============================================================================
 * Data Transform Functions
 * ============================================================================= */

// Transform API user location to frontend format
const transformUserLocationFromAPI = (apiLocation: UserLocationResponse): LocationData => ({
  latitude: apiLocation.latitude,
  longitude: apiLocation.longitude,
  lastUpdate: apiLocation.updated_at,
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
      if (!res.data) return null;
      const validatedData = UserLocationResponseSchema.parse(res.data);
      return transformUserLocationFromAPI(validatedData);
    },
    enabled: !!targetEmail,
    ...options,
  });

export const useGetCanGetLocation = (
  targetEmail: string,
  options?: Omit<UseQueryOptions<CanGetLocationResponse>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: ['canGetLocation', targetEmail],
    queryFn: async (): Promise<boolean> => {
      const res = await axiosClientWithAuth.get(`${API_PATH.USER_CAN_GET_LOCATION}/${targetEmail}`);
      const validatedData = CanGetLocationResponseSchema.parse(res.data);
      return validatedData;
    },
    enabled: !!targetEmail,
    ...options,
  });

export const useGetLinkedSafeZone = (
  targetEmail: string,
  options?: Omit<UseQueryOptions<SafeZoneResponse | null>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: ['linkedSafeZone', targetEmail],
    queryFn: async (): Promise<SafeZoneResponse | null> => {
      const res = await axiosClientWithAuth.get(`${API_PATH.USER_LINKED_SAFE_ZONE}/${targetEmail}`);
      if (!res.data) return null;
      const validatedData = SafeZoneResponseSchema.parse(res.data);
      return validatedData;
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
