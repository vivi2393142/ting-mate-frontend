import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Link, Stack } from 'expo-router';
import { Text } from 'react-native-paper';

import { spacing } from '@/theme';

import ThemedView from '@/components/atoms/ThemedView';

const NotFoundScreen = () => {
  const { t } = useTranslation('common');

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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  link: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
});
