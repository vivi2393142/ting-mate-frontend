import { useLocalSearchParams } from 'expo-router';
import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { CopilotStep } from 'react-native-copilot';

import { Role } from '@/types/user';

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

  const params = useLocalSearchParams();
  const role = params.role as Role;
  const isCaregiver = role === Role.CAREGIVER;

  const { order, text } = useMemo(
    () =>
      (isCaregiver
        ? {
            [CopilotStepName.LOGIN]: {
              text: t('Sign up first so we can set you as a companion.'),
              order: 1,
            },
            [CopilotStepName.LINK_ACCOUNT]: {
              text: t('Link with your care partner to stay connected.'),
              order: 2,
            },
            [CopilotStepName.DISPLAY]: {
              text: t('Bigger text and simple design for easier reading.'),
              order: 3,
            },
          }
        : {
            [CopilotStepName.DISPLAY]: {
              text: t('Bigger text and simple design for easier reading.'),
              order: 1,
            },
            [CopilotStepName.LINK_ACCOUNT]: {
              text: t('Link with someone you care for or who cares for you.'),
              order: 2,
            },
            [CopilotStepName.LOGIN]: {
              text: t('Log in to connect with someone and stay in sync.'),
              order: 3,
            },
          })[name],
    [isCaregiver, name, t],
  );

  return (
    <CopilotStep text={text} order={order} name={name} active={active}>
      {children}
    </CopilotStep>
  );
};

export default SettingsCopilotStep;
