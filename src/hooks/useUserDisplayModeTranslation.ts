import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { UserDisplayMode } from '@/types/user';

interface useUserDisplayModeTranslationResponse
  extends Omit<ReturnType<typeof useTranslation>, 't'> {
  tUserDisplayMode: (duration: UserDisplayMode) => string;
}

const useUserDisplayModeTranslation = (): useUserDisplayModeTranslationResponse => {
  const { t, ...methods } = useTranslation('common');

  const tUserDisplayMode = useCallback(
    (displayMode: UserDisplayMode) => {
      const mapping: Record<UserDisplayMode, string> = {
        [UserDisplayMode.FULL]: t('Full'),
        [UserDisplayMode.SIMPLE]: t('Simple'),
      };
      return mapping[displayMode];
    },
    [t],
  );

  return {
    ...methods,
    tUserDisplayMode,
  };
};

export default useUserDisplayModeTranslation;
