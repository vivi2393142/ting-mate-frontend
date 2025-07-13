import { type ReactNode, useCallback, useState } from 'react';

import { Button, Menu, type MenuItemProps } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import type { TextStyle } from 'react-native';

import IconSymbol from '@/components/atoms/IconSymbol';

type Value = string | number | boolean;
export type CustomMenuItemProps<T extends Value> = Omit<MenuItemProps, 'title'> & {
  render?: (value: T) => ReactNode;
  value: T;
};
export interface SelectProps<V extends Value, T extends CustomMenuItemProps<V>> {
  displayValue: ReactNode;
  options: T[];
  labelStyle?: TextStyle;
  onSelect: (option: T) => void;
}

const Select = <V extends Value, T extends CustomMenuItemProps<V>>({
  displayValue,
  options,
  labelStyle,
  onSelect,
}: SelectProps<V, T>) => {
  const userTextSize = useUserTextSize();

  const theme = useAppTheme();
  const styles = getStyles(theme, { textSize: userTextSize });

  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSelect = (option: T) => {
    onSelect(option);
    handleClose();
  };

  return (
    <Menu
      visible={open}
      onDismiss={handleClose}
      anchor={
        <Button
          compact
          onPress={handleOpen}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.label, labelStyle]}
          icon={({ color }) => (
            <IconSymbol
              name="chevron.up.chevron.down"
              color={color}
              size={StaticTheme.iconSize.s}
            />
          )}
        >
          {displayValue}
        </Button>
      }
      anchorPosition="bottom"
      contentStyle={styles.menuContent}
    >
      {options.map((option: T, idx) => {
        const { value, render, ...menuItemProps } = option;
        return (
          <Menu.Item
            key={value.toString()}
            title={render ? render(value) : value}
            onPress={() => handleSelect(option)}
            {...menuItemProps}
            style={[styles.menuItem, idx === options.length - 1 && styles.menuItemLast]}
          />
        );
      })}
    </Menu>
  );
};

export default Select;

interface StyleParams {
  textSize: UserTextSize;
}

const getStyles = createStyles<
  StyleRecord<'button' | 'buttonContent' | 'menuContent' | 'menuItem' | 'menuItemLast', 'label'>,
  StyleParams
>({
  button: {
    borderRadius: StaticTheme.borderRadius.s,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
  },
  label: {
    marginVertical: StaticTheme.spacing.xs,
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
  },
  menuContent: {
    backgroundColor: ({ colors }) => colors.background,
    paddingVertical: 0,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: ({ colors }) => colors.outlineVariant,
    height: (_, { textSize }) => (textSize === UserTextSize.LARGE ? 52 : 40),
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
});
