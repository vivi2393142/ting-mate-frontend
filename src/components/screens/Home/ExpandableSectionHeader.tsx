import { useMemo } from 'react';

import { List } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';

import { StaticTheme } from '@/theme';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconSymbol from '@/components/atoms/IconSymbol';

interface ExpandableSectionHeaderProps {
  title: string;
  isExpanded: boolean;
  chevronType: 'up' | 'down' | 'right';
  count?: number;
  onPress: () => void;
}

const ExpandableSectionHeader = ({
  title,
  isExpanded,
  chevronType,
  count,
  onPress,
}: ExpandableSectionHeaderProps) => {
  const userTextSize = useUserTextSize();

  const theme = useAppTheme();
  const styleParams = useMemo(() => ({ userTextSize }), [userTextSize]);
  const styles = getStyles(theme, styleParams);

  return (
    <List.Item
      title={count !== undefined ? `${title} (${count})` : title}
      right={() => (
        <IconSymbol
          name={`chevron.${chevronType}`}
          color={theme.colors.primary}
          size={StaticTheme.iconSize.s}
        />
      )}
      onPress={onPress}
      style={[styles.collapseListItem, isExpanded && styles.collapseListItemExpanded]}
      titleStyle={[
        styles.collapseListItemTitle,
        isExpanded && styles.collapseListItemTitleExpanded,
      ]}
      containerStyle={styles.collapseListItemContent}
    />
  );
};

export default ExpandableSectionHeader;

const getStyles = createStyles<
  StyleRecord<
    'collapseListItem' | 'collapseListItemExpanded' | 'collapseListItemContent',
    'collapseListItemTitle' | 'collapseListItemTitleExpanded'
  >
>({
  collapseListItem: {
    padding: StaticTheme.spacing.xs,
    borderWidth: 1,
    borderColor: ({ colors }) => colorWithAlpha(colors.primary, 0.3),
    borderRadius: StaticTheme.borderRadius.s,
    backgroundColor: ({ colors }) => colors.background,
  },
  collapseListItemExpanded: {
    borderColor: ({ colors }) => colors.primary,
  },
  collapseListItemTitle: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    color: ({ colors }) => colors.outline,
  },
  collapseListItemTitleExpanded: {
    color: ({ colors }) => colors.onSurface,
  },
  collapseListItemContent: {
    alignItems: 'center',
  },
});
