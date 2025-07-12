// Fallback for using MaterialIcons on Android and web.

import type { SymbolViewProps } from 'expo-symbols';
import type { ComponentProps } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useUserTextSize } from '@/store/useUserStore';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'gearshape.fill': 'settings',
  'person.2.fill': 'people',
  'chevron.up.chevron.down': 'unfold-more',
  plus: 'add',
  'text.justify.leading': 'notes',
  'face.smiling': 'insert-emoticon',
  clock: 'access-time',
  repeat: 'repeat',
  microphone: 'mic',
  stop: 'stop',
  'xmark.circle': 'closecircleo',
  'document.on.document': 'content-copy',
  person: 'person',
  'person.2': 'people',
  'arrow.left.and.right': 'compare-arrows',
  checklist: 'checklist',
  bell: 'bell',
  heart: 'heart',
  qrcode: 'qr-code',
  'square.and.arrow.up': 'share',
  'checkmark.circle': 'check-circle',
  phone: 'phone',
  location: 'location-on',
  'exclamationmark.triangle': 'warning',
  'arrow.clockwise': 'refresh',
  'figure.wave': 'accessibility',
} as unknown as IconMapping;

export type IconName = SymbolViewProps['name'];

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
  name: IconName;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
}) => {
  const textSize = useUserTextSize();

  return (
    <MaterialIcons style={style} label={textSize} size={size} color={color} name={MAPPING[name]} />
  );
};

export default IconSymbol;
