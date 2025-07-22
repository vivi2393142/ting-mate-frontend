import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { CopilotStep } from 'react-native-copilot';

export const enum CopilotStepName {
  VIEW_TASKS = 'VIEW_TASKS',
  ADD_TASK = 'ADD_TASK',
  VOICE_COMMAND = 'VOICE_COMMAND',
}

const HomeCopilotStep = ({
  name,
  active,
  children,
}: {
  name: CopilotStepName;
  active?: boolean;
  children: ReactElement;
}) => {
  const { t } = useTranslation('home');

  const { order, text } = useMemo(
    () =>
      ({
        [CopilotStepName.VIEW_TASKS]: {
          text: t('Your tasks will show up here.'),
          order: 1,
        },
        [CopilotStepName.ADD_TASK]: {
          text: t('Tap here to add a task.'),
          order: 2,
        },
        [CopilotStepName.VOICE_COMMAND]: {
          text: t('You can also edit tasks with your voice.'),
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

export default HomeCopilotStep;
