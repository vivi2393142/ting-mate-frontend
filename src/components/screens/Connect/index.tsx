import { useTranslation } from 'react-i18next';

import { Text } from 'react-native-paper';

import ThemedView from '@/components/atoms/ThemedView';

const ConnectScreen = () => {
  const { t } = useTranslation('common');

  return (
    <ThemedView isRoot>
      <Text>{t('Connect')}</Text>
    </ThemedView>
  );
};

export default ConnectScreen;
