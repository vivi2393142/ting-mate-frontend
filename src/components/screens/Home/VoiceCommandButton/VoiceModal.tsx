import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, FlatList, Modal, View } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { TalkRole } from '@/types/assistant';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import EllipsisLoading from '@/components/atoms/EllipsisLoading';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import ThemedText from '@/components/atoms/ThemedText';
import ThemedView from '@/components/atoms/ThemedView';
import VoiceButton, {
  type VoiceButtonProps,
} from '@/components/screens/Home/VoiceCommandButton/VoiceButton';

const suggestionHeight = 200;
const animationDuration = 350;

const getVolumeShapeScale = (volume: number) =>
  1 + Math.max(0, Math.min(1, (volume + 60) / 60)) * 2;

interface VoiceModalProps {
  isVisible: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  isConfirming?: boolean;
  conversation: { role: TalkRole; text: string }[];
  recorderState: { metering?: number; durationMillis?: number };
  onClose: () => void;
  onVoiceButtonPress: () => void;
  onConfirm?: () => Promise<void> | void;
  voiceButtonProps: Omit<VoiceButtonProps, 'isRecording' | 'onPress'>;
}

const VoiceModal = ({
  isVisible,
  isRecording,
  isProcessing,
  isConfirming = false,
  conversation,
  recorderState,
  onClose,
  onVoiceButtonPress,
  onConfirm,
  voiceButtonProps,
}: VoiceModalProps) => {
  const { t } = useTranslation('common');
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const mergedConversation = useMemo(() => {
    const result = [...conversation];
    if (isProcessing) result.push({ role: TalkRole.LOADING, text: '...' });
    return result;
  }, [conversation, isProcessing]);

  const suggestions = useMemo(
    () => [
      t('Remind me to take my pills at 2 every day'),
      t('Change my pill reminder to 4 p.m.'),
      t("Can you delete the 'take medicine' task?"),
    ],
    [t],
  );

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsConfirmLoading(true);
    try {
      await onConfirm?.();
      setIsConfirmed(true);
      setTimeout(() => {
        setIsConfirmed(false);
        setIsConfirmLoading(false);
      }, 2000);
    } catch {
      setIsConfirmLoading(false);
    }
  }, [onConfirm]);

  // Animated height for suggestion area
  const heightAnim = useRef(new Animated.Value(suggestionHeight)).current; // Adjust based on chip count and spacing
  const hasConversation = useMemo(() => conversation.length > 0, [conversation]);

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: hasConversation ? 0 : suggestionHeight,
      duration: animationDuration,
      useNativeDriver: false, // height cannot use native driver
    }).start();
  }, [hasConversation, heightAnim]);

  return (
    <Modal transparent animationType="fade" visible={isVisible} onRequestClose={onClose}>
      <ThemedView isRoot style={styles.modalView}>
        {/* Suggestions with animated height */}
        <Animated.View style={[styles.suggestionWrapper, { height: heightAnim }]}>
          <ThemedText variant="titleMedium" color="onPrimary" style={styles.suggestionTitle}>
            {t('Try asking me...')}
          </ThemedText>
          {suggestions.map((q, i) => (
            <ThemedText key={i} color="onSurfaceVariant" style={styles.suggestionChip}>
              {q}
            </ThemedText>
          ))}
        </Animated.View>
        {/* Conversation */}
        <FlatList
          data={mergedConversation}
          keyExtractor={(_, idx) => String(idx)}
          style={styles.conversationList}
          contentContainerStyle={styles.conversationContent}
          renderItem={({ item }) =>
            item.role === TalkRole.LOADING ? (
              <ThemedText style={[styles.conversationItem, styles.conversationItemUser]}>
                <EllipsisLoading size={6} color={theme.colors.onSurface} />
              </ThemedText>
            ) : (
              <ThemedText
                style={[
                  styles.conversationItem,
                  item.role === TalkRole.USER && styles.conversationItemUser,
                ]}
              >
                {item.text}
              </ThemedText>
            )
          }
        />
        {/* Confirmation */}
        {isConfirming && !isConfirmed && (
          <View style={styles.confirmationContainer}>
            <View style={styles.confirmationButtonRow}>
              <ThemedButton
                mode="contained"
                color="primary"
                style={styles.confirmButton}
                onPress={handleConfirm}
                loading={isConfirmLoading}
              >
                {t('Yes')}
              </ThemedButton>
              <ThemedButton
                mode="outlined"
                color="error"
                style={styles.confirmButton}
                onPress={onClose}
              >
                {t('No')}
              </ThemedButton>
            </View>
          </View>
        )}
        {/* VoiceButton on modal */}
        <View style={styles.modalVoiceButtonContainer}>
          {isRecording && (
            <View style={styles.listeningContainer}>
              <ThemedText variant="headlineSmall" color="onPrimary" style={styles.listeningText}>
                {t("I'm listening")}
              </ThemedText>
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
            onPress={onVoiceButtonPress}
            {...voiceButtonProps}
          />
        </View>
        {/* Close modal button */}
        <ThemedIconButton
          name="xmark.circle"
          size={'large'}
          onPress={onClose}
          color={theme.colors.background}
          style={styles.closeButton}
        />
      </ThemedView>
    </Modal>
  );
};

export default VoiceModal;

const getStyles = createStyles<
  StyleRecord<
    | 'modalView'
    | 'closeButton'
    | 'conversationList'
    | 'conversationContent'
    | 'modalVoiceButtonContainer'
    | 'listeningContainer'
    | 'listeningVolumeShape'
    | 'confirmationContainer'
    | 'confirmationButtonRow'
    | 'confirmButton'
    | 'suggestionWrapper',
    | 'conversationItem'
    | 'conversationItemUser'
    | 'listeningText'
    | 'confirmationText'
    | 'suggestionTitle'
    | 'suggestionChip'
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
    flexGrow: 0,
  },
  conversationContent: {
    padding: StaticTheme.spacing.lg,
    gap: StaticTheme.spacing.lg,
  },
  conversationItem: {
    alignSelf: 'flex-start',
    backgroundColor: ({ colors }) => colors.background,
    borderRadius: StaticTheme.borderRadius.s,
    paddingHorizontal: StaticTheme.spacing.sm * 1.5,
    paddingVertical: StaticTheme.spacing.sm,
    maxWidth: '80%',
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
    marginRight: StaticTheme.spacing.md,
  },
  listeningVolumeShape: {
    width: 8,
    height: 8,
    borderRadius: StaticTheme.borderRadius.round,
    backgroundColor: ({ colors }) => colors.tertiaryContainer,
    opacity: 0.8,
  },
  confirmationContainer: {
    paddingHorizontal: StaticTheme.spacing.lg,
    marginTop: StaticTheme.spacing.sm,
  },
  confirmationButtonRow: {
    gap: StaticTheme.spacing.md,
    marginLeft: StaticTheme.spacing.xxl * 2,
  },
  confirmButton: {
    paddingVertical: StaticTheme.spacing.sm,
  },
  confirmationText: {
    color: ({ colors }) => colors.primary,
    fontSize: ({ fonts }) => fonts.headlineMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.headlineMedium.fontWeight,
    marginVertical: StaticTheme.spacing.xl,
  },
  suggestionWrapper: {
    marginHorizontal: StaticTheme.spacing.lg,
    alignSelf: 'stretch',
    overflow: 'hidden',
    gap: StaticTheme.spacing.sm * 1.5,
  },
  suggestionTitle: {
    paddingTop: StaticTheme.spacing.md,
    marginBottom: StaticTheme.spacing.xs,
  },
  suggestionChip: {
    borderRadius: StaticTheme.borderRadius.s,
    paddingHorizontal: StaticTheme.spacing.sm * 1.5,
    paddingVertical: StaticTheme.spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: ({ colors }) => colors.tertiaryContainer,
  },
});
