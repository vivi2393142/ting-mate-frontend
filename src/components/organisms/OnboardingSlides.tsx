import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import useAppTheme from '@/hooks/useAppTheme';
import { useOnboardingState } from '@/hooks/useOnboardingState';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedText from '@/components/atoms/ThemedText';
import OnboardingConnectSvg from '@/components/svg/OnboardingConnectSvg';
import OnboardingSafeSvg from '@/components/svg/OnboardingSafeSvg';
import OnboardingTaskSvg from '@/components/svg/OnboardingTaskSvg';

enum SlideKey {
  TASK = 'TASK',
  CONNECT = 'CONNECT',
  SAFE = 'SAFE',
}

const svgMap = {
  [SlideKey.TASK]: OnboardingTaskSvg,
  [SlideKey.CONNECT]: OnboardingConnectSvg,
  [SlideKey.SAFE]: OnboardingSafeSvg,
};

const slideKeys = Object.values(SlideKey);

const AnimatedDot = ({ isActive, onClick }: { isActive: boolean; onClick: () => void }) => {
  const theme = useAppTheme();
  const styles = getDotStyles(theme);

  const widthAnim = useSharedValue(isActive ? 32 : 8);

  const aniStyle = useAnimatedStyle(() => ({
    width: widthAnim.value,
  }));

  useEffect(() => {
    widthAnim.value = withTiming(isActive ? 32 : 8, { duration: 300 });
  }, [isActive, widthAnim]);

  return (
    <Pressable onPress={onClick}>
      <Animated.View style={[styles.dot, isActive && styles.activeDot, aniStyle]} />
    </Pressable>
  );
};

// OnboardingScreen manages its own onboarding state and completion.
export const OnboardingScreen = () => {
  const { t } = useTranslation('common');

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const [current, setCurrent] = useState(0);

  const { hasSeenOnboarding, setHasSeenOnboarding } = useOnboardingState();

  const handleClickDot = (idx: number) => () => {
    setCurrent(idx);
  };

  const handleNext = useCallback(() => {
    setCurrent(current + 1);
  }, [current]);

  const handleDone = useCallback(() => {
    void setHasSeenOnboarding(true);
  }, [setHasSeenOnboarding]);

  // Animate slide content
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    translateX.value = withTiming(-current * width, { duration: 350 });
  }, [current, width, translateX]);

  // Slide titles
  const slideTitles = {
    [SlideKey.TASK]: {
      title: t('Manage Daily Tasks'),
      subtitle: t('Set reminders and check off tasks like medicine or appointments.'),
    },
    [SlideKey.CONNECT]: {
      title: t('Connect with Someone'),
      subtitle: t('Link accounts to manage tasks together and stay connected.'),
    },
    [SlideKey.SAFE]: {
      title: t('Stay Safe and Together'),
      subtitle: t('Get alerts if a loved one leaves a safe zone.'),
    },
  };

  if (hasSeenOnboarding) return null;

  return (
    <ScreenContainer isRoot style={[StyleSheet.absoluteFill, styles.root]}>
      <View style={styles.content}>
        <View style={[styles.slidesContainer, styles.imageSlidesContainer]}>
          {slideKeys.map((slideKey) => {
            const SvgImage = svgMap[slideKey];
            return (
              <Animated.View key={slideKey} style={[styles.slide, animatedContentStyle]}>
                <SvgImage />
              </Animated.View>
            );
          })}
        </View>
        <View style={styles.dotsContainer}>
          {slideKeys.map((_, idx) => (
            <AnimatedDot key={idx} isActive={current === idx} onClick={handleClickDot(idx)} />
          ))}
        </View>
        <View style={styles.slidesContainer}>
          {slideKeys.map((slideKey) => (
            <Animated.View key={slideKey} style={[styles.slide, animatedContentStyle]}>
              <ThemedText variant="headlineLarge" color="primary" style={styles.title}>
                {slideTitles[slideKey].title}
              </ThemedText>
              <ThemedText color="onSurfaceVariant" style={styles.subtitle}>
                {slideTitles[slideKey].subtitle}
              </ThemedText>
            </Animated.View>
          ))}
        </View>
        <View style={styles.slide}>
          {current < slideKeys.length - 1 ? (
            <ThemedButton accessibilityLabel={t('Next slide')} onPress={handleNext}>
              {t('Next')}
            </ThemedButton>
          ) : (
            <ThemedButton accessibilityLabel={t('Next slide')} onPress={handleDone}>
              {t('Get Started')}
            </ThemedButton>
          )}
          <ThemedButton
            accessibilityLabel={t('Skip Onboarding')}
            onPress={handleDone}
            style={styles.skipButton}
            labelStyle={styles.skipButtonLabel}
          >
            {t('Skip')}
          </ThemedButton>
        </View>
      </View>
    </ScreenContainer>
  );
};

const getDotStyles = createStyles<StyleRecord<'dot' | 'activeDot'>>({
  dot: {
    width: 8,
    height: 8,
    borderRadius: StaticTheme.borderRadius.s,
    backgroundColor: ({ colors }) => colors.outlineVariant,
  },
  activeDot: {
    backgroundColor: ({ colors }) => colors.primary,
    width: 32,
  },
});

const getStyles = createStyles<
  StyleRecord<
    | 'root'
    | 'content'
    | 'slidesContainer'
    | 'imageSlidesContainer'
    | 'slide'
    | 'dotsContainer'
    | 'skipButton',
    'title' | 'subtitle' | 'skipButtonLabel'
  >
>({
  root: {
    zIndex: 9999,
    backgroundColor: ({ colors }) => colors.background,
    paddingHorizontal: 0,
  },
  content: {
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  slidesContainer: {
    flexDirection: 'row',
  },
  imageSlidesContainer: {
    alignItems: 'center',
    height: '50%',
  },
  slide: {
    paddingHorizontal: StaticTheme.spacing.lg,
    width: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm,
    justifyContent: 'center',
    paddingVertical: StaticTheme.spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    paddingTop: StaticTheme.spacing.md,
    paddingBottom: StaticTheme.spacing.xxl,
  },
  skipButton: {
    marginTop: StaticTheme.spacing.md,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignSelf: 'center',
  },
  skipButtonLabel: {
    marginVertical: StaticTheme.spacing.xs,
    color: ({ colors }) => colors.error,
  },
});

export default OnboardingScreen;
