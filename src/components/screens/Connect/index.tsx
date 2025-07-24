import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { walkthroughable } from 'react-native-copilot';

import { ScrollView, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useCopilotOnboarding } from '@/hooks/useCopilotOnboarding';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { StaticTheme } from '@/theme';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedText from '@/components/atoms/ThemedText';
import CopilotProvider from '@/components/providers/CopilotProvider';
import ConnectCopilotStep, { CopilotStepName } from '@/components/screens/Connect/CopilotStep';
import EmergencySection from '@/components/screens/Connect/EmergencySection';
import LocationSection from '@/components/screens/Connect/LocationSection';
import SharedSection from '@/components/screens/Connect/SharedSection';

const CopilotView = walkthroughable(View);

const ConnectScreen = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const { t } = useTranslation('connect');

  const [activeTab, setActiveTab] = useState(CopilotStepName.LOCATION);

  // Handle copilot
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const hasVisitedConnect = useOnboardingStore((s) => s.hasVisitedConnect);

  useCopilotOnboarding({
    shouldShowCopilot: hasSeenOnboarding && !hasVisitedConnect,
    onStop: () => useOnboardingStore.getState().setHasVisitedConnect(true),
  });

  const TAB_LIST = useMemo(
    () => [
      { key: CopilotStepName.CONTACT, label: t('Mates’ Contacts') },
      { key: CopilotStepName.LOCATION, label: t('Mate’s Location') },
      { key: CopilotStepName.SHARED, label: t('Shared Space') },
    ],
    [t],
  );

  const handleStepChange = useCallback((step: CopilotStepName) => {
    setActiveTab(step);
  }, []);

  return (
    <ScreenContainer style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.tabRow}>
        {TAB_LIST.map((tab, idx) => (
          <TouchableRipple
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={styles.tabButton}
          >
            <ThemedText
              variant="titleMedium"
              color={activeTab === tab.key ? 'onPrimary' : 'onSurfaceVariant'}
              style={[
                styles.tabButtonContent,
                activeTab === tab.key && styles.tabButtonContentActive,
                idx === 0 && styles.tabButtonContentFirst,
                idx === TAB_LIST.length - 1 && styles.tabButtonContentLast,
              ]}
              numberOfLines={2}
            >
              {tab.label}
            </ThemedText>
          </TouchableRipple>
        ))}
      </View>
      <View style={styles.tabContentWrapper}>
        <ScrollView contentContainerStyle={styles.tabContentScroll}>
          <ConnectCopilotStep name={CopilotStepName.CONTACT} onStepChange={handleStepChange}>
            <CopilotView style={activeTab !== CopilotStepName.CONTACT && styles.hidden}>
              <EmergencySection />
            </CopilotView>
          </ConnectCopilotStep>
          <ConnectCopilotStep name={CopilotStepName.LOCATION} onStepChange={handleStepChange}>
            <CopilotView style={activeTab !== CopilotStepName.LOCATION && styles.hidden}>
              <LocationSection />
            </CopilotView>
          </ConnectCopilotStep>
          <ConnectCopilotStep name={CopilotStepName.SHARED} onStepChange={handleStepChange}>
            <CopilotView style={activeTab !== CopilotStepName.SHARED && styles.hidden}>
              <SharedSection />
            </CopilotView>
          </ConnectCopilotStep>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
};

const ConnectScreenWithCopilot = () => (
  <CopilotProvider>
    <ConnectScreen />
  </CopilotProvider>
);

export default ConnectScreenWithCopilot;

const getStyles = createStyles<
  StyleRecord<
    | 'container'
    | 'content'
    | 'tabRow'
    | 'tabButton'
    | 'tabContentWrapper'
    | 'tabContentScroll'
    | 'hidden',
    'tabButtonContent' | 'tabButtonContentActive' | 'tabButtonContentFirst' | 'tabButtonContentLast'
  >
>({
  container: {
    flex: 1,
    paddingBottom: 0,
  },
  content: {
    borderWidth: 1,
    paddingBottom: StaticTheme.spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: StaticTheme.spacing.md,
    marginBottom: StaticTheme.spacing.md,
    borderRadius: StaticTheme.borderRadius.s,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ({ colors }) => colors.outline,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: StaticTheme.spacing.xs / 2,
  },
  tabButtonContent: {
    backgroundColor: ({ colors }) => colors.surface,
    paddingVertical: StaticTheme.spacing.xs * 1.5,
    paddingHorizontal: StaticTheme.spacing.sm,
    width: '100%',
    textAlign: 'center',
  },
  tabButtonContentActive: {
    backgroundColor: ({ colors }) => colors.primary,
  },
  tabButtonContentFirst: {
    borderTopLeftRadius: StaticTheme.borderRadius.s,
    borderBottomLeftRadius: StaticTheme.borderRadius.s,
  },
  tabButtonContentLast: {
    borderTopRightRadius: StaticTheme.borderRadius.s,
    borderBottomRightRadius: StaticTheme.borderRadius.s,
  },
  tabContentWrapper: {
    flex: 1,
    minHeight: 0,
  },
  tabContentScroll: {
    flexGrow: 1,
  },
  hidden: {
    display: 'none',
  },
});
