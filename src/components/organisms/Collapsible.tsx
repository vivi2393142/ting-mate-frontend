import { type PropsWithChildren, useState } from 'react';

import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles } from '@/utils/createStyles';

import IconSymbol from '@/components/atoms/IconSymbol';
import ThemedView from '@/components/atoms/ThemedView';

const Collapsible = ({ children, title }: PropsWithChildren & { title: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useAppTheme();
  const styles = getStyles(theme, { isOpen });

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
          size={StaticTheme.iconSize.m}
          color={theme.colors.onSurfaceVariant}
          style={styles.icon}
        />

        <Text>{title}</Text>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
};

export default Collapsible;

const getStyles = createStyles({
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: StaticTheme.spacing.xs,
  },
  content: {
    marginLeft: StaticTheme.spacing.lg,
    marginTop: StaticTheme.spacing.xs,
  },
  icon: {
    transform: (_, params: { isOpen: boolean }) => [{ rotate: params.isOpen ? '90deg' : '0deg' }],
  },
});
