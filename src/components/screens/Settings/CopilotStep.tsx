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
              text: t('Sign up to connect with your mate and use all features.'),
              order: 1,
            },
            [CopilotStepName.LINK_ACCOUNT]: {
              text: t('Connect with mates to view their info and stay in sync.'),
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
              text: t('Connect with your mates here to share and stay in sync.'),
              order: 2,
            },
            [CopilotStepName.LOGIN]: {
              text: t('Log in to connect a mate and use all features.'),
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
