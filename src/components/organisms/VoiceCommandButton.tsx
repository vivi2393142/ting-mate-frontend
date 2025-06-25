import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { IconButton, type IconButtonProps } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { UserTextSize } from '@/types/user';

import IconSymbol from '@/components/atoms/IconSymbol';

const sizes = {
  [UserTextSize.LARGE]: {
    buttonSize: 96,
    iconSize: 48,
  },
  [UserTextSize.STANDARD]: {
    buttonSize: 72,
    iconSize: 32,
  },
};

interface VoiceCommandButtonProps extends Omit<IconButtonProps, 'icon'> {
  style?: ViewStyle;
}

const VoiceCommandButton = ({ style, ...props }: VoiceCommandButtonProps) => {
  const { t } = useTranslation('common');

  const userTextSize = useUserTextSize();
  const theme = useAppTheme();
  const { buttonSize, iconSize } = sizes[userTextSize];

  const handlePress = useCallback(() => {
    // TODO: Implement voice command recording
  }, []);

  return (
    <View
      style={[
        styles.shadowContainer,
        {
          width: buttonSize,
          height: buttonSize,
          ...Platform.select({
            ios: {
              shadowColor: theme.colors.onSurface,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.6,
              shadowRadius: 4,
            },
            android: {
              elevation: 4,
            },
          }),
        },
        style,
      ]}
    >
      <IconButton
        mode="contained"
        iconColor={theme.colors.onPrimary}
        containerColor={theme.colors.primary}
        icon={(iconProps) => (
          <IconSymbol name="microphone" size={iconSize} color={iconProps.color} />
        )}
        size={buttonSize}
        accessibilityLabel={t('Start Voice Command')}
        onPress={handlePress}
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
          },
        ]}
        {...props}
      />
    </View>
  );
};

export default VoiceCommandButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: StaticTheme.borderRadius.round,
  },
  shadowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
