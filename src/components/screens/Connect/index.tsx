import useAppTheme from '@/hooks/useAppTheme';
import { useCopilotOnboarding } from '@/hooks/useCopilotOnboarding';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { StaticTheme } from '@/theme';
import { createStyles, StyleRecord } from '@/utils/createStyles';
import { walkthroughable } from 'react-native-copilot';

import { View } from 'react-native';

import ScreenContainer from '@/components/atoms/ScreenContainer';
import ConnectCopilotStep, { CopilotStepName } from '@/components/screens/Connect/CopilotStep';
import EmergencySection from '@/components/screens/Connect/EmergencySection';
import LocationSection from '@/components/screens/Connect/LocationSection';
import SharedSection from '@/components/screens/Connect/SharedSection';

const CopilotView = walkthroughable(View);

const ConnectScreen = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  // Handle copilot
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const hasVisitedConnect = useOnboardingStore((s) => s.hasVisitedConnect);

  useCopilotOnboarding({
    hasSeenOnboarding,
    hasVisitedSection: hasVisitedConnect,
    onStop: () => useOnboardingStore.getState().setHasVisitedConnect(true),
  });

  return (
    <ScreenContainer scrollable style={styles.container} contentContainerStyle={styles.content}>
      <ConnectCopilotStep name={CopilotStepName.LOCATION}>
        <CopilotView>
          <LocationSection />
        </CopilotView>
      </ConnectCopilotStep>
      <ConnectCopilotStep name={CopilotStepName.CONTACT}>
        <CopilotView>
          <EmergencySection />
        </CopilotView>
      </ConnectCopilotStep>
      <ConnectCopilotStep name={CopilotStepName.SHARED}>
        <CopilotView>
          <SharedSection />
        </CopilotView>
      </ConnectCopilotStep>
    </ScreenContainer>
  );
};

const getStyles = createStyles<StyleRecord<'container' | 'content'>>({
  container: {
    flex: 1,
  },
  content: {
    gap: StaticTheme.spacing.md * 1.5,
    paddingBottom: StaticTheme.spacing.md,
  },
});

export default ConnectScreen;
