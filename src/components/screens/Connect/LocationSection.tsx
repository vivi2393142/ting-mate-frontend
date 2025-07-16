import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Text, View } from 'react-native';
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
import useAuthStore from '@/store/useAuthStore';
import useLocationStore from '@/store/useLocationStore';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { googleMapStyles } from '@/theme/mapStyles';
import type { SafeZone } from '@/types/connect';
import type { LocationData } from '@/types/location';
import { Role, User } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { getMapDelta, isPointInCircle } from '@/utils/locationUtils';

import IconSymbol from '@/components/atoms/IconSymbol';
import Skeleton from '@/components/atoms/Skeleton';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import NoteMessage from '@/components/screens/Connect/NoteMessage';

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

const getCanGetSafeZone = (user: User | null, canCaregiverGetLocation: boolean) => {
  if (!user || !user.email) return false;
  if (user.role === Role.CARERECEIVER)
    return user.settings.allowShareLocation && user.settings.linked.length > 0;
  if (user.role === Role.CAREGIVER) return canCaregiverGetLocation;
  return false;
};

const LocationSection = ({ isExpanded }: { isExpanded: boolean }) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { t } = useTranslation('connect');
  const { t: tCommon } = useTranslation('common');

  const token = useAuthStore((s) => s.token);
  const user = useUserStore((s) => s.user);
  const { currentLocation } = useLocationStore();
  const mapRef = useRef<MapView>(null);

  // Use custom hooks for permission and sync
  const { isGranted, requestPermission } = useLocationPermission();
  const { syncNow } = useSyncCurrentLocation();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const targetEmail = useMemo<string | undefined>(() => {
    if (!user || !user.email) return undefined;
    if (user.role === Role.CARERECEIVER) return user.email;
    return user.settings.linked[0]?.email;
  }, [user]);

  // Carereceiver get linked user's location
  const shouldCheckLocationPermission = user?.role === Role.CAREGIVER && !!targetEmail;
  const {
    data: canCaregiverGetLocationResult,
    isFetched: isFetchedCanCaregiverGetLocation,
    refetch: refetchCanCaregiverGetLocation,
  } = useGetCanGetLocation(targetEmail || '', {
    enabled: shouldCheckLocationPermission,
  });
  const isInitialingCanCaregiverGetLocation =
    shouldCheckLocationPermission && !isFetchedCanCaregiverGetLocation;
  const canCaregiverGetLocation = !!canCaregiverGetLocationResult;

  // Caregiver get it's own safe zone, carereceiver get linked user's safe zone
  const canGetSafeZone = getCanGetSafeZone(user, canCaregiverGetLocation);
  const shouldGetSafeZone = !!(targetEmail && canGetSafeZone);
  const {
    data: safeZone,
    isLoading: isLoadingSafeZone,
    isFetched: isFetchedSafeZone,
    refetch: refetchLinkedSafeZone,
  } = useGetLinkedSafeZone(targetEmail || '', {
    enabled: shouldGetSafeZone,
  });
  const isInitialingSafeZone = shouldGetSafeZone && !isFetchedSafeZone;

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
    user?.role === Role.CARERECEIVER &&
    user.settings.allowShareLocation &&
    isGranted &&
    !currentLocation;

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
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (user?.role === Role.CAREGIVER) {
      const { data: newCanCaregiverGetLocation } = await refetchCanCaregiverGetLocation();
      const isNewCanGetSafeZone = getCanGetSafeZone(user, !!newCanCaregiverGetLocation);
      if (isNewCanGetSafeZone) {
        await refetchLinkedSafeZone();
        await refetchLinkedLocation();
      }
    } else {
      await syncNow(); // Carereceiver: manual sync
    }
    setIsRefreshing(false);
  }, [user, refetchCanCaregiverGetLocation, refetchLinkedSafeZone, refetchLinkedLocation, syncNow]);

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
    // Auto-zoom to fit the entire safe zone
    const { latitudeDelta, longitudeDelta } = getMapDelta(
      safeZone.radius,
      safeZone.location.latitude,
    );
    mapRef.current?.animateToRegion(
      {
        latitude: safeZone.location.latitude,
        longitude: safeZone.location.longitude,
        latitudeDelta,
        longitudeDelta,
      },
      1000,
    );
  }, [safeZone]);

  // Carereceiver: Turn off location sharing
  const handleTurnOffLocationSharing = useCallback(() => {
    Alert.alert(
      t('Turn Off Location Sharing'),
      t(
        'Are you sure you want to turn off location sharing? Your linked user will not be able to track your location.',
      ),
      [
        { text: tCommon('Cancel'), style: 'cancel' },
        {
          text: tCommon('Confirm'),
          style: 'destructive',
          onPress: () => {
            updateUserSettingsMutation.mutate({ allowShareLocation: false });
          },
        },
      ],
      { cancelable: true },
    );
  }, [t, tCommon, updateUserSettingsMutation]);

  const handleLogin = useCallback(() => {
    router.push({
      pathname: ROUTES.LOGIN,
      params: { from: ROUTES.CONNECT },
    });
  }, []);

  const handleLinkAccount = useCallback(() => {
    router.push({
      pathname: ROUTES.ACCOUNT_LINKING,
      params: { from: ROUTES.CONNECT },
    });
  }, []);

  const handleEditSafeZone = useCallback(() => {
    router.push({
      pathname: ROUTES.EDIT_SAFE_ZONE,
      params: { from: ROUTES.CONNECT },
    });
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

  const markerName = useMemo(() => {
    if (user?.role === Role.CAREGIVER) return user.settings.linked?.[0]?.name;
    return t('Me');
  }, [user, t]);

  const warningText = useMemo(() => {
    if (user?.role === Role.CAREGIVER) {
      return isInSafeZone
        ? t('{{name}} is inside the safe zone.', { name: markerName })
        : t('{{name}} is outside the safe zone.', { name: markerName });
    } else {
      return isInSafeZone
        ? t('You are inside the safe zone.')
        : t('You are outside the safe zone.');
    }
  }, [isInSafeZone, t, user, markerName]);

  // --- UI: Not ready ---
  // If not authenticated, show sign in button
  if (!token) {
    return (
      <NoteMessage
        message={t('Please sign in to use this feature.')}
        buttonProps={{
          onPress: handleLogin,
          children: tCommon('Login / Sign Up'),
        }}
      />
    );
  }

  if (status === Status.INITIALIZING || !user) {
    return (
      <View style={styles.container}>
        <Skeleton width={'100%'} height={150} />
      </View>
    );
  }

  if (status === Status.NO_LINKED) {
    return (
      <NoteMessage
        message={t('Connect with someone first to use this feature.')}
        buttonProps={{
          onPress: handleLinkAccount,
          children: t('Link Now'),
        }}
      />
    );
  }

  if (status === Status.NO_AGREEMENT) {
    return user.role === Role.CAREGIVER ? (
      <NoteMessage
        message={t(
          'The linked user has not enabled location sharing. Please ask them to turn on location sharing in their app then refresh.',
        )}
        buttonProps={{
          onPress: handleRefresh,
          loading: isRefreshing,
          disabled: isRefreshing,
          children: tCommon('Refresh'),
        }}
      />
    ) : (
      <NoteMessage
        message={t("Location sharing is off. Turn it on to let your companions know you're safe.")}
        buttonProps={{
          onPress: handleTurnOnLocationSharing,
          children: t('Turn On Location Sharing'),
        }}
      />
    );
  }

  if (status === Status.NO_PERMISSION) {
    return (
      <NoteMessage
        message={t(
          "You're sharing your location, but the app still needs permission from your phone.",
        )}
        buttonProps={{
          onPress: requestPermission,
          children: tCommon('Go to Settings'),
        }}
      />
    );
  }

  if (status === Status.NO_DATA) {
    return user.role === Role.CAREGIVER ? (
      <NoteMessage
        message={t(
          'We cannot get the current location. The linked user may have just turned on location sharing or has not allowed location access on their device. Please check their settings or try again.',
        )}
        buttonProps={{
          onPress: handleRefresh,
          loading: isRefreshing,
          disabled: isRefreshing,
          children: t('Try Again'),
        }}
      />
    ) : (
      <NoteMessage
        message={t('Can’t find your location right now. Try again.')}
        buttonProps={{
          onPress: handleRefresh,
          loading: isRefreshing,
          disabled: isRefreshing,
          children: t('Try Again'),
        }}
      />
    );
  }

  if (status === Status.ONLY_SAFEZONE || !location) {
    return user.role === Role.CAREGIVER ? (
      <NoteMessage
        message={t(
          "No location data available yet. Please check the linked user's settings or try again.",
        )}
        buttonProps={{
          onPress: handleRefresh,
          loading: isRefreshing,
          disabled: isRefreshing,
          children: t('Try Again'),
        }}
      />
    ) : (
      <NoteMessage
        message={t('No location data available. Please refresh to update your location.')}
        buttonProps={{
          onPress: handleRefresh,
          loading: isRefreshing,
          disabled: isRefreshing,
          children: tCommon('Refresh'),
        }}
      />
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
              {markerName && <Text style={styles.markerName}>{markerName}</Text>}
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
        {safeZone && (
          <View style={[styles.warningChip, !isInSafeZone && safeZone && styles.warningChipOut]}>
            {!isInSafeZone && (
              <IconSymbol
                name="exclamationmark.triangle"
                size={StaticTheme.iconSize.xs}
                color={theme.colors.onPrimary}
              />
            )}
            <Text style={styles.warningText}>{warningText}</Text>
          </View>
        )}
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
          color={theme.colors.onSurfaceVariant}
          loading={isRefreshing}
          disabled={isLoadingLocation || isRefreshing}
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
          {/* Carereceiver: Turn off location sharing button */}
          {user.role === Role.CARERECEIVER && user.settings.allowShareLocation && (
            <ThemedButton mode="outlined" color="error" onPress={handleTurnOffLocationSharing}>
              {t('Turn Off Location Sharing')}
            </ThemedButton>
          )}
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
    | 'optionButton',
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
    backgroundColor: ({ colors }) => colorWithAlpha(colors.onPrimary, 0.8),
    paddingHorizontal: StaticTheme.spacing.xs,
    borderRadius: StaticTheme.borderRadius.s,
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
});

export default LocationSection;
