import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { CopilotStep } from 'react-native-copilot';

export const enum CopilotStepName {
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  SHARED = 'SHARED',
}

const ConnectCopilotStep = ({
  name,
  active,
  children,
}: {
  name: CopilotStepName;
  active?: boolean;
  children: ReactElement;
}) => {
  const { t } = useTranslation('connect');

  const { order, text } = useMemo(
    () =>
      ({
        [CopilotStepName.LOCATION]: {
          text: t('See where you or your mates are here.'),
          order: 1,
        },
        [CopilotStepName.CONTACT]: {
          text: t('Add contact info for your mates.'),
          order: 2,
        },
        [CopilotStepName.SHARED]: {
          text: t('Notes for you and your mates.'),
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
