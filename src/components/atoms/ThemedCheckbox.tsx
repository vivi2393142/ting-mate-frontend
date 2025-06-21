import { type CheckboxProps } from 'react-native-paper';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

const ThemedCheckbox = (props: CheckboxProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme, { status: props.status });

  return (
    <View style={styles.container}>
      <MaterialIcons name={'check'} style={styles.icon} />
    </View>
  );
};

interface StyleParams {
  status: CheckboxProps['status'];
}

const getStyles = createStyles<StyleRecord<'container', 'icon'>, StyleParams>({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: StaticTheme.borderRadius.s,
    height: ({ iconSize }) => iconSize.medium,
    width: ({ iconSize }) => iconSize.medium,
    borderColor: ({ colors }) => colors.onSurface,
    borderWidth: (_, { status }) => (status === 'checked' ? 0 : 1),
    backgroundColor: ({ colors }, { status }) =>
      status === 'checked' ? colors.primary : 'transparent',
  },
  icon: {
    fontSize: ({ iconSize }) => iconSize.small,
    color: ({ colors }, { status }) => (status === 'checked' ? colors.onPrimary : 'transparent'),
  },
});

export default ThemedCheckbox;
