import { type ReactNode, useState } from 'react';

import { Button, Menu, type MenuItemProps } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import IconSymbol from './IconSymbol';

export type CustomMenuItemProps<T extends string | number | boolean> = Omit<
  MenuItemProps,
  'title'
> & {
  render?: (value: T) => ReactNode;
  value: T;
};
interface SelectProps<V extends string | number | boolean, T extends CustomMenuItemProps<V>> {
  displayValue?: ReactNode;
  options: T[];
  onSelect: (option: T) => void;
}

const Select = <V extends string | number, T extends CustomMenuItemProps<V>>({
  displayValue,
  options,
  onSelect,
}: SelectProps<V, T>) => {
  const theme = useAppTheme();
  const [open, setOpen] = useState(false);

  const styles = {
    button: {
      borderRadius: 4,
    },
    buttonContent: {
      flexDirection: 'row-reverse' as const,
    },
    label: {
      marginVertical: theme.spacing.xs,
    },
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
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
    >
      {options.map((option: T) => {
        const { value, render, ...menuItemProps } = option;
        return (
          <Menu.Item
            key={value.toString()}
            title={render ? render(value) : value}
            onPress={() => onSelect(option)}
            {...menuItemProps}
          />
        );
      })}
    </Menu>
  );
};

export default Select;
