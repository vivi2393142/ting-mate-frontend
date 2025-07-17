import { AudioModule, RecordingPresets, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ViewStyle } from 'react-native';

import { useAssistantExecutePendingTask, useAssistantVoiceCommand } from '@/api/assistant';
import useErrorHandler from '@/components/screens/Home/VoiceCommandButton/useErrorHandler';
import useSoundManager from '@/components/screens/Home/VoiceCommandButton/useSoundManager';
import { AssistantStatus, type AssistantVoiceCommandOutput, TalkRole } from '@/types/assistant';

import VoiceButton from '@/components/screens/Home/VoiceCommandButton/VoiceButton';
import VoiceModal from '@/components/screens/Home/VoiceCommandButton/VoiceModal';

const MAX_RECORDING_DURATION_MS = 60000;
const MODAL_CLOSE_DURATION_MS = 200;
const AUTO_CLOSE_DELAY_MS = 2000;
const PERMISSION_ERROR_DELAY_MS = 1200;

interface VoiceCommandButtonProps {
  style?: ViewStyle;
}

const VoiceCommandButton = ({ style, ...props }: VoiceCommandButtonProps) => {
  const { t } = useTranslation('common');

  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(audioRecorder, 200);

  const { playStartRecording, playStopRecording, playMessage } = useSoundManager();
  const { handleRecordingError, handlePermissionError } = useErrorHandler();
  const voiceCommandMutation = useAssistantVoiceCommand();
  const executePendingTaskMutation = useAssistantExecutePendingTask();

  const conversationIdRef = useRef<string | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceModalOpen, setVoiceModalOpen] = useState(false);
  const [conversation, setConversation] = useState<{ role: TalkRole; text: string }[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);

  // Conversation management
  const addToConversation = useCallback(
    (role: TalkRole, text: string, shouldPlaySound = true, shouldSpeak = true) => {
      if (shouldPlaySound) playMessage();
      setConversation((prev) => [...prev, { role, text }]);
      if (shouldSpeak) Speech.speak(text, { language: 'en-US' });
    },
    [playMessage],
  );

  const resetConversation = useCallback(() => {
    setConversation([]);
    conversationIdRef.current = undefined;
  }, []);

  const resetAllStates = useCallback(() => {
    resetConversation();
    setVoiceModalOpen(false);
    setIsRecording(false);
    setIsProcessing(false);
    setIsConfirming(false);
  }, [resetConversation]);

  // Audio file processing
  const retrieveAudioFile = useCallback(async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);
      playStopRecording();
      setIsProcessing(true);
      const soundUri = audioRecorder.uri;
      if (!soundUri) throw new Error('No audio file found.');
      return soundUri;
    } catch {
      const errorMessage = t("Hmm… couldn't hear you. Try again?");
      addToConversation(TalkRole.SYSTEM, errorMessage, true, true);
      setIsProcessing(false);
      setTimeout(resetAllStates, PERMISSION_ERROR_DELAY_MS);
    }
  }, [addToConversation, audioRecorder, playStopRecording, resetAllStates, t]);

  // Recording permission handling
  const requestRecordingPermission = useCallback(async (): Promise<boolean> => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        handlePermissionError();
        return false;
      }
      return true;
    } catch (err) {
      handleRecordingError('Failed to request recording permissions', () => {
        if (__DEV__) console.error('Failed to request recording permissions:', err);
      });
      return false;
    }
  }, [handlePermissionError, handleRecordingError]);

  // Recording operations
  const startRecording = useCallback(async () => {
    const hasPermission = await requestRecordingPermission();
    if (!hasPermission) return;

    try {
      playStartRecording();
      await audioRecorder.prepareToRecordAsync({ isMeteringEnabled: true });
      audioRecorder.record();
      setIsRecording(true);
    } catch (err) {
      handleRecordingError('Failed to start recording', () => {
        if (__DEV__) console.error('Failed to start recording:', err);
      });
    }
  }, [audioRecorder, playStartRecording, requestRecordingPermission, handleRecordingError]);

  // Voice command response handling
  const handleVoiceCommandSuccess = useCallback(
    ({ conversationId, status, furtherQuestion, userInput }: AssistantVoiceCommandOutput) => {
      conversationIdRef.current = conversationId;
      addToConversation(TalkRole.USER, userInput, true, false);

      switch (status) {
        case AssistantStatus.CONFIRMED: {
          if (furtherQuestion) addToConversation(TalkRole.SYSTEM, furtherQuestion, false, true);
          setIsConfirming(true);
          break;
        }
        case AssistantStatus.INCOMPLETE: {
          if (furtherQuestion) addToConversation(TalkRole.SYSTEM, furtherQuestion, false, true);
          break;
        }
        case AssistantStatus.FAILED: {
          const errorMessage = t('Sorry, didn’t catch that. Try create, update, or delete a task.');
          addToConversation(TalkRole.SYSTEM, errorMessage, false, true);
          setTimeout(resetAllStates, AUTO_CLOSE_DELAY_MS);
          break;
        }
      }
    },
    [addToConversation, resetAllStates, t],
  );

  const handleVoiceCommandError = useCallback(
    (error: Error) => {
      if (__DEV__) console.error('Voice command error:', error);
      const errorMessage = t('Oops, something went wrong! Please try again.');
      addToConversation(TalkRole.SYSTEM, errorMessage, true, true);
    },
    [addToConversation, t],
  );

  const stopRecording = useCallback(async () => {
    const audioUri = await retrieveAudioFile();
    if (!audioUri) {
      const errorMessage = t("Hmm… couldn't hear you. Try again?");
      addToConversation(TalkRole.SYSTEM, errorMessage, true, true);
      setIsProcessing(false);
      setTimeout(resetAllStates, PERMISSION_ERROR_DELAY_MS);
      return;
    }

    voiceCommandMutation.mutate(
      {
        conversationId: conversationIdRef.current,
        audioUri,
      },
      {
        onSuccess: handleVoiceCommandSuccess,
        onError: handleVoiceCommandError,
        onSettled: () => setIsProcessing(false),
      },
    );
  }, [
    retrieveAudioFile,
    voiceCommandMutation,
    handleVoiceCommandSuccess,
    handleVoiceCommandError,
    t,
    addToConversation,
    resetAllStates,
  ]);

  // Task execution handling
  const handleConfirm = useCallback(() => {
    if (!conversationIdRef.current) return;

    executePendingTaskMutation.mutate(
      {
        conversationId: conversationIdRef.current,
      },
      {
        onSuccess: () => {
          const successMessage = t("Done! I've updated that for you.");
          addToConversation(TalkRole.SYSTEM, successMessage, false, true);
          setTimeout(resetAllStates, AUTO_CLOSE_DELAY_MS);
        },
        onError: (error) => {
          if (__DEV__) console.log('Execute task error:', error);
          const errorMessage = t('Oops, something went wrong! Please try again.');
          addToConversation(TalkRole.SYSTEM, errorMessage, false, true);
        },
      },
    );
  }, [addToConversation, executePendingTaskMutation, resetAllStates, t]);

  // Modal management
  const openVoiceModal = useCallback(() => {
    resetConversation();
    setVoiceModalOpen(true);
    setTimeout(() => startRecording(), MODAL_CLOSE_DURATION_MS);
  }, [startRecording, resetConversation]);

  const closeVoiceModal = useCallback(() => {
    resetAllStates();
  }, [resetAllStates]);

  // Button handlers
  const handleVoiceButtonPress = useCallback(() => {
    openVoiceModal();
  }, [openVoiceModal]);

  const handleModalVoiceButtonPress = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Auto-stop recording effect
  useEffect(() => {
    if (isRecording) {
      const isAutoStop = (recorderState.durationMillis || 0) >= MAX_RECORDING_DURATION_MS;
      if (isAutoStop) stopRecording();
    }
  }, [isRecording, stopRecording, recorderState.durationMillis]);

  return !isVoiceModalOpen ? (
    <VoiceButton
      isRecording={false}
      onPress={handleVoiceButtonPress}
      disabled={isConfirming || isProcessing}
      style={style}
      {...props}
    />
  ) : (
    <VoiceModal
      isVisible={isVoiceModalOpen}
      isRecording={isRecording}
      isProcessing={isProcessing}
      conversation={conversation}
      recorderState={recorderState}
      onClose={closeVoiceModal}
      onVoiceButtonPress={handleModalVoiceButtonPress}
      voiceButtonProps={props}
      isConfirming={isConfirming}
      onConfirm={handleConfirm}
    />
  );
};

export default VoiceCommandButton;
