import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert } from 'react-native';

const useErrorHandler = () => {
  const { t } = useTranslation('common');

  const handleRecordingError = useCallback((error: string, onError: () => void) => {
    console.error('Recording error:', error);
    onError();
  }, []);

  const handlePermissionError = useCallback(() => {
    Alert.alert(t('Permission to access microphone was denied'));
  }, [t]);

  return {
    handleRecordingError,
    handlePermissionError,
  };
};

export default useErrorHandler;
