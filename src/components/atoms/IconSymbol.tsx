// Fallback for using MaterialIcons on Android and web.

import { SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { type StyleProp, type TextStyle } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
const IconSymbol = ({
  name,
  size = 24,
  color,
  style,
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
}) => {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
};

export default IconSymbol;
