import { type PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Text } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';

import IconSymbol from '@/components/atoms/IconSymbol';
import ThemedView from '@/components/atoms/ThemedView';

const Collapsible = ({ children, title }: PropsWithChildren & { title: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useAppTheme();

  return (
    <ThemedView>
      <TouchableOpacity
        accessibilityRole="button"
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <IconSymbol
          name="chevron.right"
          size={18}
          color={theme.colors.onSurfaceVariant}
          // eslint-disable-next-line i18next/no-literal-string
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <Text>{title}</Text>
      </TouchableOpacity>
      {isOpen && (
        <ThemedView style={{ marginLeft: theme.spacing.lg, marginTop: theme.spacing.xs }}>
          {children}
        </ThemedView>
      )}
    </ThemedView>
  );
};

export default Collapsible;

const styles = StyleSheet.create({
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
});
