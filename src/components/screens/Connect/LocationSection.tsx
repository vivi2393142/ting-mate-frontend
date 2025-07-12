import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Text, View } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconSymbol from '@/components/atoms/IconSymbol';
import ThemedButton from '@/components/atoms/ThemedButton';

// TODO: change to real data
const mockIsInSafeZone = true;
const mockCurrentLocation = 'Taipei, Taiwan';

const LocationSection = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const { t } = useTranslation('connect');

  const handleSetSafeZone = useCallback(() => {
    // TODO: Implement set safe zone functionality
  }, []);

  return (
    <View style={styles.locationContent}>
      <View style={styles.statusRow}>
        <IconSymbol
          name={mockIsInSafeZone ? 'checkmark.circle' : 'xmark.circle'}
          size={20}
          color={mockIsInSafeZone ? theme.colors.primary : theme.colors.error}
        />
        <Text style={[styles.statusText, mockIsInSafeZone ? styles.safeText : styles.unsafeText]}>
          {mockIsInSafeZone ? t('In safe zone') : t('Outside zone')}
        </Text>
      </View>
      <Text style={styles.locationText}>
        {t('Current location:')} {mockCurrentLocation}
      </Text>
      <ThemedButton
        mode="outlined"
        icon="location"
        onPress={handleSetSafeZone}
        style={styles.safeZoneButton}
      >
        {t('Edit Safe Zone')}
      </ThemedButton>
    </View>
  );
};

const getStyles = createStyles<
  StyleRecord<
    'locationContent' | 'statusRow' | 'safeZoneButton',
    'statusText' | 'safeText' | 'unsafeText' | 'locationText'
  >
>({
  locationContent: {
    backgroundColor: ({ colors }) => colors.surfaceVariant,
    paddingVertical: StaticTheme.spacing.md * 1.25,
    paddingHorizontal: StaticTheme.spacing.lg,
    borderRadius: StaticTheme.borderRadius.s,
    gap: StaticTheme.spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StaticTheme.spacing.sm,
  },
  statusText: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
  },
  safeText: {
    color: ({ colors }) => colors.primary,
  },
  unsafeText: {
    color: ({ colors }) => colors.error,
  },
  locationText: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
  },
  safeZoneButton: {
    marginTop: StaticTheme.spacing.xs,
  },
});

export default LocationSection;
