import type { PropsWithChildren, ReactElement } from 'react';

import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { useBottomTabOverflow } from '@/components/atoms/TabBarBackground';
import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles } from '@/utils/createStyles';

import ThemedView from '@/components/atoms/ThemedView';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor?: { dark: string; light: string };
}>;

const ParallaxScrollView = ({ children, headerImage, headerBackgroundColor }: Props) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  const backgroundColor = headerBackgroundColor
    ? headerBackgroundColor[theme.dark ? 'dark' : 'light']
    : theme.colors.surfaceVariant;

  return (
    <ThemedView isRoot style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        <Animated.View style={[styles.header, { backgroundColor }, headerAnimatedStyle]}>
          {headerImage}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
};

export default ParallaxScrollView;

const getStyles = createStyles({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    gap: StaticTheme.spacing.md,
    overflow: 'hidden',
    padding: StaticTheme.spacing.xl,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
});
