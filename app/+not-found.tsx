import React from 'react';

import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import ThemedText from '@/components/atoms/ThemedText';
import ThemedView from '@/components/atoms/ThemedView';

const NotFoundScreen = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <Stack.Screen options={{ title: t('Oops!') }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">{t('This screen does not exist.')}</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">{t('Go to home screen!')}</ThemedText>
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
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
