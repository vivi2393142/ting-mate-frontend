import { useTranslation } from 'react-i18next';

import { Text } from 'react-native-paper';

import ScreenContainer from '@/components/atoms/ScreenContainer';

const ConnectScreen = () => {
  const { t } = useTranslation('common');

  return (
    <ScreenContainer>
      <Text>{t('Connect')}</Text>
    </ScreenContainer>
  );
};

export default ConnectScreen;
