import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, ViewStyle } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';

export type SkeletonVariant = 'rounded' | 'circular' | 'rectangular';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width: number | `${number}%`;
  height: number | `${number}%`;
  color?: string;
  style?: ViewStyle;
}

const Skeleton = ({ variant = 'rounded', width, height, color, style }: SkeletonProps) => {
  const theme = useAppTheme();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Border radius by variant
  const borderRadius = useMemo(() => {
    switch (variant) {
      case 'circular':
        return typeof width === 'number' ? width / 2 : 100;
      case 'rectangular':
        return 0;
      default:
        return StaticTheme.borderRadius.s;
    }
  }, [variant, width]);

  // Pulse animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: color || theme.colors.outlineVariant,
          opacity: pulseAnim,
        },
        styles.skeleton,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    borderWidth: 0,
  },
});

export default Skeleton;
