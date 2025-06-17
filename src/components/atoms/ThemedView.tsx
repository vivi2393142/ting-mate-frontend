import { View, type ViewProps } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

const ThemedView = ({ style, lightColor, darkColor, ...rest }: ThemedViewProps) => {
  const { colors, dark } = useAppTheme();
  const backgroundColor = dark
    ? (darkColor ?? colors.background)
    : (lightColor ?? colors.background);

  return <View style={[{ backgroundColor }, style]} {...rest} />;
};

export default ThemedView;
