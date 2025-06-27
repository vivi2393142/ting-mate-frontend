import { useAudioPlayer } from 'expo-audio';
import { useCallback } from 'react';

const startRecordingSound = require('@/assets/sounds/start-recording.mp3');
const stopRecordingSound = require('@/assets/sounds/stop-recording.mp3');
const messageSound = require('@/assets/sounds/message.mp3');

const useSoundManager = () => {
  const startRecordingPlayer = useAudioPlayer(startRecordingSound);
  const stopRecordingPlayer = useAudioPlayer(stopRecordingSound);
  const messageRecordingPlayer = useAudioPlayer(messageSound);

  const playStartRecording = useCallback(() => {
    startRecordingPlayer.seekTo(0);
    startRecordingPlayer.play();
  }, [startRecordingPlayer]);

  const playStopRecording = useCallback(() => {
    stopRecordingPlayer.seekTo(0);
    stopRecordingPlayer.play();
  }, [stopRecordingPlayer]);

  const playMessage = useCallback(() => {
    messageRecordingPlayer.seekTo(0);
    messageRecordingPlayer.play();
  }, [messageRecordingPlayer]);

  return {
    playStartRecording,
    playStopRecording,
    playMessage,
  };
};

export default useSoundManager;
