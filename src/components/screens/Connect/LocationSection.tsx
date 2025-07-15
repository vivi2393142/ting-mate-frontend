import { router } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Text, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { useUpdateUserSettings } from '@/api/user';
import {
  useGetCanGetLocation,
  useGetLinkedLocation,
  useGetLinkedSafeZone,
} from '@/api/userLocations';
import { LOCATION_SYNC_REFRESH_INTERVAL } from '@/constants';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useSyncCurrentLocation } from '@/hooks/useSyncCurrentLocation';
import useLocationStore from '@/store/useLocationStore';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { googleMapStyles } from '@/theme/mapStyles';
import type { SafeZone } from '@/types/connect';
import type { LocationData } from '@/types/location';
import { Role, User } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { isPointInCircle } from '@/utils/locationUtils';

import IconSymbol from '@/components/atoms/IconSymbol';
import Skeleton from '@/components/atoms/Skeleton';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';

// Status enum for location section UI
export enum Status {
  INITIALIZING = 'INITIALIZING', // Data is initializing from API
  NO_LINKED = 'NO_LINKED', // User has not linked any account
  NO_AGREEMENT = 'NO_AGREEMENT', // User has not agreed to share location in backend settings
  NO_PERMISSION = 'NO_PERMISSION', // User agreed in backend, but device location permission is not granted
  NO_DATA = 'NO_DATA', // No safezone and no location data available
  ONLY_SAFEZONE = 'ONLY_SAFEZONE', // Safezone exists, but no location data
  READY = 'READY', // Both safezone and location data are available
}

// Determine the current status for the LocationSection UI
const getLocationSectionStatus = ({
  isInitialingSafeZone,
  isInitialingCanCaregiverGetLocation,
  isInitialingCaregiverLocation,
  isInitialingCarereceiverLocation,
  user,
  canCaregiverGetLocation,
  location,
  safeZone,
  permissionStatus,
}: {
  isInitialingSafeZone: boolean;
  isInitialingCanCaregiverGetLocation: boolean;
  isInitialingCaregiverLocation: boolean;
  isInitialingCarereceiverLocation: boolean;
  canCaregiverGetLocation?: boolean;
  user: User | null;
  location: LocationData | null;
  safeZone: SafeZone | null;
  permissionStatus: boolean;
}) => {
  if (
    isInitialingSafeZone ||
    isInitialingCanCaregiverGetLocation ||
    isInitialingCaregiverLocation ||
    isInitialingCarereceiverLocation
  ) {
    return Status.INITIALIZING;
  }

  if (!user) return Status.NO_DATA;

  if (!user.settings.linked.length) return Status.NO_LINKED;

  if (user.role === Role.CAREGIVER) {
    if (!canCaregiverGetLocation) return Status.NO_AGREEMENT;
    if (!location && !safeZone) return Status.NO_DATA;
    if (!location) return Status.ONLY_SAFEZONE;
    return Status.READY;
  } else {
    if (!user.settings.allowShareLocation) return Status.NO_AGREEMENT;
    if (!permissionStatus) return Status.NO_PERMISSION;
    if (!location && !safeZone) return Status.NO_DATA;
    if (!location) return Status.ONLY_SAFEZONE;
    return Status.READY;
  }
};

const LocationSection = ({ isExpanded }: { isExpanded: boolean }) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { t } = useTranslation('connect');
  const { t: tCommon } = useTranslation('common');

  const user = useUserStore((s) => s.user);
  const { currentLocation } = useLocationStore();
  const mapRef = useRef<MapView>(null);

  // Use custom hooks for permission and sync
  const { isGranted } = useLocationPermission();
  const { syncNow } = useSyncCurrentLocation();

  const targetEmail = useMemo<string | undefined>(() => {
    if (!user || !user.email) return undefined;
    if (user.role === Role.CARERECEIVER) return user.email;
    return user.settings.linked[0]?.email;
  }, [user]);

  // Caregiver get it's own safe zone, carereceiver get linked user's safe zone
  const {
    data: safeZone,
    isLoading: isLoadingSafeZone,
    isFetched: isFetchedSafeZone,
    refetch: refetchLinkedSafeZone,
  } = useGetLinkedSafeZone(targetEmail || '', {
    enabled: !!targetEmail,
  });
  const isInitialingSafeZone = !!targetEmail && !isFetchedSafeZone;

  // Carereceiver get linked user's location
  const shouldCheckLocationPermission = user?.role === Role.CAREGIVER && !!targetEmail;
  const {
    data: canCaregiverGetLocation,
    isFetched: isFetchedCanCaregiverGetLocation,
    refetch: refetchCarCaregiverGetLocation,
  } = useGetCanGetLocation(targetEmail || '', {
    enabled: shouldCheckLocationPermission,
  });
  const isInitialingCanCaregiverGetLocation =
    shouldCheckLocationPermission && !isFetchedCanCaregiverGetLocation;

  // Carereceiver get linked user's location
  const {
    data: linkedLocation,
    isLoading: isLoadingLocation,
    isFetched: isFetchedLocation,
    refetch: refetchLinkedLocation,
  } = useGetLinkedLocation(targetEmail || '', {
    enabled: !!canCaregiverGetLocation,
    refetchInterval: LOCATION_SYNC_REFRESH_INTERVAL,
  });
  const isInitialingCaregiverLocation = !!canCaregiverGetLocation && !isFetchedLocation;
  const isInitialingCarereceiverLocation =
    user?.role === Role.CARERECEIVER && user.settings.allowShareLocation && !currentLocation;

  // Use correct type for location
  const location: LocationData | null = useMemo(() => {
    if (!user || !user.email) return null;
    if (user.role === Role.CAREGIVER) return linkedLocation || null;
    return currentLocation;
  }, [linkedLocation, currentLocation, user]);

  const updateUserSettingsMutation = useUpdateUserSettings();

  // --- Handlers ---
  const handleTurnOnLocationSharing = useCallback(() => {
    updateUserSettingsMutation.mutate(
      { allowShareLocation: true },
      {
        onSuccess: () => {
          // TODO: Handle on success
        },
        onError: () => {
          // TODO: Handle on error
        },
      },
    );
  }, [updateUserSettingsMutation]);

  // Handles refresh for both caregiver and carereceiver
  const handleRefresh = useCallback(() => {
    refetchLinkedSafeZone();
    if (user?.role === Role.CAREGIVER) {
      refetchCarCaregiverGetLocation();
      refetchLinkedLocation();
    } else {
      // Carereceiver: manual sync
      syncNow();
    }
  }, [
    refetchLinkedSafeZone,
    user?.role,
    refetchCarCaregiverGetLocation,
    refetchLinkedLocation,
    syncNow,
  ]);

  // Pan to the current user or linked location on the map
  const handlePanToLocation = useCallback(() => {
    if (!location) return;
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );
  }, [location]);

  // Pan to the safe zone on the map
  const handlePanToSafeZone = useCallback(() => {
    if (!safeZone) return;
    mapRef.current?.animateToRegion(
      {
        latitude: safeZone.location.latitude,
        longitude: safeZone.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );
  }, [safeZone]);

  // Navigate to the edit safe zone screen
  const handleEditSafeZone = useCallback(() => {
    router.push(ROUTES.EDIT_SAFE_ZONE);
  }, []);

  // Check if the user is inside the safe zone
  const isInSafeZone = useMemo(() => {
    if (!location || !safeZone) return false;
    return isPointInCircle(
      location.latitude,
      location.longitude,
      safeZone.location.latitude,
      safeZone.location.longitude,
      safeZone.radius / 1000,
    );
  }, [location, safeZone]);

  // --- Status evaluation ---
  const status = getLocationSectionStatus({
    isInitialingSafeZone,
    isInitialingCanCaregiverGetLocation,
    isInitialingCaregiverLocation,
    isInitialingCarereceiverLocation,
    user,
    canCaregiverGetLocation,
    location,
    safeZone: safeZone || null,
    permissionStatus: isGranted,
  });

  console.log({ status, user });

  // --- UI: Not ready ---
  if (status === Status.INITIALIZING || !user) {
    return (
      <View style={styles.container}>
        <Skeleton width={'100%'} height={150} />
      </View>
    );
  }

  if (status === Status.NO_LINKED) {
    return (
      <View style={styles.note}>
        <Text>{t('Connect with someone first to use this feature.')}</Text>
        <ThemedButton
          onPress={() => {
            router.push(ROUTES.ACCOUNT_LINKING);
          }}
        >
          {t('Link Now')}
        </ThemedButton>
      </View>
    );
  }

  if (status === Status.NO_AGREEMENT) {
    return user.role === Role.CAREGIVER ? (
      <View style={styles.note}>
        <Text>
          {t(
            'The linked user has not enabled location sharing. Please ask them to turn on location sharing in their app then refresh.',
          )}
        </Text>
        <ThemedButton onPress={handleRefresh}>{tCommon('Refresh')}</ThemedButton>
      </View>
    ) : (
      <View style={styles.note}>
        <Text>
          {t("Location sharing is off. Turn it on to let your companions know you're safe.")}
        </Text>
        <ThemedButton onPress={handleTurnOnLocationSharing}>
          {t('Turn On Location Sharing')}
        </ThemedButton>
      </View>
    );
  }

  if (status === Status.NO_PERMISSION) {
    return (
      <View style={styles.note}>
        <Text>
          {t("You're sharing your location, but the app still needs permission from your phone.")}
        </Text>
        {/* Should pop up modal from LocationSyncHandler */}
      </View>
    );
  }

  if (status === Status.NO_DATA) {
    return user.role === Role.CAREGIVER ? (
      <View style={styles.note}>
        <Text>
          {t(
            'We cannot get the current location. The linked user may have just turned on location sharing or has not allowed location access on their device. Please check their settings or try again.',
          )}
        </Text>
        <ThemedButton onPress={handleRefresh}>{t('Try Again')}</ThemedButton>
      </View>
    ) : (
      <View style={styles.note}>
        <Text>{t('Can’t find your location right now. Try again.')}</Text>
        <ThemedButton onPress={handleRefresh}>{t('Try Again')}</ThemedButton>
      </View>
    );
  }

  if (status === Status.ONLY_SAFEZONE || !location) {
    return user.role === Role.CAREGIVER ? (
      <View style={styles.note}>
        <Text>
          {t(
            "No location data available yet. Please check the linked user's settings or try again.",
          )}
        </Text>
        <ThemedButton onPress={handleRefresh}>{t('Try Again')}</ThemedButton>
      </View>
    ) : (
      <View style={styles.note}>
        <Text>{t('No location data available. Please refresh to update your location.')}</Text>
        <ThemedButton onPress={handleRefresh}>{tCommon('Refresh')}</ThemedButton>
      </View>
    );
  }

  // --- UI: Ready ---
  return (
    <View style={styles.container}>
      {/* Map Container */}
      <View
        style={[
          styles.mapContainer,
          isExpanded && styles.mapContainerExpanded,
          !isInSafeZone && safeZone && styles.mapContainerWarning,
        ]}
      >
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType="standard"
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          customMapStyle={googleMapStyles}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          zoomEnabled={true}
          scrollEnabled={true}
          rotateEnabled={true}
          pitchEnabled={true}
          toolbarEnabled={false}
          loadingEnabled={true}
          loadingIndicatorColor={theme.colors.primary}
          loadingBackgroundColor={theme.colors.surface}
        >
          {/* User Location Marker */}
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.markerContainer}>
              <IconSymbol
                name="figure.wave"
                size={StaticTheme.iconSize.l}
                color={theme.colors.primary}
              />
              {user?.settings.name && <Text style={styles.markerName}>{user.settings.name}</Text>}
            </View>
          </Marker>
          {/* Safe Zone Circle */}
          {safeZone && (
            <Circle
              center={{
                latitude: safeZone.location.latitude,
                longitude: safeZone.location.longitude,
              }}
              radius={safeZone.radius}
              fillColor={colorWithAlpha(
                isInSafeZone ? theme.colors.primary : theme.colors.error,
                0.2,
              )}
              strokeColor={theme.colors.primary}
              strokeWidth={2}
              zIndex={1}
            />
          )}
        </MapView>
        {/* Warning Container */}
        <View style={[styles.warningChip, !isInSafeZone && safeZone && styles.warningChipOut]}>
          {!isInSafeZone && safeZone && (
            <IconSymbol
              name="exclamationmark.triangle"
              size={StaticTheme.iconSize.xs}
              color={theme.colors.onPrimary}
            />
          )}
          <Text style={styles.warningText}>
            {isInSafeZone
              ? t('You are inside the safe zone.')
              : t('You are outside the safe zone.')}
          </Text>
        </View>
      </View>
      {/* Last Update Time and Refresh Button */}
      <View style={styles.updateWrapper}>
        <Text style={styles.updateText}>
          {t('Last updated:')} {location.lastUpdate}
        </Text>
        <ThemedIconButton
          name={isLoadingLocation ? 'arrow.clockwise.circle' : 'arrow.clockwise'}
          onPress={handleRefresh}
          size={'tiny'}
          disabled={isLoadingLocation}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
      {/* Expanded Options */}
      {isExpanded && (
        <View style={styles.expandedOptions}>
          <View style={styles.optionsRow}>
            <ThemedButton
              mode="outlined"
              icon="location"
              onPress={handlePanToLocation}
              style={styles.optionButton}
              disabled={isLoadingLocation}
            >
              {t('Go to User')}
            </ThemedButton>
            {safeZone && (
              <ThemedButton
                mode="outlined"
                icon="shield"
                onPress={handlePanToSafeZone}
                style={styles.optionButton}
                disabled={isLoadingSafeZone}
              >
                {t('Go to Safe Zone')}
              </ThemedButton>
            )}
          </View>
          <ThemedButton mode="contained" icon="gearshape" onPress={handleEditSafeZone}>
            {t('Edit Safe Zone')}
          </ThemedButton>
        </View>
      )}
    </View>
  );
};

const getStyles = createStyles<
  StyleRecord<
    | 'container'
    | 'mapContainer'
    | 'mapContainerExpanded'
    | 'mapContainerWarning'
    | 'map'
    | 'markerContainer'
    | 'warningChip'
    | 'warningChipOut'
    | 'expandButton'
    | 'updateWrapper'
    | 'expandedOptions'
    | 'optionsRow'
    | 'optionButton'
    | 'note',
    'markerName' | 'warningText' | 'updateText'
  >
>({
  container: {
    gap: StaticTheme.spacing.sm,
  },
  mapContainer: {
    height: 150,
    width: '100%',
    borderWidth: 1,
    borderColor: ({ colors }) => colors.outline,
    borderRadius: StaticTheme.borderRadius.s,
    overflow: 'hidden',
    position: 'relative',
  },
  mapContainerExpanded: {
    height: 300,
  },
  mapContainerWarning: {
    borderColor: ({ colors }) => colors.error,
    borderWidth: 2,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerName: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.primary,
  },
  warningChip: {
    position: 'absolute',
    top: StaticTheme.spacing.sm,
    left: StaticTheme.spacing.sm,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: StaticTheme.spacing.sm,
    paddingVertical: StaticTheme.spacing.xs,
    borderRadius: StaticTheme.borderRadius.s,
    gap: StaticTheme.spacing.xs,
    backgroundColor: ({ colors }) => colors.outline,
  },
  warningChipOut: {
    backgroundColor: ({ colors }) => colors.error,
  },
  warningText: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.onPrimary,
  },
  expandButton: {
    position: 'absolute',
    top: StaticTheme.spacing.sm,
    right: StaticTheme.spacing.sm,
    zIndex: 10,
    borderRadius: StaticTheme.borderRadius.s,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
    borderWidth: 1,
    backgroundColor: ({ colors }) => colors.surface,
    shadowColor: ({ colors }) => colors.shadow,
    borderColor: ({ colors }) => colors.primary,
  },
  updateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  updateText: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
  },
  expandedOptions: {
    gap: StaticTheme.spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm,
  },
  optionButton: {
    flex: 1,
  },
  note: {
    backgroundColor: ({ colors }) => colors.surfaceVariant,
    paddingVertical: StaticTheme.spacing.md * 1.25,
    paddingHorizontal: StaticTheme.spacing.md,
    borderRadius: StaticTheme.borderRadius.s,
    gap: StaticTheme.spacing.sm * 1.25,
  },
});

export default LocationSection;
