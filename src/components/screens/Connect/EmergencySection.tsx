import { useCallback } from 'react';

import { Text, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconSymbol from '@/components/atoms/IconSymbol';
import { useTranslation } from 'react-i18next';

const EmergencySection = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const { t } = useTranslation('connect');

  const handleEmergencyCall = useCallback(() => {
    // TODO: Implement emergency call functionality
  }, []);

  return (
    <TouchableRipple
      onPress={handleEmergencyCall}
      style={styles.emergencyButton}
      rippleColor={colorWithAlpha(theme.colors.error, 0.1)}
    >
      <View style={styles.emergencyContent}>
        <IconSymbol name="phone" size={24} color={theme.colors.error} />
        <Text style={styles.emergencyTitle}>{t('Emergency Call')}</Text>
        <Text style={styles.emergencySubtitle}>{t('Call one care giver')}</Text>
        <Text style={styles.emergencySubtitle}>{t('Send notification to all care givers')}</Text>
      </View>
    </TouchableRipple>
  );
};

const getStyles = createStyles<
  StyleRecord<'emergencyButton' | 'emergencyContent', 'emergencyTitle' | 'emergencySubtitle'>
>({
  emergencyButton: {
    backgroundColor: ({ colors }) => colorWithAlpha(colors.error, 0.1),
    borderColor: ({ colors }) => colors.error,
    borderWidth: 1,
    borderRadius: StaticTheme.borderRadius.s,
    paddingVertical: StaticTheme.spacing.md * 1.25,
    paddingHorizontal: StaticTheme.spacing.lg,
  },
  emergencyContent: {
    alignItems: 'center',
    gap: StaticTheme.spacing.sm,
  },
  emergencyTitle: {
    fontSize: ({ fonts }) => fonts.titleMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.titleMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleMedium.lineHeight,
    color: ({ colors }) => colors.error,
  },
  emergencySubtitle: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
    textAlign: 'center',
  },
});

export default EmergencySection;
