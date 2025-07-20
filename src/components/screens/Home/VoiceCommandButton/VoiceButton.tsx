import { useMemo } from 'react';
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

const getMicrophoneIconName = () => {
  if (Platform.OS === 'ios') {
    const majorVersionIOS = parseInt(Platform.Version as string, 10);
    return majorVersionIOS >= 17 ? 'mic' : 'microphone';
  }
  return 'mic';
};

export interface VoiceButtonProps extends Omit<IconButtonProps, 'icon'> {
  isRecording: boolean;
  style?: ViewStyle;
}

const VoiceButton = ({ isRecording, onPress, style, ...props }: VoiceButtonProps) => {
  const { t } = useTranslation('common');
  const userTextSize = useUserTextSize();
  const theme = useAppTheme();
  const { buttonSize, iconSize } = sizes[userTextSize];

  const dynamicButtonStyle = useMemo(
    () => ({
      width: buttonSize,
      height: buttonSize,
    }),
    [buttonSize],
  );

  const dynamicContainerStyle = useMemo(
    () => ({
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
    }),
    [theme.colors.onSurface],
  );

  const accessibilityLabel = isRecording ? t('Stop Voice Command') : t('Start Voice Command');

  return (
    <View style={[buttonStyles.shadowContainer, dynamicButtonStyle, dynamicContainerStyle, style]}>
      <IconButton
        mode="contained"
        iconColor={theme.colors.onPrimary}
        containerColor={isRecording ? theme.colors.error : theme.colors.primary}
        icon={(iconProps) => (
          <IconSymbol
            name={isRecording ? 'stop' : getMicrophoneIconName()}
            size={iconSize}
            color={iconProps.color}
          />
        )}
        size={buttonSize}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={[buttonStyles.button, dynamicButtonStyle]}
        {...props}
      />
    </View>
  );
};

export default VoiceButton;

const buttonStyles = StyleSheet.create({
  button: {
    borderRadius: StaticTheme.borderRadius.round,
  },
  shadowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
