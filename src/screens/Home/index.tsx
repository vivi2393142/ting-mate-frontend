import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';

import { Image } from 'expo-image';

import useAppTheme from '@/hooks/useAppTheme';

import ThemedText from '@/components/atoms/ThemedText';
import ThemedView from '@/components/atoms/ThemedView';
import HelloWave from '@/components/organisms/HelloWave';

import ParallaxScrollView from '@/components/organisms/ParallaxScrollView';

const HomeScreen = () => {
  const theme = useAppTheme();
  const { t } = useTranslation('home');

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: theme.colors.primaryContainer,
        dark: theme.colors.primaryContainer,
      }}
      headerImage={
        <Image
          accessibilityIgnoresInvertColors
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t('Welcome!')}</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t('Step 1: Try it')}</ThemedText>
        <ThemedText>
          {/* eslint-disable-next-line i18next/no-literal-string */}
          {t('Edit')} <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{' '}
          {t('to see changes. Press')}{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              // eslint-disable-next-line i18next/no-literal-string
              ios: 'cmd + d',
              // eslint-disable-next-line i18next/no-literal-string
              android: 'cmd + m',
              // eslint-disable-next-line i18next/no-literal-string
              web: 'F12',
            })}
          </ThemedText>{' '}
          {t('to open developer tools.')}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t('Step 2: Explore')}</ThemedText>
        <ThemedText>
          {t("Tap the Explore tab to learn more about what's included in this starter app.")}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t('Step 3: Get a fresh start')}</ThemedText>
        <ThemedText>
          {t("When you're ready, run")} {/* eslint-disable-next-line i18next/no-literal-string */}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText>{' '}
          {/* eslint-disable-next-line i18next/no-literal-string */}
          {t('to get a fresh')} <ThemedText type="defaultSemiBold">app</ThemedText>{' '}
          {t('directory. This will move the current')}{' '}
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <ThemedText type="defaultSemiBold">app</ThemedText> {t('to')}{' '}
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  reactLogo: {
    bottom: 0,
    height: 178,
    left: 0,
    position: 'absolute',
    width: 290,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
