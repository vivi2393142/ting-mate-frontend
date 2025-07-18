import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet, View } from 'react-native';

import { LOCATION_SYNC_REFRESH_INTERVAL } from '@/constants';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useSyncCurrentLocation } from '@/hooks/useSyncCurrentLocation';
import useAuthStore from '@/store/useAuthStore';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { Role } from '@/types/user';

import CommonModal from '@/components/atoms/CommonModal';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedText from '@/components/atoms/ThemedText';

// TODO: Sync location in background
const LocationSyncHandler = () => {
  const { t } = useTranslation('common');

  const token = useAuthStore((s) => s.token);
  const user = useUserStore((s) => s.user);

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
        <ThemedText>
          {t(
            'Location sharing is on. Please allow the app to access your location in your phone settings.',
          )}
        </ThemedText>
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

const styles = StyleSheet.create({
  buttonContainer: {
    gap: StaticTheme.spacing.sm * 1.5,
    marginTop: StaticTheme.spacing.md * 1.5,
  },
});
