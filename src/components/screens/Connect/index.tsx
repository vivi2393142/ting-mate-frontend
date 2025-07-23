import { useState } from 'react';
import { walkthroughable } from 'react-native-copilot';

import { View } from 'react-native';
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

const TAB_LIST = [
  { key: 'contact', label: 'Contact' },
  { key: 'location', label: 'Location' },
  { key: 'shared', label: 'Shared' },
];

const ConnectScreen = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const [activeTab, setActiveTab] = useState('location');

  // Handle copilot
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const hasVisitedConnect = useOnboardingStore((s) => s.hasVisitedConnect);

  useCopilotOnboarding({
    shouldShowCopilot: hasSeenOnboarding && !hasVisitedConnect,
    onStop: () => useOnboardingStore.getState().setHasVisitedConnect(true),
  });

  return (
    <ScreenContainer scrollable style={styles.container} contentContainerStyle={styles.content}>
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
            >
              {tab.label}
            </ThemedText>
          </TouchableRipple>
        ))}
      </View>
      {activeTab === 'contact' && (
        <ConnectCopilotStep name={CopilotStepName.CONTACT}>
          <CopilotView>
            <EmergencySection />
          </CopilotView>
        </ConnectCopilotStep>
      )}
      {activeTab === 'location' && (
        <ConnectCopilotStep name={CopilotStepName.LOCATION}>
          <CopilotView>
            <LocationSection />
          </CopilotView>
        </ConnectCopilotStep>
      )}
      {activeTab === 'shared' && (
        <ConnectCopilotStep name={CopilotStepName.SHARED}>
          <CopilotView>
            <SharedSection />
          </CopilotView>
        </ConnectCopilotStep>
      )}
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
    'container' | 'content' | 'tabRow' | 'tabButton',
    'tabButtonContent' | 'tabButtonContentActive' | 'tabButtonContentFirst' | 'tabButtonContentLast'
  >
>({
  container: {
    flex: 1,
  },
  content: {
    gap: StaticTheme.spacing.md * 1.5,
    paddingBottom: StaticTheme.spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: StaticTheme.spacing.md,
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
    paddingVertical: StaticTheme.spacing.md,
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
});
