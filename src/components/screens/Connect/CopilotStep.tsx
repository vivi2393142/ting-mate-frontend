import { useEffect, useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { CopilotStep, useCopilot } from 'react-native-copilot';

export const enum CopilotStepName {
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  SHARED = 'SHARED',
}

type CopilotContextType = ReturnType<typeof useCopilot>;
type CurrentStep = CopilotContextType['currentStep'];

const ConnectCopilotStep = ({
  name,
  active,
  onStepChange,
  children,
}: {
  name: CopilotStepName;
  active?: boolean;
  onStepChange?: (step: CopilotStepName) => void;
  children: ReactElement;
}) => {
  const { t } = useTranslation('connect');

  const { copilotEvents } = useCopilot();

  useEffect(() => {
    const listener = (step: CurrentStep) => {
      if (!step) return;
      onStepChange?.(step.name as CopilotStepName);
    };

    copilotEvents.on('stepChange', listener);
    return () => {
      copilotEvents.off('stepChange', listener);
    };
  }, [copilotEvents, onStepChange]);

  const { order, text } = useMemo(
    () =>
      ({
        [CopilotStepName.CONTACT]: {
          text: t('Add contact info for your mates.'),
          order: 2,
        },
        [CopilotStepName.LOCATION]: {
          text: t('See where you or your mates are here.'),
          order: 1,
        },
        [CopilotStepName.SHARED]: {
          text: t('Notes and logs for you and your mates.'),
          order: 3,
        },
      })[name],
    [name, t],
  );

  return (
    <CopilotStep text={text} order={order} name={name} active={active}>
      {children}
    </CopilotStep>
  );
};

export default ConnectCopilotStep;
