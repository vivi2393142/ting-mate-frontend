import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { IconButton, type IconButtonProps } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import useMockAPI from '@/store/useMockAPI';
import useUserStore, { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { UserTextSize } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import EllipsisLoading from '@/components/atoms/EllipsisLoading';
import IconSymbol from '@/components/atoms/IconSymbol';
import ThemedView from '@/components/atoms/ThemedView';

const startRecordingSound = require('@/assets/sounds/start-recording.mp3');
const stopRecordingSound = require('@/assets/sounds/stop-recording.mp3');
const messageSound = require('@/assets/sounds/message.mp3');

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

interface VoiceButtonProps extends Omit<IconButtonProps, 'icon'> {
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
            name={isRecording ? 'stop' : 'microphone'}
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

enum ConversationRole {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  LOADING = 'LOADING',
}

const getVolumeShapeScale = (volume: number) =>
  1 + Math.max(0, Math.min(1, (volume + 60) / 60)) * 2;

// Maximum recording duration in milliseconds
const MAX_RECORDING_DURATION_MS = 60000;

const VoiceCommandButton = ({
  style,
  ...props
}: Omit<VoiceButtonProps, 'isRecording' | 'onPress'>) => {
  const { t } = useTranslation('common');
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const userId = useUserStore((state) => state.user?.email || 'test@example.com');

  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(audioRecorder, 200);

  const startRecordingPlayer = useAudioPlayer(startRecordingSound);
  const stopRecordingPlayer = useAudioPlayer(stopRecordingSound);
  const messageRecordingPlayer = useAudioPlayer(messageSound);

  const conversationIdRef = useRef<string | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceModalOpen, setVoiceModalOpen] = useState(false);
  const [conversation, setConversation] = useState<{ role: ConversationRole; text: string }[]>([]);

  const mockVoiceCommand = useMockAPI((state) => state.mockVoiceCommand);

  const startRecording = useCallback(async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) Alert.alert(t('Permission to access microphone was denied'));

      // Prepare then start recording
      startRecordingPlayer.seekTo(0);
      startRecordingPlayer.play();
      await audioRecorder.prepareToRecordAsync({ isMeteringEnabled: true });
      audioRecorder.record();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [audioRecorder, t, startRecordingPlayer]);

  const openVoiceModal = useCallback(() => {
    setConversation([]);
    setVoiceModalOpen(true);
    setTimeout(() => startRecording(), 200); // Wait for modal animation to finish
  }, [startRecording]);

  const closeVoiceModal = useCallback(() => {
    setConversation([]);
    setVoiceModalOpen(false);
    setIsRecording(false);
    setIsProcessing(false);
    conversationIdRef.current = undefined;
  }, []);

  const stopRecording = useCallback(
    async (isAutoStop = false) => {
      try {
        await audioRecorder.stop();
        setIsRecording(false);
        stopRecordingPlayer.seekTo(0);
        stopRecordingPlayer.play();
        setIsProcessing(true); // Start loading state
        const soundUri = audioRecorder.uri;

        // Show error message if no audio file found
        if (!soundUri) {
          setConversation((prev) => [
            ...prev,
            { role: ConversationRole.SYSTEM, text: 'No audio file found.' },
          ]);
          setIsProcessing(false);
          setTimeout(closeVoiceModal, 1200);
          return;
        }

        // Call voice command API
        // TODO: change to real API
        const response = await mockVoiceCommand({
          conversationId: conversationIdRef.current,
          sound: soundUri,
          userId,
        });
        conversationIdRef.current = response.conversationId;

        // Process response and update states
        const userMessage = `${response.transcript || t('[Voice message]')} ${isAutoStop ? '\n(Auto-stopped due to time limit)' : ''}`;
        setConversation((prev) => [
          ...prev,
          { role: ConversationRole.USER, text: userMessage },
          { role: ConversationRole.SYSTEM, text: response.message },
        ]);
        messageRecordingPlayer.seekTo(0);
        messageRecordingPlayer.play();
        setIsProcessing(false);

        // Finish conversation when status is CONFIRMED or UNKNOWN
        if (response.status === 'CONFIRMED' || response.status === 'UNKNOWN') {
          setTimeout(closeVoiceModal, 1500);
        }
      } catch {
        // Show error message if failed to stop recording
        setConversation((prev) => [
          ...prev,
          { role: ConversationRole.SYSTEM, text: 'Failed to stop recording.' },
        ]);
        setIsProcessing(false);
        setTimeout(closeVoiceModal, 1200);
      }
    },
    [
      audioRecorder,
      closeVoiceModal,
      mockVoiceCommand,
      t,
      userId,
      stopRecordingPlayer,
      messageRecordingPlayer,
    ],
  );

  const handleVoiceButtonPress = useCallback(() => {
    openVoiceModal();
  }, [openVoiceModal]);

  const handleModalVoiceButtonPress = useCallback(async () => {
    if (isRecording) {
      await stopRecording(false);
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const mergedConversation = useMemo(() => {
    const result = [...conversation];
    if (isProcessing) result.push({ role: ConversationRole.LOADING, text: '...' });
    return result;
  }, [conversation, isProcessing]);

  useEffect(() => {
    if (isRecording) {
      const isAutoStop = (recorderState.durationMillis || 0) >= MAX_RECORDING_DURATION_MS;
      if (isAutoStop) stopRecording(true);
    }
  }, [isRecording, stopRecording, recorderState.durationMillis]);

  return !isVoiceModalOpen ? (
    <VoiceButton isRecording={false} onPress={handleVoiceButtonPress} style={style} {...props} />
  ) : (
    <Modal
      transparent
      animationType="fade"
      visible={isVoiceModalOpen}
      onRequestClose={closeVoiceModal}
    >
      <ThemedView isRoot style={styles.modalView}>
        {/* Close modal button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={closeVoiceModal}
          accessibilityLabel={t('End Conversation')}
        >
          <IconSymbol name="xmark.circle" size={40} color={theme.colors.background} />
        </TouchableOpacity>
        {/* Conversation */}
        <FlatList
          data={mergedConversation}
          keyExtractor={(_, idx) => String(idx)}
          style={styles.conversationList}
          contentContainerStyle={styles.conversationContent}
          renderItem={({ item }) =>
            item.role === ConversationRole.LOADING ? (
              <Text style={[styles.conversationItem, styles.conversationItemUser]}>
                <EllipsisLoading size={6} color={theme.colors.onSurface} />
              </Text>
            ) : (
              <Text
                style={[
                  styles.conversationItem,
                  item.role === ConversationRole.USER && styles.conversationItemUser,
                ]}
              >
                {item.text}
              </Text>
            )
          }
        />
        {/* VoiceButton on modal */}
        <View style={styles.modalVoiceButtonContainer}>
          {isRecording && (
            <View style={styles.listeningContainer}>
              <Text style={styles.listeningText}>{t("I'm listening")}</Text>
              <Animated.View
                style={[
                  styles.listeningVolumeShape,
                  {
                    transform: [
                      {
                        scale: getVolumeShapeScale(recorderState.metering || 0),
                      },
                    ],
                  },
                ]}
              />
            </View>
          )}
          <VoiceButton
            isRecording={isRecording}
            disabled={isProcessing}
            onPress={handleModalVoiceButtonPress}
            {...props}
          />
        </View>
      </ThemedView>
    </Modal>
  );
};

export default VoiceCommandButton;

const buttonStyles = StyleSheet.create({
  button: {
    borderRadius: StaticTheme.borderRadius.round,
  },
  shadowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const getStyles = createStyles<
  StyleRecord<
    | 'modalView'
    | 'closeButton'
    | 'conversationList'
    | 'conversationContent'
    | 'modalVoiceButtonContainer'
    | 'listeningContainer'
    | 'listeningVolumeShape',
    'conversationItem' | 'conversationItemUser' | 'listeningText'
  >
>({
  modalView: {
    flex: 1,
    backgroundColor: ({ colors }) => colorWithAlpha(colors.onSurface, 0.8),
    paddingBottom: 160,
  },
  closeButton: {
    position: 'absolute',
    top: StaticTheme.spacing.xxl,
    right: StaticTheme.spacing.lg,
  },
  conversationList: {
    paddingTop: StaticTheme.spacing.xl,
  },
  conversationContent: {
    padding: StaticTheme.spacing.lg,
    gap: StaticTheme.spacing.lg,
  },
  conversationItem: {
    alignSelf: 'flex-start',
    backgroundColor: ({ colors }) => colors.background,
    borderRadius: StaticTheme.borderRadius.s,
    padding: StaticTheme.spacing.md,
    maxWidth: '80%',
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
  },
  conversationItemUser: {
    alignSelf: 'flex-end',
    backgroundColor: ({ colors }) => colors.tertiaryContainer,
  },
  modalVoiceButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: StaticTheme.spacing.xxl,
    alignItems: 'center',
  },
  listeningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: StaticTheme.spacing.md,
  },
  listeningText: {
    color: ({ colors }) => colors.onPrimary,
    fontSize: ({ fonts }) => fonts.headlineSmall.fontSize,
    fontWeight: ({ fonts }) => fonts.headlineSmall.fontWeight,
    lineHeight: ({ fonts }) => fonts.headlineSmall.lineHeight,
    marginRight: StaticTheme.spacing.md,
  },
  listeningVolumeShape: {
    width: 8,
    height: 8,
    borderRadius: StaticTheme.borderRadius.round,
    backgroundColor: ({ colors }) => colors.tertiaryContainer,
    opacity: 0.8,
  },
});
