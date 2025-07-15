import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Text, View } from 'react-native';

import { LOCATION_SYNC_REFRESH_INTERVAL } from '@/constants';
import useAppTheme from '@/hooks/useAppTheme';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useSyncCurrentLocation } from '@/hooks/useSyncCurrentLocation';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { Role } from '@/types/user';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import CommonModal from '@/components/atoms/CommonModal';
import ThemedButton from '@/components/atoms/ThemedButton';

const LocationSyncHandler = () => {
  const { t } = useTranslation('common');
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const { token, user } = useUserStore.getState();
  const { isGranted, requestPermission } = useLocationPermission();
  useSyncCurrentLocation({ interval: LOCATION_SYNC_REFRESH_INTERVAL });

  // Only show modal if user is carereceiver, linked, allowShareLocation, and permission not granted
  const shouldShowModal = !!(
    user &&
    token &&
    user.settings.allowShareLocation &&
    user.role === Role.CARERECEIVER &&
    user.settings.linked.length > 0 &&
    !isGranted
  );

  // Track if user denied modal in this permission cycle
  const [denied, setDenied] = useState(false);
  const prevShouldShowModal = useRef(false);

  // Reset denied if shouldShowModal transitions from false to true
  useEffect(() => {
    if (shouldShowModal && !prevShouldShowModal.current) {
      setDenied(false);
    }
    prevShouldShowModal.current = shouldShowModal;
  }, [shouldShowModal]);

  const handleDenyPermission = useCallback(() => {
    setDenied(true);
  }, []);

  if (shouldShowModal && !denied) {
    return (
      <CommonModal
        visible={true}
        title={t('Location Access Needed')}
        onDismiss={handleDenyPermission}
        topIcon="lock.open"
      >
        <Text style={styles.text}>
          {t(
            'Location sharing is on. Please allow the app to access your location in your phone settings.',
          )}
        </Text>
        <View style={styles.buttonContainer}>
          <ThemedButton onPress={requestPermission}>{t('Go to Settings')}</ThemedButton>
          <ThemedButton mode="outlined" onPress={handleDenyPermission}>
            {t('Not Now')}
          </ThemedButton>
        </View>
      </CommonModal>
    );
  }

  // Return null for all other cases (no UI needed)
  return null;
};

export default LocationSyncHandler;

const getStyles = createStyles<StyleRecord<'buttonContainer', 'text'>>({
  buttonContainer: {
    gap: StaticTheme.spacing.sm * 1.5,
    marginTop: StaticTheme.spacing.md * 1.5,
  },
  text: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
  },
});
