import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View } from 'react-native';
import { Portal } from 'react-native-paper';

import { Route } from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import { setStaleDataServiceToStore, useNotificationStore } from '@/store/notificationStore';
import { StaticTheme } from '@/theme';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedText from '@/components/atoms/ThemedText';

const SNACKBAR_SHOW_DURATION = 10_000;

/**
 * A temporary button that appears when data is stale
 * Auto-removes after delay (handled by NotificationSyncHandler)
 */
const StaleDataRefreshSnackbar = () => {
  const { t } = useTranslation('common');
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const insets = useSafeAreaInsets();

  const staleDataService = useNotificationStore((s) => s.staleDataService);
  const pathname = usePathname();

  const isOnRefreshScreen =
    staleDataService && staleDataService.screens.includes(pathname as Route);

  // Auto-close snackbar after delay
  useEffect(() => {
    if (!isOnRefreshScreen) return;

    const timer = setTimeout(() => {
      setStaleDataServiceToStore(null);
    }, SNACKBAR_SHOW_DURATION);

    return () => clearTimeout(timer);
  }, [isOnRefreshScreen]);

  if (!isOnRefreshScreen) return null;
  return (
    <Portal>
      <View style={[styles.root, { paddingBottom: insets.bottom + StaticTheme.spacing.md * 1.25 }]}>
        <ThemedText color="onPrimary" style={styles.message}>
          {staleDataService.message}
        </ThemedText>
        <ThemedButton
          mode="outlined"
          onPress={() => {
            staleDataService.onRefresh();
            setStaleDataServiceToStore(null);
          }}
          style={styles.refreshButton}
          labelStyle={styles.refreshButtonLabel}
        >
          {t('Refresh')}
        </ThemedButton>
      </View>
    </Portal>
  );
};

const getStyles = createStyles<
  StyleRecord<'root' | 'refreshButton', 'message' | 'refreshButtonLabel'>
>({
  root: {
    backgroundColor: ({ colors }) => colors.onSurface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    elevation: 5,
    bottom: 0,
    padding: StaticTheme.spacing.md * 1.25,
  },
  message: {
    flex: 1,
    marginRight: StaticTheme.spacing.sm,
  },
  refreshButton: {
    backgroundColor: 'transparent',
    borderColor: ({ colors }) => colors.onPrimary,
  },
  refreshButtonLabel: {
    marginVertical: StaticTheme.spacing.sm,
    color: ({ colors }) => colors.onPrimary,
  },
});

export default StaleDataRefreshSnackbar;
