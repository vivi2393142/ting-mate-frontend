import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ContactMethod } from '@/types/connect';

interface useContactMethodTranslationResponse extends Omit<ReturnType<typeof useTranslation>, 't'> {
  tContactMethod: (displayMode: ContactMethod) => string;
}

const useContactMethodTranslation = (): useContactMethodTranslationResponse => {
  const { t, ...methods } = useTranslation('common');

  const tContactMethod = useCallback(
    (method: ContactMethod) => {
      const mapping: Record<ContactMethod, string> = {
        [ContactMethod.PHONE]: t('contactMethod.Phone'),
        [ContactMethod.WHATSAPP]: t('contactMethod.WhatsApp'),
      };
      return mapping[method];
    },
    [t],
  );

  return {
    ...methods,
    tContactMethod,
  };
};

export default useContactMethodTranslation;
