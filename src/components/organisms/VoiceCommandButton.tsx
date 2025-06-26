import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
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
  onStopRecording: (soundUri: string | null) => void;
  style?: ViewStyle;
}

const VoiceCommandButton = ({ style, onStopRecording, ...props }: VoiceCommandButtonProps) => {
  const { t } = useTranslation('common');
  const userTextSize = useUserTextSize();
  const theme = useAppTheme();
  const { buttonSize, iconSize } = sizes[userTextSize];

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = useCallback(async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }

      // Prepare then start recording
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [audioRecorder]);

  const stopRecording = useCallback(async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);
      onStopRecording(audioRecorder.uri);
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  }, [audioRecorder, onStopRecording]);

  const handlePress = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const accessibilityLabel = isRecording ? t('Stop Voice Command') : t('Start Voice Command');

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
        containerColor={isRecording ? theme.colors.error : theme.colors.primary}
        icon={(iconProps) => (
          <IconSymbol
            name={isRecording ? 'stop' : 'microphone'}
            size={iconSize}
            color={iconProps.color}
          />
        )}
        size={buttonSize}
        accessibilityLabel={accessibilityLabel}
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
