import { Fragment, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Text, View } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import ThemedView from '@/components/atoms/ThemedView';
import EmergencySection from '@/components/screens/Connect/EmergencySection';
import LocationSection from '@/components/screens/Connect/LocationSection';
import SharedSection from '@/components/screens/Connect/SharedSection';

const ConnectScreen = () => {
  const { t } = useTranslation('connect');

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);

  const handleToggleLocationExpanded = useCallback(() => {
    setIsLocationExpanded((prev) => !prev);
  }, []);

  const handleToggleContactExpanded = useCallback(() => {
    setIsContactExpanded((prev) => !prev);
  }, []);

  const handleToggleNoteExpanded = useCallback(() => {
    setIsNoteExpanded((prev) => !prev);
  }, []);

  return (
    <Fragment>
      <ScreenContainer scrollable style={styles.container} contentContainerStyle={styles.content}>
        {/* Care Receiver Location Section */}
        <ThemedView style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('Location')}</Text>
            <ThemedIconButton
              name={isLocationExpanded ? 'chevron.down' : 'chevron.right'}
              size={'tiny'}
              onPress={handleToggleLocationExpanded}
            />
          </View>
          <LocationSection isExpanded={isLocationExpanded} />
        </ThemedView>
        {/* Emergency Contact Button Section */}
        <ThemedView style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('Emergency Contact')}</Text>
            <ThemedIconButton
              name={isContactExpanded ? 'chevron.down' : 'chevron.right'}
              size={'tiny'}
              onPress={handleToggleContactExpanded}
            />
          </View>
          <EmergencySection isExpanded={isContactExpanded} />
        </ThemedView>
        {/* Shared Log/Note Section */}
        <ThemedView style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('Shared Information')}</Text>
            <ThemedIconButton
              name={isNoteExpanded ? 'chevron.down' : 'chevron.right'}
              size={'tiny'}
              onPress={handleToggleNoteExpanded}
            />
          </View>
          <SharedSection isExpanded={isNoteExpanded} />
        </ThemedView>
      </ScreenContainer>
    </Fragment>
  );
};

const getStyles = createStyles<
  StyleRecord<'container' | 'content' | 'sectionContainer' | 'sectionHeader', 'sectionTitle'>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: ({ fonts }) => fonts.titleLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.titleLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleLarge.lineHeight,
    marginBottom: StaticTheme.spacing.sm,
  },
});

export default ConnectScreen;
