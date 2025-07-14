import { router, Stack } from 'expo-router';
import { Fragment, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Slider from '@react-native-community/slider';
import { Button, Keyboard, Text, TouchableWithoutFeedback, View } from 'react-native';
import MapView, { Circle, type MapPressEvent, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Divider } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { googleMapStyles } from '@/theme/mapStyles';
import type { AddressData } from '@/types/connect';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import FormInput from '@/components/atoms/FormInput';
import IconSymbol from '@/components/atoms/IconSymbol';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedView from '@/components/atoms/ThemedView';
import AddressSearch from '@/components/screens/EditSafeZone/AddressSearch';

interface SafeZoneParams {
  radius: number;
  location: AddressData | null;
}

const EditSafeZone = () => {
  const { t } = useTranslation('connect');
  const { t: tCommon } = useTranslation('common');

  const theme = useAppTheme();
  const styles = getStyles(theme);

  // TODO: replace mock data
  const [safeZone, setSafeZone] = useState<SafeZoneParams>({
    location: {
      name: 'Chang Gung Memorial Hospital Taipei Branch',
      address: 'No. 199, Dunhua N Rd, Songshan District, Taipei City, Taiwan',
      latitude: 25.0585,
      longitude: 121.5443,
    },
    radius: 1000,
  });

  const handleSave = useCallback(() => {
    // TODO: Implement save functionality
    console.log('Saving safe zone:', safeZone);
    router.back();
  }, [safeZone]);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  const handleMapPress = useCallback((e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSafeZone((prev) => ({
      ...prev,
      location: {
        latitude,
        longitude,
        name: `(${latitude}, ${longitude})`,
        address: '',
      },
    }));
  }, []);

  const handleRadiusChange = useCallback((value: number) => {
    Keyboard.dismiss();
    setSafeZone((prev) => ({
      ...prev,
      radius: value,
    }));
  }, []);

  const handleAddressSelect = useCallback((newLocation: AddressData | null) => {
    setSafeZone((prev) => ({
      ...prev,
      location: newLocation,
    }));
  }, []);

  const instructions = [
    { icon: 'hand.tap', text: t('Tap on the map to set the center of your safe zone') },
  ] as const;

  const isValid = !!safeZone.location && safeZone.radius > 0;

  return (
    <Fragment>
      <Stack.Screen
        options={{
          title: t('Edit Safe Zone'),
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
              minimumValue={100}
              maximumValue={3000}
              step={100}
              value={safeZone.radius}
              onValueChange={handleRadiusChange}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.outlineVariant}
            />
            <View style={styles.radiusRange}>
              <Text style={styles.radiusRangeText}>{100 + t('m')}</Text>
              <Text style={styles.radiusRangeText}>{3 + t('km')}</Text>
            </View>
          </View>
          <Divider style={styles.divider} />
          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              mapType="standard"
              provider={PROVIDER_GOOGLE}
              // TODO: get initial region from safeZone.location
              initialRegion={{
                latitude: safeZone.location?.latitude ?? 0,
                longitude: safeZone.location?.longitude ?? 0,
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
              onPress={handleMapPress}
            >
              {/* Safe Zone Center Marker */}
              {safeZone.location && (
                <Fragment>
                  <Marker
                    coordinate={{
                      latitude: safeZone.location.latitude,
                      longitude: safeZone.location.longitude,
                    }}
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
                    center={{
                      latitude: safeZone.location.latitude,
                      longitude: safeZone.location.longitude,
                    }}
                    radius={safeZone.radius}
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
                <Text style={styles.instructionText}>{item.text}</Text>
              </View>
            ))}
          </ThemedView>
        </ScreenContainer>
      </TouchableWithoutFeedback>
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
    | 'divider',
    'radiusRangeText' | 'instructionText'
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
  radiusRangeText: {
    fontSize: ({ fonts }) => fonts.bodySmall.fontSize,
    fontWeight: ({ fonts }) => fonts.bodySmall.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodySmall.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
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
  instructionText: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.outline,
  },
  divider: {
    marginTop: StaticTheme.spacing.sm * 1.5,
    marginBottom: StaticTheme.spacing.md,
  },
});

export default EditSafeZone;
