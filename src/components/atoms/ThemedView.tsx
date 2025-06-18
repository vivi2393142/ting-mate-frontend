import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScrollView, View, type ScrollViewProps, type ViewProps } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';

export type ThemedViewProps = (ViewProps | ScrollViewProps) & {
  lightColor?: string;
  darkColor?: string;
  isRoot?: boolean;
  scrollable?: boolean;
};

const ThemedView = ({
  scrollable,
  isRoot,
  style,
  lightColor,
  darkColor,
  ...rest
}: ThemedViewProps) => {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useAppTheme();

  const backgroundColor = dark
    ? (darkColor ?? colors.background)
    : (lightColor ?? colors.background);
  const safeAreaStyle = isRoot ? { paddingTop: insets.top, paddingBottom: insets.bottom } : {};
  const combinedStyle = [{ backgroundColor }, safeAreaStyle, style];

  if (scrollable) return <ScrollView style={combinedStyle} {...rest} />;
  return <View style={combinedStyle} {...rest} />;
};

export default ThemedView;
