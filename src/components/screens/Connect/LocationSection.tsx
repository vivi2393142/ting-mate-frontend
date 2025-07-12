import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as Location from 'expo-location';
import { Alert, Text, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconButton from '@/components/atoms/IconButton';
import IconSymbol from '@/components/atoms/IconSymbol';
import ThemedButton from '@/components/atoms/ThemedButton';
import { googleMapStyles } from '@/theme/mapStyles';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { isPointInCircle } from '@/utils/locationUtils';
import { useTranslation } from 'react-i18next';

// TODO: Replace with real API data
const mockLocation = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const mockSafeZone: SafeZone = {
  latitude: 51.4529183,
  longitude: -2.5994918,
  radius: 1000,
};

const mockUserInfo = {
  name: 'Alice',
  lastUpdate: new Date('2024-01-15T10:30:00Z'),
};

interface SafeZone {
  latitude: number;
  longitude: number;
  radius: number;
}

// TODO: Get safe zone from API
// TODO: Add edit safe zone screen
// TODO: Get location from API for caregiver
// TODO: Sync location to BE for carereceiver
// TODO: Sync location in background
// TODO: Send 'out of safe zone' notification
// TODO: No map when no linked account
// TODO: No map when no location permission
const LocationSection = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const { t } = useTranslation('connect');

  // State for location and permissions
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const [location, setLocation] = useState(mockLocation);
  const [lastUpdate, setLastUpdate] = useState(mockUserInfo.lastUpdate);
  const [isLoading, setIsLoading] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);

  const mapRef = useRef<MapView>(null);

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      return status === 'granted';
    } catch {
      Alert.alert('Error', 'Failed to request location permission');
      return false;
    }
  }, []);

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

  const getCurrentLocation = useCallback(async () => {
    if (!hasLocationPermission) {
      const granted = await requestLocationPermission();
      if (!granted) return;
    }

    setIsLoading(true);
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
      panToLocation(newLocation);
    } catch {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  }, [hasLocationPermission, panToLocation, requestLocationPermission]);

  const handleEditSafeZone = useCallback(() => {}, []);

  const handlePanToSafeZone = useCallback(() => {
    mapRef.current?.animateToRegion(
      {
        latitude: mockSafeZone.latitude,
        longitude: mockSafeZone.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );
  }, []);

  const handlePanToLocation = useCallback(() => {
    panToLocation(location);
  }, [location, panToLocation]);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const isInSafeZone = useMemo(() => {
    return isPointInCircle(
      location.latitude,
      location.longitude,
      mockSafeZone.latitude,
      mockSafeZone.longitude,
      mockSafeZone.radius / 1000, // Convert meters to kilometers
    );
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

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
          initialRegion={location}
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
              <IconSymbol name="figure.wave" size={24} color={theme.colors.primary} />
              {mockUserInfo.name && <Text style={styles.markerName}>{mockUserInfo.name}</Text>}
            </View>
          </Marker>
          {/* Safe Zone Circle */}
          <Circle
            center={{
              latitude: mockSafeZone.latitude,
              longitude: mockSafeZone.longitude,
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
        </MapView>
        {/* Warning Container */}
        {!isLoading && (
          <View style={[styles.warningChip, !isInSafeZone && styles.warningChipOut]}>
            {!isInSafeZone && (
              <IconSymbol
                name="exclamationmark.triangle"
                size={12}
                color={theme.colors.onPrimary}
              />
            )}
            <Text style={styles.warningText}>
              {isInSafeZone ? t('In safe zone') : t('Outside safe zone')}
            </Text>
          </View>
        )}
        {/* Expand/Collapse Button */}
        <IconButton
          name={isExpanded ? 'chevron.down' : 'chevron.up'}
          onPress={handleToggleExpanded}
          size={20}
          color={theme.colors.onSurface}
          style={styles.expandButton}
        />
      </View>
      {/* Last Update Time and Refresh Button */}
      <View style={styles.updateWrapper}>
        <Text style={styles.updateText}>
          {t('Last updated:')} {lastUpdate.toLocaleTimeString()}
        </Text>
        <IconButton
          name={isLoading ? 'arrow.clockwise.circle' : 'arrow.clockwise'}
          onPress={getCurrentLocation}
          size={16}
          color={isLoading ? theme.colors.primary : theme.colors.onSurface}
          disabled={isLoading}
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
    backgroundColor: ({ colors }) => colors.primary,
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
    backgroundColor: ({ colors }) => colors.surface,
    shadowColor: ({ colors }) => colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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
