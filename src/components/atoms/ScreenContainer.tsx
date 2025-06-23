import { StyleSheet } from 'react-native';

import { StaticTheme } from '@/theme';

import ThemedView, { type ThemedViewProps } from '@/components/atoms/ThemedView';

const ScreenContainer = ({ children, style, ...rest }: ThemedViewProps) => {
  return (
    <ThemedView isRoot={true} {...rest} style={[styles.container, style]}>
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
