import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { Text } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedView from '@/components/atoms/ThemedView';
import EmergencySection from '@/components/screens/Connect/EmergencySection';
import LocationSection from '@/components/screens/Connect/LocationSection';
import SharedSection from '@/components/screens/Connect/SharedSection';

const ConnectScreen = () => {
  const { t } = useTranslation('connect');

  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <Fragment>
      <ScreenContainer scrollable style={styles.container} contentContainerStyle={styles.content}>
        {/* Care Receiver Location Section */}
        <ThemedView style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('Location')}</Text>
          <LocationSection />
        </ThemedView>
        {/* Emergency Contact Button Section */}
        <ThemedView style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('Emergency Contact')}</Text>
          <EmergencySection />
        </ThemedView>
        {/* Shared Log/Note Section */}
        <ThemedView style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('Shared Information')}</Text>
          <SharedSection />
        </ThemedView>
      </ScreenContainer>
    </Fragment>
  );
};

const getStyles = createStyles<
  StyleRecord<'container' | 'content' | 'sectionContainer', 'sectionTitle'>
>({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    gap: StaticTheme.spacing.md * 1.5,
  },
  sectionContainer: {
    gap: StaticTheme.spacing.xs,
  },
  sectionTitle: {
    fontSize: ({ fonts }) => fonts.titleLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.titleLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleLarge.lineHeight,
    marginBottom: StaticTheme.spacing.sm,
  },
});

export default ConnectScreen;
