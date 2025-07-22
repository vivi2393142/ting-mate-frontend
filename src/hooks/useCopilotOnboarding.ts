import debounce from 'lodash.debounce';
import { useEffect, useLayoutEffect } from 'react';
import { useCopilot } from 'react-native-copilot';

interface UseCopilotOnboardingProps {
  shouldShowCopilot: boolean;
  onStop: () => void;
  debounceMs?: number;
}

export function useCopilotOnboarding({
  shouldShowCopilot,
  onStop,
  debounceMs = 1000,
}: UseCopilotOnboardingProps) {
  const { copilotEvents, totalStepsNumber, start } = useCopilot();

  useLayoutEffect(() => {
    if (!shouldShowCopilot) return;
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
  }, [shouldShowCopilot, totalStepsNumber]);

  useEffect(() => {
    const handleStop = () => {
      onStop();
    };
    copilotEvents.on('stop', handleStop);

    return () => {
      copilotEvents.off('stop', handleStop);
    };
  }, [copilotEvents, onStop]);
}
