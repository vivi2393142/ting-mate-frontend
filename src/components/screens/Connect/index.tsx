import { useMemo, useState } from 'react';
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
import { useTranslation } from 'react-i18next';

enum TabKey {
  CONTACT = 'CONTACT',
  LOCATION = 'LOCATION',
  SHARED = 'SHARED',
}

const CopilotView = walkthroughable(View);

const ConnectScreen = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const { t } = useTranslation('connect');

  const [activeTab, setActiveTab] = useState(TabKey.LOCATION);

  // Handle copilot
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const hasVisitedConnect = useOnboardingStore((s) => s.hasVisitedConnect);

  useCopilotOnboarding({
    shouldShowCopilot: hasSeenOnboarding && !hasVisitedConnect,
    onStop: () => useOnboardingStore.getState().setHasVisitedConnect(true),
  });

  const TAB_LIST = useMemo(
    () => [
      { key: TabKey.CONTACT, label: t('Mates’ Contacts') },
      { key: TabKey.LOCATION, label: t('Mate’s Location') },
      { key: TabKey.SHARED, label: t('Shared Space') },
    ],
    [t],
  );

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
          {activeTab === TabKey.CONTACT && (
            <ConnectCopilotStep name={CopilotStepName.CONTACT}>
              <CopilotView>
                <EmergencySection />
              </CopilotView>
            </ConnectCopilotStep>
          )}
          {activeTab === TabKey.LOCATION && (
            <ConnectCopilotStep name={CopilotStepName.LOCATION}>
              <CopilotView>
                <LocationSection />
              </CopilotView>
            </ConnectCopilotStep>
          )}
          {activeTab === TabKey.SHARED && (
            <ConnectCopilotStep name={CopilotStepName.SHARED}>
              <CopilotView>
                <SharedSection />
              </CopilotView>
            </ConnectCopilotStep>
          )}
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
    'container' | 'content' | 'tabRow' | 'tabButton' | 'tabContentWrapper' | 'tabContentScroll',
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
});
