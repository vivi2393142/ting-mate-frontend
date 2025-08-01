import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, View } from 'react-native';
import MapView, { Circle, MAP_TYPES, Marker, UrlTile } from 'react-native-maps';
import { Divider } from 'react-native-paper';

import { useUpdateUserSettings } from '@/api/user';
import {
  useGetCanGetLocation,
  useGetLinkedLocation,
  useGetLinkedSafeZone,
} from '@/api/userLocations';
import { LAST_UPDATE_DATETIME_FORMAT, LOCATION_SYNC_REFRESH_INTERVAL } from '@/constants';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useSyncCurrentLocation } from '@/hooks/useSyncCurrentLocation';
import useAuthStore from '@/store/useAuthStore';
import useLocationStore from '@/store/useLocationStore';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import type { SafeZone } from '@/types/connect';
import type { LocationData } from '@/types/location';
import { Role, User } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import {
  getMapDelta,
  getSafeCoordinatePair,
  getSafeLatitude,
  getSafeLongitude,
  getSafeRadius,
  isPointInCircle,
} from '@/utils/locationUtils';

import IconSymbol from '@/components/atoms/IconSymbol';
import Skeleton from '@/components/atoms/Skeleton';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import ThemedText from '@/components/atoms/ThemedText';
import NoteMessage from '@/components/screens/Connect/NoteMessage';

// TODO: use theme color
const whatsAppColor = '#25A366';

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

const LocationSection = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { t } = useTranslation('connect');
  const { t: tCommon } = useTranslation('common');

  const router = useRouter();

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
    return user.settings.linked.filter((u) => u.role === Role.CARERECEIVER)?.[0]?.email;
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
    enabled: user?.role === Role.CAREGIVER && !!canCaregiverGetLocation,
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
    updateUserSettingsMutation.mutate({ allowShareLocation: true });
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
      t('Turn off location sharing? Your mate won’t be able to see where you are.'),
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
  }, [router]);

  const handleLinkAccount = useCallback(() => {
    router.push({
      pathname: ROUTES.ACCOUNT_LINKING,
      params: { from: ROUTES.CONNECT },
    });
  }, [router]);

  const handleEditSafeZone = useCallback(() => {
    console.log('handleEditSafeZone');
    router.push({
      pathname: ROUTES.EDIT_SAFE_ZONE,
      params: { from: ROUTES.CONNECT },
    });
  }, [router]);

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
    if (user?.role === Role.CAREGIVER) {
      return user.settings.linked.filter((u) => u.role === Role.CARERECEIVER)?.[0]?.name;
    }
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
        message={t("Connect with a mate first to get mate's location.")}
        buttonProps={{
          onPress: handleLinkAccount,
          children: t('Connect Now'),
        }}
      />
    );
  }

  if (status === Status.NO_AGREEMENT) {
    return user.role === Role.CAREGIVER ? (
      <NoteMessage
        message={t(
          'Your mate hasn’t shared their location yet. Ask them to turn it on and refresh.',
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
        message={t('Location is off. Turn it on to let mates know you’re okay.')}
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
        message={t('YTurn on location access in your phone to share.')}
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
          'Can’t load their location yet. They might’ve just turned it on or need to allow access. Try again soon.',
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
        message={t('No location info yet. Please check your mate’s settings or try again.')}
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
      <View style={[styles.mapContainer, !isInSafeZone && safeZone && styles.mapContainerWarning]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType={MAP_TYPES.NONE}
          initialRegion={{
            latitude: getSafeLatitude(location.latitude),
            longitude: getSafeLongitude(location.longitude),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
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
          {/* BUG: Default map is not working on iOS 18 simulator, 
                see https://developer.apple.com/forums/thread/765787 for updates */}
          <UrlTile
            // eslint-disable-next-line i18next/no-literal-string
            urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
            shouldReplaceMapContent={true}
          />
          {/* User Location Marker */}
          <Marker
            coordinate={getSafeCoordinatePair(location.latitude, location.longitude)}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.markerContainer}>
              <IconSymbol
                name="figure.wave"
                size={StaticTheme.iconSize.l}
                color={isInSafeZone ? whatsAppColor : theme.colors.error}
              />
              {markerName && (
                <ThemedText
                  variant="bodyMedium"
                  style={isInSafeZone ? styles.markerName : styles.markerNameOut}
                >
                  {markerName}
                </ThemedText>
              )}
            </View>
          </Marker>
          {/* Safe Zone Circle */}
          {safeZone && (
            <Circle
              center={getSafeCoordinatePair(
                safeZone.location.latitude,
                safeZone.location.longitude,
              )}
              radius={getSafeRadius(safeZone.radius)}
              fillColor={colorWithAlpha(isInSafeZone ? whatsAppColor : theme.colors.error, 0.2)}
              strokeColor={isInSafeZone ? whatsAppColor : theme.colors.error}
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
            <ThemedText variant="bodyMedium" color="onPrimary">
              {warningText}
            </ThemedText>
          </View>
        )}
      </View>
      {/* Last Update Time and Refresh Button */}
      <View style={styles.updateWrapper}>
        <ThemedText variant="bodyMedium" color="onSurfaceVariant">
          {t('Last updated:')}{' '}
          {location.lastUpdate
            ? dayjs(location.lastUpdate).format(LAST_UPDATE_DATETIME_FORMAT)
            : '--'}
        </ThemedText>
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
      <View style={styles.expandedOptions}>
        <View style={styles.optionsRow}>
          <ThemedButton
            mode="outlined"
            icon="location"
            size="small"
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
              size="small"
              onPress={handlePanToSafeZone}
              style={styles.optionButton}
              disabled={isLoadingSafeZone}
            >
              {t('Go to Safe Zone')}
            </ThemedButton>
          )}
        </View>
        <ThemedButton mode="outlined" icon="gearshape" size="small" onPress={handleEditSafeZone}>
          {t('Edit Safe Zone')}
        </ThemedButton>
        <Divider />
        {/* Carereceiver: Turn off location sharing button */}
        {user.role === Role.CARERECEIVER && user.settings.allowShareLocation && (
          <ThemedButton
            mode="outlined"
            color="error"
            size="small"
            onPress={handleTurnOffLocationSharing}
          >
            {t('Turn Off Location Sharing')}
          </ThemedButton>
        )}
      </View>
    </View>
  );
};

const getStyles = createStyles<
  StyleRecord<
    | 'container'
    | 'mapContainer'
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
    'markerName' | 'markerNameOut'
  >
>({
  container: {
    gap: StaticTheme.spacing.xs * 1.5,
  },
  mapContainer: {
    height: 450,
    width: '100%',
    borderRadius: StaticTheme.borderRadius.s,
    overflow: 'hidden',
    position: 'relative',
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
    paddingHorizontal: StaticTheme.spacing.xs,
    borderRadius: StaticTheme.borderRadius.s,
    color: whatsAppColor,
  },
  markerNameOut: {
    color: ({ colors }) => colors.error,
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
    backgroundColor: whatsAppColor,
  },
  warningChipOut: {
    backgroundColor: ({ colors }) => colors.error,
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
  expandedOptions: {
    gap: StaticTheme.spacing.sm * 1.5,
    marginTop: StaticTheme.spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm * 1.5,
  },
  optionButton: {
    flex: 1,
  },
});

export default LocationSection;
