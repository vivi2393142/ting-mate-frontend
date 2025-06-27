import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';

interface EllipsisLoadingProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const EllipsisLoading = ({ size = 8, color, style }: EllipsisLoadingProps) => {
  const theme = useAppTheme();

  const animatedValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const circleColor = color || theme.colors.onPrimary;

  useEffect(() => {
    const animations = animatedValues.map((value, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 600,
            delay: index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
    });

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [animatedValues]);

  return (
    <View style={[styles.container, style]}>
      {animatedValues.map((animatedValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              backgroundColor: circleColor,
              opacity: animatedValue,
              marginHorizontal: size * 0.3,
            },
          ]}
        />
      ))}
    </View>
  );
};

export default EllipsisLoading;

const styles = StyleSheet.create({
  circle: {
    borderRadius: StaticTheme.borderRadius.round,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
