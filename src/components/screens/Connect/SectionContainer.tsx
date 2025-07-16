import { type ReactNode } from 'react';

import { Text, View } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import ThemedView from '@/components/atoms/ThemedView';

type SectionContainerProps =
  | {
      title: string;
      children: ReactNode;
      isExpanded: boolean;
      onToggle: () => void;
      hideToggle?: false;
    }
  | {
      title: string;
      children: ReactNode;
      hideToggle: true;
    };

const SectionContainer = ({ title, children, ...props }: SectionContainerProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <ThemedView style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {!props.hideToggle && (
          <ThemedIconButton
            name={props.isExpanded ? 'chevron.down' : 'chevron.right'}
            size={'tiny'}
            onPress={props.onToggle}
          />
        )}
      </View>
      {children}
    </ThemedView>
  );
};

const getStyles = createStyles<StyleRecord<'sectionContainer' | 'sectionHeader', 'sectionTitle'>>({
  sectionContainer: {
    gap: StaticTheme.spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: ({ fonts }) => fonts.titleLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.titleLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleLarge.lineHeight,
    color: ({ colors }) => colors.onSurface,
    marginBottom: StaticTheme.spacing.sm,
  },
});

export default SectionContainer;
