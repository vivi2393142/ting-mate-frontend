import debounce from 'lodash.debounce';
import { useEffect, useLayoutEffect } from 'react';
import { useCopilot } from 'react-native-copilot';

interface UseCopilotOnboardingProps {
  hasSeenOnboarding: boolean;
  hasVisitedSection: boolean;
  onStop: () => void;
  debounceMs?: number;
}

export function useCopilotOnboarding({
  hasSeenOnboarding,
  hasVisitedSection,
  onStop,
  debounceMs = 1000,
}: UseCopilotOnboardingProps) {
  const { copilotEvents, totalStepsNumber, start } = useCopilot();

  useLayoutEffect(() => {
    if (!hasSeenOnboarding || hasVisitedSection) return;
    const debouncedStart = debounce(() => {
      start();
    }, debounceMs);

    debouncedStart();

    return () => {
      debouncedStart.cancel();
    };

    // HACK: Start call multiple times when the screen is mounted
    // see: https://github.com/mohebifar/react-native-copilot/issues/322
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSeenOnboarding, hasVisitedSection, totalStepsNumber]);

  useEffect(() => {
    const onStop = () => {
      onStop();
    };
    copilotEvents.on('stop', onStop);

    return () => {
      copilotEvents.off('stop', onStop);
    };
  }, [copilotEvents, onStop]);
}
