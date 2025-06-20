// Fallback for using MaterialIcons on Android and web.

import { SymbolViewProps } from 'expo-symbols';
import { type ComponentProps, useMemo } from 'react';
import { type StyleProp, type TextStyle } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import useUserStore from '@/store/useUserStore';
import { UserTextSize } from '@/types/user';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'gearshape.fill': 'settings',
  'person.2.fill': 'people',
  'chevron.up.chevron.down': 'unfold-more',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
const IconSymbol = ({
  name,
  size,
  color,
  style,
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
}) => {
  const userState = useUserStore((state) => state.user);
  const textSize = useMemo(
    () => userState?.settings.textSize || UserTextSize.LARGE,
    [userState?.settings.textSize],
  );

  return (
    <MaterialIcons style={style} label={textSize} size={size} color={color} name={MAPPING[name]} />
  );
};

export default IconSymbol;
