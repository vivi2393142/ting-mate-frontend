import { StyleSheet } from 'react-native';

import { StaticTheme } from '@/theme';

import ThemedView, { type ThemedViewProps } from '@/components/atoms/ThemedView';

type ScreenContainerProps = Omit<ThemedViewProps, 'isRoot'>;

const ScreenContainer = ({ children, style, ...rest }: ScreenContainerProps) => {
  return (
    <ThemedView {...rest} isRoot={true} style={[styles.container, style]}>
      {children}
    </ThemedView>
  );
};

export default ScreenContainer;

const styles = StyleSheet.create({
  container: {
    padding: StaticTheme.spacing.md,
  },
});
