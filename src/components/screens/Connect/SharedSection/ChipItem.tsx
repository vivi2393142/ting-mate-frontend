import { View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import ThemedText from '@/components/atoms/ThemedText';
import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

interface ChipItemProps {
  size?: 'small' | 'medium';
  label: string;
  description: string;
  onPress: () => void;
}

const ChipItem = ({ size, label, description, onPress }: ChipItemProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <TouchableRipple
      onPress={onPress}
      style={styles.chip}
      rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
    >
      <View style={[styles.chipContent, size === 'small' && styles.chipContentSmall]}>
        <ThemedText color="primary">{label}</ThemedText>
        <ThemedText color="outline" numberOfLines={1} ellipsizeMode="tail" style={styles.chipDesc}>
          {description}
        </ThemedText>
      </View>
    </TouchableRipple>
  );
};

export default ChipItem;

const getStyles = createStyles<
  StyleRecord<'chip' | 'chipContent' | 'chipContentSmall', 'chipDesc'>
>({
  chip: {
    borderBottomWidth: 1,
    borderColor: ({ colors }) => colors.outlineVariant,
  },
  chipContent: {
    gap: StaticTheme.spacing.sm,
    paddingHorizontal: StaticTheme.spacing.sm,
    paddingVertical: StaticTheme.spacing.sm * 1.5,
  },
  chipContentSmall: {
    paddingVertical: StaticTheme.spacing.xs * 1.25,
    gap: StaticTheme.spacing.md,
    flexDirection: 'row',
  },
  chipDesc: {
    flex: 1,
  },
});
