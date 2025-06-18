import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';

import { Image } from 'expo-image';

import useAppTheme from '@/hooks/useAppTheme';

import IconSymbol from '@/components/atoms/IconSymbol';
import ThemedText from '@/components/atoms/ThemedText';
import ThemedView from '@/components/atoms/ThemedView';
import Collapsible from '@/components/molecules/Collapsible';
import ExternalLink from '@/components/molecules/ExternalLink';
import ParallaxScrollView from '@/components/organisms/ParallaxScrollView';

const TabTwoScreen = () => {
  const theme = useAppTheme();
  const { t } = useTranslation('explore');

  return (
    <ParallaxScrollView
      headerImage={
        <IconSymbol
          size={310}
          color={theme.colors.onSurfaceVariant}
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t('Explore')}</ThemedText>
      </ThemedView>
      <ThemedText>{t('This app includes example code to help you get started.')}</ThemedText>
      <Collapsible title={t('File-based routing')}>
        <ThemedText>
          {t('This app has two screens:')}{' '}
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          {t('The layout file in')} {/* eslint-disable-next-line i18next/no-literal-string */}
          <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          {t('sets up the tab navigator.')}
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">{t('Learn more')}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={t('Android, iOS, and web support')}>
        <ThemedText>
          {t(
            'You can open this project on Android, iOS, and the web. To open the web version, press',
          )}
          {/* eslint-disable-next-line i18next/no-literal-string */}{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText>{' '}
          {t('in the terminal running this project.')}
        </ThemedText>
      </Collapsible>
      <Collapsible title={t('Images')}>
        <ThemedText>
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <ThemedText type="defaultSemiBold">@3x</ThemedText>{' '}
          {t('suffixes to provide files for different screen densities')}
        </ThemedText>
        <Image source={require('@/assets/images/react-logo.png')} style={styles.centerImage} />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">{t('Learn more')}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={t('Custom fonts')}>
        <ThemedText>
          {/* eslint-disable-next-line i18next/no-literal-string */}
          {t('Open')} <ThemedText type="defaultSemiBold">app/_layout.tsx</ThemedText>{' '}
          {t('to see how to load')}{' '}
          <ThemedText style={styles.spaceMonoFont}>
            {t('custom fonts such as this one.')}
          </ThemedText>
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
          <ThemedText type="link">{t('Learn more')}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={t('Light and dark mode components')}>
        <ThemedText>
          {t('This template has light and dark mode support. The')}{' '}
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <ThemedText type="defaultSemiBold">useAppTheme()</ThemedText>{' '}
          {t('hook lets you access the current theme and adjust UI colors accordingly.')}
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">{t('Learn more')}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={t('Animations')}>
        <ThemedText>
          {t('This template includes an example of an animated component. The')}{' '}
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText>{' '}
          {t('component uses the powerful')}{' '}
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <ThemedText type="defaultSemiBold">react-native-reanimated</ThemedText>{' '}
          {t('library to create a waving hand animation.')}
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              {t('The')} {/* eslint-disable-next-line i18next/no-literal-string */}
              <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              {t('component provides a parallax effect for the header image.')}
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
};

export default TabTwoScreen;

const styles = StyleSheet.create({
  centerImage: {
    alignSelf: 'center',
  },
  headerImage: {
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  spaceMonoFont: {
    fontFamily: 'SpaceMono',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
