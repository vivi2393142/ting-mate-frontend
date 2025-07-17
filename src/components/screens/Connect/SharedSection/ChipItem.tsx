import { View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

interface ChipItemProps {
  label: string;
  description: string;
  onPress: () => void;
}

const ChipItem = ({ label, description, onPress }: ChipItemProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <TouchableRipple
      onPress={onPress}
      style={styles.chip}
      rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
    >
      <View style={styles.chipContent}>
        <Text style={styles.chipLabel}>{label}</Text>
        <Text style={styles.chipDesc} numberOfLines={1} ellipsizeMode="tail">
          {description}
        </Text>
      </View>
    </TouchableRipple>
  );
};

export default ChipItem;

const getStyles = createStyles<StyleRecord<'chip' | 'chipContent', 'chipLabel' | 'chipDesc'>>({
  chip: {
    borderBottomWidth: 1,
    borderColor: ({ colors }) => colors.outlineVariant,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StaticTheme.spacing.sm * 1.5,
    paddingHorizontal: StaticTheme.spacing.sm,
    paddingVertical: StaticTheme.spacing.xs * 1.5,
  },
  chipLabel: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
    color: ({ colors }) => colors.primary,
  },
  chipDesc: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
    flex: 1,
  },
});
