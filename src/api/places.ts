import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { axiosClientWithAuth } from '@/api/axiosClient';
import API_PATH from '@/api/path';
import type { AddressData } from '@/types/connect';

/* =============================================================================
 * API Schema Definitions
 * ============================================================================= */
const GooglePlaceLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const GooglePlaceGeometrySchema = z.object({
  location: GooglePlaceLocationSchema,
});

const GooglePlaceResultSchema = z.object({
  name: z.string(),
  formatted_address: z.string(),
  geometry: GooglePlaceGeometrySchema,
});

const GooglePlaceSearchResponseSchema = z.object({
  results: z.object({
    results: z.array(GooglePlaceResultSchema),
  }),
});

/* =============================================================================
 * Type Definitions
 * ============================================================================= */

export type PlaceSearchRequest = {
  query: string;
  language?: string;
  region?: string;
};

type GooglePlaceResult = z.infer<typeof GooglePlaceResultSchema>;

/* =============================================================================
 * Data Transform Functions
 * ============================================================================= */

const transformGooglePlaceToAddressData = (result: GooglePlaceResult): AddressData => {
  return {
    name: result.name,
    address: result.formatted_address,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
  };
};

/* =============================================================================
 * API Hooks
 * ============================================================================= */

export const usePlaceSearch = (
  options?: Omit<UseMutationOptions<AddressData[], Error, PlaceSearchRequest>, 'mutationFn'>,
) =>
  useMutation<AddressData[], Error, PlaceSearchRequest>({
    mutationFn: async (params: PlaceSearchRequest) => {
      const res = await axiosClientWithAuth.post(API_PATH.PLACE_SEARCH, params);
      const parsed = GooglePlaceSearchResponseSchema.parse(res.data);
      return parsed.results.results.map(transformGooglePlaceToAddressData);
    },
    ...options,
  });
