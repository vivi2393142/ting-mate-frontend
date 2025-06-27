import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import EllipsisLoading from '@/components/atoms/EllipsisLoading';
import IconSymbol from '@/components/atoms/IconSymbol';
import ThemedView from '@/components/atoms/ThemedView';
import VoiceButton, {
  type VoiceButtonProps,
} from '@/components/screens/Home/VoiceCommandButton/VoiceButton';

export enum ConversationRole {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  LOADING = 'LOADING',
}

const getVolumeShapeScale = (volume: number) =>
  1 + Math.max(0, Math.min(1, (volume + 60) / 60)) * 2;

interface VoiceModalProps {
  isVisible: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  conversation: { role: ConversationRole; text: string }[];
  recorderState: { metering?: number; durationMillis?: number };
  onClose: () => void;
  onVoiceButtonPress: () => void;
  voiceButtonProps: Omit<VoiceButtonProps, 'isRecording' | 'onPress'>;
}

const VoiceModal = ({
  isVisible,
  isRecording,
  isProcessing,
  conversation,
  recorderState,
  onClose,
  onVoiceButtonPress,
  voiceButtonProps,
}: VoiceModalProps) => {
  const { t } = useTranslation('common');
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const mergedConversation = useMemo(() => {
    const result = [...conversation];
    if (isProcessing) result.push({ role: ConversationRole.LOADING, text: '...' });
    return result;
  }, [conversation, isProcessing]);

  return (
    <Modal transparent animationType="fade" visible={isVisible} onRequestClose={onClose}>
      <ThemedView isRoot style={styles.modalView}>
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
            onPress={onVoiceButtonPress}
            {...voiceButtonProps}
          />
        </View>
        {/* Close modal button */}
        <TouchableOpacity
          onPress={onClose}
          accessibilityLabel={t('End Conversation')}
          style={styles.closeButton}
        >
          <IconSymbol name="xmark.circle" size={40} color={theme.colors.background} />
        </TouchableOpacity>
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
