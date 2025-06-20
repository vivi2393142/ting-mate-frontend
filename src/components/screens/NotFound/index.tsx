import React from 'react';
import { useTranslation } from 'react-i18next';

import { Link, Stack } from 'expo-router';
import { Text } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles } from '@/utils/createStyles';

import ThemedView from '@/components/atoms/ThemedView';

const NotFoundScreen = () => {
  const { t } = useTranslation('common');

  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <>
      <Stack.Screen options={{ title: t('Oops!') }} />
      <ThemedView isRoot style={styles.container}>
        <Text>{t('This screen does not exist.')}</Text>
        <Link href="/" style={styles.link}>
          {/* TODO: Add link style */}
          <Text>{t('Go to home screen!')}</Text>
        </Link>
      </ThemedView>
    </>
  );
};

export default NotFoundScreen;

const getStyles = createStyles({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: StaticTheme.spacing.md,
  },
  link: {
    marginTop: StaticTheme.spacing.md,
    paddingVertical: StaticTheme.spacing.md,
  },
});
