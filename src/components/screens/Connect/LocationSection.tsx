import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Text, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { googleMapStyles } from '@/theme/mapStyles';
import { SafeZone } from '@/types/connect';
import { Role } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { isPointInCircle } from '@/utils/locationUtils';

import IconSymbol from '@/components/atoms/IconSymbol';
import Skeleton from '@/components/atoms/Skeleton';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';

// TODO: Replace with real API data
const mockIsAllowed = true;

const mockLocation = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const mockSafeZone: SafeZone = {
  location: {
    latitude: 51.4529183,
    longitude: -2.5994918,
    name: 'Safe Zone',
    address: '123 Main St, Anytown, USA',
  },
  radius: 1000,
};

const mockUserInfo = {
  name: 'Alice',
  lastUpdate: new Date('2024-01-15T10:30:00Z'),
};

export enum Status {
  LOADING = 'LOADING', // Data is loading from API
  NO_AGREEMENT = 'NO_AGREEMENT', // User has not agreed to share location in backend settings
  NO_PERMISSION = 'NO_PERMISSION', // User agreed in backend, but device location permission is not granted
  NO_DATA = 'NO_DATA', // No safezone and no location data available
  ONLY_SAFEZONE = 'ONLY_SAFEZONE', // Safezone exists, but no location data
  // ONLY_LOCATION = 'ONLY_LOCATION', // Location exists, but no safezone data
  READY = 'READY', // Both safezone and location data are available
}

// TODO: Get safe zone from API
// TODO: Add edit safe zone screen
// TODO: Get location from API for caregiver
// TODO: Sync location to BE for carereceiver
// TODO: Sync location in background
// TODO: Send 'out of safe zone' notification
// TODO: No map when no linked account
// TODO: No map when no location permission
const LocationSection = ({ isExpanded }: { isExpanded: boolean }) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { user } = useUserStore();

  const { t } = useTranslation('connect');

  // State for location and permissions
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const [location, setLocation] = useState(mockLocation);
  const [lastUpdate, setLastUpdate] = useState(mockUserInfo.lastUpdate);
  const [isLoading] = useState(false);

  const mapRef = useRef<MapView>(null);

  const panToLocation = useCallback((newLocation: { latitude: number; longitude: number }) => {
    mapRef.current?.animateToRegion(
      {
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );
  }, []);

  const requestLocationPermission = useCallback(async () => {
    if (hasLocationPermission) return true;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      return status === 'granted';
    } catch {
      Alert.alert('Error', 'Failed to request location permission');
      return false;
    }
  }, [hasLocationPermission]);

  const handleCarereceiverRefresh = useCallback(async () => {
    const granted = await requestLocationPermission();
    if (!granted) return;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setLocation(newLocation);
      setLastUpdate(new Date());
      return newLocation;
    } catch {
      Alert.alert('Error', 'Failed to get current location');
    }
  }, [requestLocationPermission]);

  const handleCaregiverRefresh = useCallback(async () => {
    // TODO: Handle update current location API
    setLocation(mockLocation);
    setLastUpdate(new Date());
    return mockLocation;
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!user || !mockIsAllowed) return;
    if (user.role === Role.CARERECEIVER) {
      const newLocation = await handleCarereceiverRefresh();
      if (newLocation) panToLocation(newLocation);
    } else {
      const newLocation = await handleCaregiverRefresh();
      if (newLocation) panToLocation(newLocation);
    }
  }, [handleCaregiverRefresh, handleCarereceiverRefresh, panToLocation, user]);

  const handleEditSafeZone = useCallback(() => {
    router.push(ROUTES.EDIT_SAFE_ZONE);
  }, []);

  const handlePanToSafeZone = useCallback(() => {
    mapRef.current?.animateToRegion(
      {
        latitude: mockSafeZone.location.latitude,
        longitude: mockSafeZone.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );
  }, []);

  const handlePanToLocation = useCallback(() => {
    panToLocation(location);
  }, [location, panToLocation]);

  const isInSafeZone = useMemo(() => {
    return isPointInCircle(
      location.latitude,
      location.longitude,
      mockSafeZone.location.latitude,
      mockSafeZone.location.longitude,
      mockSafeZone.radius / 1000, // Convert meters to kilometers
    );
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    // TODO: Get initial location
  }, []);

  const status = useMemo(() => {
    if (isLoading) return Status.LOADING;
    if (!mockIsAllowed) return Status.NO_AGREEMENT;
    if (!user) return Status.NO_DATA;
    if (user.role === Role.CARERECEIVER) {
      if (!hasLocationPermission) return Status.NO_PERMISSION;
      return Status.READY;
    } else {
      if (location) return Status.READY;
      if (mockSafeZone) return Status.ONLY_SAFEZONE;
      return Status.NO_DATA;
    }
  }, [isLoading, user, hasLocationPermission, location]);

  if (status === Status.LOADING) {
    return (
      <View style={styles.container}>
        <Skeleton width={'100%'} height={150} />
      </View>
    );
  }

  if (status === Status.NO_AGREEMENT) {
    return <View style={styles.note}>{/* TODO: Redirect to settings screen */}</View>;
  }

  if (status === Status.NO_PERMISSION) {
    return (
      <View style={styles.note}>
        <ThemedButton mode="contained" icon="location" onPress={handleCarereceiverRefresh}>
          {t('Grant Location Permission')}
        </ThemedButton>
      </View>
    );
  }

  if (status === Status.NO_DATA) {
    return (
      <View style={styles.note}>
        <View style={styles.note}>
          <ThemedButton mode="contained" icon="arrow.clockwise" onPress={handleRefresh}>
            {t('Refresh')}
          </ThemedButton>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Container */}
      <View
        style={[
          styles.mapContainer,
          isExpanded && styles.mapContainerExpanded,
          !isInSafeZone && styles.mapContainerWarning,
        ]}
      >
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType="standard"
          provider={PROVIDER_GOOGLE}
          initialRegion={location || mockSafeZone.location}
          customMapStyle={googleMapStyles}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          zoomEnabled={!isLoading}
          scrollEnabled={!isLoading}
          rotateEnabled={!isLoading}
          pitchEnabled={!isLoading}
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
              {mockUserInfo.name && <Text style={styles.markerName}>{mockUserInfo.name}</Text>}
            </View>
          </Marker>
          {/* Safe Zone Circle */}
          {mockSafeZone && (
            // TODO: Add hint for no safe zone
            <Circle
              center={{
                latitude: mockSafeZone.location.latitude,
                longitude: mockSafeZone.location.longitude,
              }}
              radius={mockSafeZone.radius}
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
        {!isLoading && (
          <View style={[styles.warningChip, !isInSafeZone && styles.warningChipOut]}>
            {!isInSafeZone && (
              <IconSymbol
                name="exclamationmark.triangle"
                size={StaticTheme.iconSize.xs}
                color={theme.colors.onPrimary}
              />
            )}
            <Text style={styles.warningText}>
              {isInSafeZone ? t('In safe zone') : t('Outside safe zone')}
            </Text>
          </View>
        )}
      </View>
      {/* Last Update Time and Refresh Button */}
      <View style={styles.updateWrapper}>
        <Text style={styles.updateText}>
          {t('Last updated:')} {lastUpdate.toLocaleTimeString()}
        </Text>
        <ThemedIconButton
          name={isLoading ? 'arrow.clockwise.circle' : 'arrow.clockwise'}
          onPress={handleRefresh}
          size={'tiny'}
          disabled={isLoading}
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
              disabled={isLoading}
            >
              {t('Go to User')}
            </ThemedButton>
            <ThemedButton
              mode="outlined"
              icon="shield"
              onPress={handlePanToSafeZone}
              style={styles.optionButton}
              disabled={isLoading}
            >
              {t('Go to Safe Zone')}
            </ThemedButton>
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
