import { AudioModule, RecordingPresets, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ViewStyle } from 'react-native';

import useErrorHandler from '@/components/screens/Home/VoiceCommandButton/useErrorHandler';
import useSoundManager from '@/components/screens/Home/VoiceCommandButton/useSoundManager';
import useMockAPI, { VoiceCommandStatus } from '@/store/useMockAPI';
import useUserStore from '@/store/useUserStore';

import VoiceButton from '@/components/screens/Home/VoiceCommandButton/VoiceButton';
import VoiceModal, {
  ConversationRole,
} from '@/components/screens/Home/VoiceCommandButton/VoiceModal';

// Maximum recording duration in milliseconds
export const MAX_RECORDING_DURATION_MS = 60000;

export const getVolumeShapeScale = (volume: number) =>
  1 + Math.max(0, Math.min(1, (volume + 60) / 60)) * 2;

interface VoiceCommandButtonProps {
  style?: ViewStyle;
}

const VoiceCommandButton = ({ style, ...props }: VoiceCommandButtonProps) => {
  const { t } = useTranslation('common');

  // TODO: change to real user ID
  const userId = useUserStore((state) => state.user?.email || 'test@example.com');

  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(audioRecorder, 200);

  const { playStartRecording, playStopRecording, playMessage } = useSoundManager();
  const { handleRecordingError, handlePermissionError } = useErrorHandler();

  const conversationIdRef = useRef<string | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceModalOpen, setVoiceModalOpen] = useState(false);
  const [conversation, setConversation] = useState<{ role: ConversationRole; text: string }[]>([]);

  const mockVoiceCommand = useMockAPI((state) => state.mockVoiceCommand);

  // Helper function to add message to conversation with sound and speech
  const addMessageToConversation = useCallback(
    (role: ConversationRole, text: string, shouldPlaySound = true, shouldSpeak = true) => {
      if (shouldPlaySound) {
        playMessage();
      }
      setConversation((prev) => [...prev, { role, text }]);
      if (shouldSpeak) Speech.speak(text, { language: 'en-US' });
    },
    [playMessage],
  );

  const startRecording = useCallback(async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        handlePermissionError();
        return;
      }

      // Prepare then start recording
      playStartRecording();
      await audioRecorder.prepareToRecordAsync({ isMeteringEnabled: true });
      audioRecorder.record();
      setIsRecording(true);
    } catch (err) {
      handleRecordingError('Failed to start recording', () => {
        console.error('Failed to start recording:', err);
      });
    }
  }, [audioRecorder, playStartRecording, handlePermissionError, handleRecordingError]);

  const openVoiceModal = useCallback(() => {
    setConversation([]);
    setVoiceModalOpen(true);
    setTimeout(() => startRecording(), 200); // Wait for modal animation to finish
  }, [startRecording]);

  const handleCloseVoiceModal = useCallback(() => {
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
        playStopRecording();
        setIsProcessing(true); // Start loading state
        const soundUri = audioRecorder.uri;

        // Show error message if no audio file found
        if (!soundUri) {
          const newMessage = t('No audio file found.');
          addMessageToConversation(ConversationRole.SYSTEM, newMessage, true, true);
          setIsProcessing(false);
          setTimeout(handleCloseVoiceModal, 1200);
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
        const userMessage = `${response.transcript || t('[Voice message]')} ${isAutoStop ? `\n${t('Auto-stopped due to time limit')}` : ''}`;
        addMessageToConversation(ConversationRole.USER, userMessage, true, false);
        addMessageToConversation(ConversationRole.SYSTEM, response.message, false, true);
        setIsProcessing(false);

        // Finish conversation when status is CONFIRMED or UNKNOWN
        if (
          response.status === VoiceCommandStatus.CONFIRMED ||
          response.status === VoiceCommandStatus.UNKNOWN
        ) {
          setTimeout(handleCloseVoiceModal, 1500);
        }
      } catch {
        // Show error message if failed to stop recording
        const newMessage = t('Failed to stop recording.');
        addMessageToConversation(ConversationRole.SYSTEM, newMessage, true, true);
        setIsProcessing(false);
        setTimeout(handleCloseVoiceModal, 1200);
      }
    },
    [
      audioRecorder,
      handleCloseVoiceModal,
      mockVoiceCommand,
      t,
      userId,
      playStopRecording,
      addMessageToConversation,
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

  useEffect(() => {
    if (isRecording) {
      const isAutoStop = (recorderState.durationMillis || 0) >= MAX_RECORDING_DURATION_MS;
      if (isAutoStop) stopRecording(true);
    }
  }, [isRecording, stopRecording, recorderState.durationMillis]);

  return !isVoiceModalOpen ? (
    <VoiceButton isRecording={false} onPress={handleVoiceButtonPress} style={style} {...props} />
  ) : (
    <VoiceModal
      isVisible={isVoiceModalOpen}
      isRecording={isRecording}
      isProcessing={isProcessing}
      conversation={conversation}
      recorderState={recorderState}
      onClose={handleCloseVoiceModal}
      onVoiceButtonPress={handleModalVoiceButtonPress}
      voiceButtonProps={props}
    />
  );
};

export default VoiceCommandButton;
