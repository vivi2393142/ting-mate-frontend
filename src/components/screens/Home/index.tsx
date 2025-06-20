import { useTranslation } from 'react-i18next';

import { Text } from 'react-native-paper';

import ThemedView from '@/components/atoms/ThemedView';

const HomeScreen = () => {
  const { t } = useTranslation('common');

  return (
    <ThemedView isRoot>
      <Text>{t('Home')}</Text>
    </ThemedView>
  );
};

export default HomeScreen;
