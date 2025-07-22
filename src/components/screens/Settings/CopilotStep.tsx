import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { CopilotStep } from 'react-native-copilot';

export const enum CopilotStepName {
  DISPLAY = 'DISPLAY',
  LINK_ACCOUNT = 'LINK_ACCOUNT',
  LOGIN = 'LOGIN',
}

const SettingsCopilotStep = ({
  name,
  active,
  children,
}: {
  name: CopilotStepName;
  active?: boolean;
  children: ReactElement;
}) => {
  const { t } = useTranslation('settings');

  const { order, text } = useMemo(
    () =>
      ({
        [CopilotStepName.DISPLAY]: {
          text: t('Bigger text and simple design for easier reading.'),
          order: 1,
        },
        [CopilotStepName.LINK_ACCOUNT]: {
          text: t('Link with someone you care for or who cares for you.'),
          order: 2,
        },
        [CopilotStepName.LOGIN]: {
          text: t('Log in to link accounts and stay in sync.'),
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

export default SettingsCopilotStep;
