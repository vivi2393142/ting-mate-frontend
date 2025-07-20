import { Stack, useRouter } from 'expo-router';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Slider from '@react-native-community/slider';
import { Button, Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import MapView, { Circle, type MapPressEvent, Marker, Region, UrlTile } from 'react-native-maps';
import { Divider } from 'react-native-paper';

import { useGetLinkedSafeZone, useUpdateSafeZone } from '@/api/userLocations';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useStackScreenOptionsHelper from '@/hooks/useStackScreenOptionsHelper';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import type { AddressData } from '@/types/connect';
import { Role } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, StyleRecord } from '@/utils/createStyles';
import {
  getMapDelta,
  getSafeCoordinatePair,
  getSafeLatitude,
  getSafeLongitude,
  getSafeRadius,
} from '@/utils/locationUtils';

import FormInput from '@/components/atoms/FormInput';
import IconSymbol from '@/components/atoms/IconSymbol';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import Skeleton from '@/components/atoms/Skeleton';
import ThemedText from '@/components/atoms/ThemedText';
import ThemedView from '@/components/atoms/ThemedView';
import AddressSearch from '@/components/screens/EditSafeZone/AddressSearch';

const DEFAULT_RADIUS = 50;

interface SafeZoneParams {
  radius: number;
  location: AddressData | null;
}

const EditSafeZoneScreen = () => {
  const { t } = useTranslation('connect');
  const { t: tCommon } = useTranslation('common');
  const getStackScreenOptions = useStackScreenOptionsHelper();

  const theme = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const user = useUserStore((s) => s.user);
  const mapRef = useRef<MapView>(null);
  const [mapDelta, setMapDelta] = useState({
    latitudeDelta: 0.04, // Default delta for initial load
    longitudeDelta: 0.04, // Default delta for initial load
  });

  const targetEmail = useMemo<string | undefined>(() => {
    if (!user || !user.email) return undefined;
    if (user.role === Role.CARERECEIVER) return user.email;
    return user.settings.linked[0]?.email;
  }, [user]);
  const { data: initSafeZone, isFetched } = useGetLinkedSafeZone(targetEmail || '', {
    enabled: !!targetEmail,
  });
  const updateSafeZoneMutation = useUpdateSafeZone();

  const [safeZone, setSafeZone] = useState<SafeZoneParams | null>(null);

  useEffect(() => {
    if (!safeZone && isFetched) {
      setSafeZone(
        initSafeZone || {
          location: null,
          radius: DEFAULT_RADIUS,
        },
      );
      if (initSafeZone) {
        const { latitudeDelta, longitudeDelta } = getMapDelta(
          initSafeZone.radius,
          initSafeZone.location.latitude,
        );
        mapRef.current?.animateToRegion({
          latitude: initSafeZone.location.latitude,
          longitude: initSafeZone.location.longitude,
          latitudeDelta,
          longitudeDelta,
        });
        setMapDelta({ latitudeDelta, longitudeDelta });
      }
    }
  }, [safeZone, isFetched, initSafeZone]);

  const handleSave = useCallback(() => {
    if (!targetEmail || !safeZone || !safeZone.location) return;

    updateSafeZoneMutation.mutate({
      targetEmail: targetEmail || '',
      safeZone: {
        location: safeZone.location,
        radius: safeZone.radius,
      },
    });
    router.back();
  }, [router, safeZone, targetEmail, updateSafeZoneMutation]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  // When user selects a new address, auto-zoom to fit the safe zone
  const handleAddressSelect = useCallback(
    (newLocation: AddressData | null) => {
      setSafeZone((prev) =>
        prev
          ? { ...prev, location: newLocation }
          : { location: newLocation, radius: DEFAULT_RADIUS },
      );
      if (newLocation && safeZone?.radius) {
        const { latitudeDelta, longitudeDelta } = getMapDelta(
          safeZone.radius,
          newLocation.latitude,
        );
        mapRef.current?.animateToRegion({
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          latitudeDelta,
          longitudeDelta,
        });
        // Update mapDelta state to keep in sync with user zoom
        setMapDelta({ latitudeDelta, longitudeDelta });
      }
    },
    [safeZone?.radius],
  );

  // When user taps the map to change center, only move center, keep current zoom
  const handleMapPress = useCallback(
    (e: MapPressEvent) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;

      // Validate coordinates
      if (!isFinite(latitude) || !isFinite(longitude)) {
        console.warn('Invalid coordinates received:', { latitude, longitude });
        return;
      }

      setSafeZone((prev) =>
        prev && prev.location
          ? { ...prev, location: { ...prev.location, latitude, longitude } }
          : prev,
      );
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: isFinite(mapDelta.latitudeDelta) ? mapDelta.latitudeDelta : 0.01,
        longitudeDelta: isFinite(mapDelta.longitudeDelta) ? mapDelta.longitudeDelta : 0.01,
      });
    },
    [mapDelta],
  );

  // When user changes radius, auto-zoom to fit the safe zone
  const handleRadiusChange = useCallback(
    (value: number) => {
      setSafeZone((prev) => (prev ? { ...prev, radius: value } : prev));
      if (safeZone?.location) {
        const { latitudeDelta, longitudeDelta } = getMapDelta(value, safeZone.location.latitude);
        mapRef.current?.animateToRegion({
          latitude: isFinite(safeZone.location.latitude) ? safeZone.location.latitude : 0,
          longitude: isFinite(safeZone.location.longitude) ? safeZone.location.longitude : 0,
          latitudeDelta: isFinite(latitudeDelta) ? latitudeDelta : 0.01,
          longitudeDelta: isFinite(longitudeDelta) ? longitudeDelta : 0.01,
        });
        // Update mapDelta state to keep in sync with user zoom
        setMapDelta({
          latitudeDelta: isFinite(latitudeDelta) ? latitudeDelta : 0.01,
          longitudeDelta: isFinite(longitudeDelta) ? longitudeDelta : 0.01,
        });
      }
    },
    [safeZone?.location],
  );

  // Keep mapDelta in sync with user manual zoom/pan
  const handleRegionChangeComplete = useCallback((region: Region) => {
    setMapDelta({
      latitudeDelta: isFinite(region.latitudeDelta) ? region.latitudeDelta : 0.01,
      longitudeDelta: isFinite(region.longitudeDelta) ? region.longitudeDelta : 0.01,
    });
  }, []);

  const instructions = [
    { icon: 'hand.tap', text: t('Tap on the map to set the center of your safe zone') },
  ] as const;

  const isValid = !!(safeZone && safeZone.location && safeZone.radius > 0);
  const isInitLoading = !safeZone;

  return (
    <Fragment>
      <Stack.Screen
        options={{
          ...getStackScreenOptions({ title: ROUTES.EDIT_SAFE_ZONE }),
          headerLeft: () => (
            <Button color={theme.colors.primary} onPress={handleCancel} title={tCommon('Cancel')} />
          ),
          headerRight: () => (
            <Button
              color={theme.colors.primary}
              onPress={handleSave}
              title={tCommon('Save')}
              disabled={!isValid}
            />
          ),
        }}
      />
      {isInitLoading ? (
        <View style={styles.loadingContainer}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} width={'100%'} height={58} />
          ))}
        </View>
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScreenContainer isRoot={false} style={styles.container}>
            {/* Address Search */}
            <AddressSearch
              selectedAddress={safeZone.location}
              onAddressSelect={handleAddressSelect}
            />
            <FormInput
              label={t('Radius')}
              icon="ruler"
              value={safeZone.radius.toString() + t('m')}
              readOnly={true}
            />
            <View style={styles.radiusWrapper}>
              <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={2000}
                step={10}
                value={safeZone.radius}
                onValueChange={handleRadiusChange}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.outlineVariant}
              />
              <View style={styles.radiusRange}>
                <ThemedText variant="bodySmall" color="onSurfaceVariant">
                  {10 + t('m')}
                </ThemedText>
                <ThemedText variant="bodySmall" color="onSurfaceVariant">
                  {2 + t('km')}
                </ThemedText>
              </View>
            </View>
            <Divider style={styles.divider} />
            {/* Map */}
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                mapType="standard"
                initialRegion={
                  safeZone?.location
                    ? {
                        latitude: getSafeLatitude(safeZone.location.latitude),
                        longitude: getSafeLongitude(safeZone.location.longitude),
                        latitudeDelta: isFinite(mapDelta.latitudeDelta)
                          ? mapDelta.latitudeDelta
                          : 0.01,
                        longitudeDelta: isFinite(mapDelta.longitudeDelta)
                          ? mapDelta.longitudeDelta
                          : 0.01,
                      }
                    : undefined
                }
                onRegionChangeComplete={handleRegionChangeComplete}
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
                onPress={handleMapPress}
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
                {/* Safe Zone Center Marker */}
                {safeZone.location && (
                  <Fragment>
                    <Marker
                      coordinate={getSafeCoordinatePair(
                        safeZone.location.latitude,
                        safeZone.location.longitude,
                      )}
                      tracksViewChanges={false}
                      anchor={{ x: 0.5, y: 0.5 }}
                    >
                      <View style={styles.markerContainer}>
                        <IconSymbol
                          name="shield"
                          size={StaticTheme.iconSize.l}
                          color={theme.colors.primary}
                        />
                      </View>
                    </Marker>
                    {/* Safe Zone Circle */}
                    <Circle
                      center={getSafeCoordinatePair(
                        safeZone.location.latitude,
                        safeZone.location.longitude,
                      )}
                      radius={getSafeRadius(safeZone.radius)}
                      fillColor={colorWithAlpha(theme.colors.primary, 0.2)}
                      strokeColor={theme.colors.primary}
                      strokeWidth={2}
                      zIndex={1}
                    />
                  </Fragment>
                )}
              </MapView>
            </View>
            {/* Instructions */}
            <ThemedView style={styles.instructions}>
              {instructions.map((item, idx) => (
                <View key={idx} style={styles.instructionRow}>
                  <IconSymbol
                    name={item.icon}
                    size={StaticTheme.iconSize.m}
                    color={theme.colors.primary}
                  />
                  <ThemedText variant="bodyMedium" color="outline">
                    {item.text}
                  </ThemedText>
                </View>
              ))}
            </ThemedView>
          </ScreenContainer>
        </TouchableWithoutFeedback>
      )}
    </Fragment>
  );
};

const getStyles = createStyles<
  StyleRecord<
    | 'container'
    | 'addressSection'
    | 'mapContainer'
    | 'map'
    | 'markerContainer'
    | 'radiusWrapper'
    | 'slider'
    | 'radiusRange'
    | 'instructions'
    | 'instructionRow'
    | 'divider'
    | 'loadingContainer'
  >
>({
  container: {
    flex: 1,
  },
  addressSection: {
    marginBottom: StaticTheme.spacing.md,
  },
  mapContainer: {
    height: 300,
    borderWidth: 1,
    borderRadius: StaticTheme.borderRadius.s,
    overflow: 'hidden',
    marginBottom: StaticTheme.spacing.md,
    borderColor: ({ colors }) => colors.outlineVariant,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusWrapper: {
    marginTop: StaticTheme.spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radiusRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  instructions: {
    backgroundColor: ({ colors }) => colors.surfaceVariant,
    paddingVertical: StaticTheme.spacing.md * 1.25,
    paddingHorizontal: StaticTheme.spacing.md,
    borderRadius: StaticTheme.borderRadius.s,
    gap: StaticTheme.spacing.sm * 1.25,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StaticTheme.spacing.sm * 1.25,
  },
  divider: {
    marginTop: StaticTheme.spacing.sm * 1.5,
    marginBottom: StaticTheme.spacing.md,
  },
  loadingContainer: {
    gap: StaticTheme.spacing.md,
    marginTop: StaticTheme.spacing.sm,
    marginBottom: StaticTheme.spacing.md,
  },
});

export default EditSafeZoneScreen;
