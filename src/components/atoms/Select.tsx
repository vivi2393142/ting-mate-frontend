import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { Button, Menu, type MenuItemProps } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import useUserStore from '@/store/useUserStore';
import { UserTextSize } from '@/types/user';
import IconSymbol from './IconSymbol';

type Value = string | number | boolean;
export type CustomMenuItemProps<T extends Value> = Omit<MenuItemProps, 'title'> & {
  render?: (value: T) => ReactNode;
  value: T;
};
interface SelectProps<V extends Value, T extends CustomMenuItemProps<V>> {
  displayValue: ReactNode;
  options: T[];
  onSelect: (option: T) => void;
}

const Select = <V extends Value, T extends CustomMenuItemProps<V>>({
  displayValue,
  options,
  onSelect,
}: SelectProps<V, T>) => {
  const userState = useUserStore((state) => state.user);
  const theme = useAppTheme();
  const [open, setOpen] = useState(false);

  const styles = useMemo(
    () => ({
      button: {
        borderRadius: 4,
      },
      buttonContent: {
        flexDirection: 'row-reverse' as const,
      },
      label: {
        marginVertical: theme.spacing.xs,
      },
      menuContent: {
        backgroundColor: theme.colors.background,
        paddingVertical: 0,
      },
      menuItem: {
        borderBottomColor: theme.colors.outlineVariant,
        borderBottomWidth: 1,
        height: userState?.settings.textSize === UserTextSize.LARGE ? 52 : 40,
      },
      menuItemLast: {
        borderBottomWidth: 0,
      },
    }),
    [
      theme.colors.background,
      theme.colors.outlineVariant,
      theme.spacing.xs,
      userState?.settings.textSize,
    ],
  );

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
          labelStyle={styles.label}
          icon={({ color }) => (
            <IconSymbol name="chevron.up.chevron.down" color={color} size={16}></IconSymbol>
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
