import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { Stack, useRouter } from 'expo-router';

import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedText from '@/components/atoms/ThemedText';
import ThemedView from '@/components/atoms/ThemedView';

const NotFoundScreen = () => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const handleGoToHome = () => {
    router.push(ROUTES.HOME);
  };

  return (
    <Fragment>
      <Stack.Screen options={{ title: t('Oops!') }} />
      <ThemedView isRoot style={styles.container}>
        <ThemedText style={styles.text}>{t('This screen does not exist.')}</ThemedText>
        <ThemedButton onPress={handleGoToHome}>{t('Go to home screen!')}</ThemedButton>
      </ThemedView>
    </Fragment>
  );
};

export default NotFoundScreen;

const getStyles = createStyles<StyleRecord<'container', 'text'>>({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: StaticTheme.spacing.md,
  },
  text: {
    marginBottom: StaticTheme.spacing.md,
  },
});
