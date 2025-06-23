import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { UserTextSize } from '@/types/user';

interface useUserTextSizeTranslationResponse extends Omit<ReturnType<typeof useTranslation>, 't'> {
  tUserTextSize: (userTextSize: UserTextSize) => string;
}

const useUserTextSizeTranslation = (): useUserTextSizeTranslationResponse => {
  const { t, ...methods } = useTranslation('common');

  const tUserTextSize = useCallback(
    (textSize: UserTextSize) => {
      const mapping: Record<UserTextSize, string> = {
        [UserTextSize.STANDARD]: t('userTextSize.Standard'),
        [UserTextSize.LARGE]: t('userTextSize.Large'),
      };
      return mapping[textSize];
    },
    [t],
  );

  return {
    ...methods,
    tUserTextSize,
  };
};

export default useUserTextSizeTranslation;
