import type { ReactNode } from 'react';

import { Modal, TouchableWithoutFeedback, View } from 'react-native';
import { Portal } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import IconSymbol, { type IconName } from '@/components/atoms/IconSymbol';
import ThemedText from '@/components/atoms/ThemedText';
import ThemedView from '@/components/atoms/ThemedView';

interface CommonModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  topIcon?: IconName;
  onDismiss: () => void;
  children?: ReactNode;
}

const CommonModal = ({
  visible,
  title,
  subtitle,
  topIcon,
  onDismiss,
  children,
}: CommonModalProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={onDismiss}>
          <ThemedView style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <ThemedView style={styles.modalContainer}>
                {topIcon && (
                  <View style={styles.topIconContainer}>
                    <View style={styles.topIconBackground}>
                      <IconSymbol
                        name={topIcon}
                        size={StaticTheme.iconSize.xl}
                        color={theme.colors.onPrimary}
                      />
                    </View>
                  </View>
                )}
                <View style={styles.content}>
                  <View style={styles.titleWrapper}>
                    <ThemedText variant="titleLarge" style={styles.title}>
                      {title}
                    </ThemedText>
                    {subtitle && (
                      <ThemedText variant="bodyMedium" color="outline" style={styles.subtitle}>
                        {subtitle}
                      </ThemedText>
                    )}
                  </View>
                  {children}
                </View>
              </ThemedView>
            </TouchableWithoutFeedback>
          </ThemedView>
        </TouchableWithoutFeedback>
      </Modal>
    </Portal>
  );
};

const topIconSize = 56;

const getStyles = createStyles<
  StyleRecord<
    | 'modalOverlay'
    | 'modalContainer'
    | 'topIconContainer'
    | 'topIconBackground'
    | 'content'
    | 'titleWrapper',
    'title' | 'subtitle'
  >
>({
  modalOverlay: {
    flex: 1,
    backgroundColor: ({ colors }) => colorWithAlpha(colors.onSurface, 0.8),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: StaticTheme.spacing.lg,
  },
  modalContainer: {
    width: '100%',
    borderRadius: StaticTheme.borderRadius.s,
  },
  topIconContainer: {
    position: 'absolute',
    top: -(topIconSize / 2),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  topIconBackground: {
    width: topIconSize,
    height: topIconSize,
    borderRadius: StaticTheme.borderRadius.round,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ({ colors }) => colors.primary,
    borderColor: ({ colors }) => colors.surface,
  },
  content: {
    padding: StaticTheme.spacing.lg,
    paddingTop: StaticTheme.spacing.xl * 1.25,
  },
  titleWrapper: {
    gap: StaticTheme.spacing.xs,
    marginBottom: StaticTheme.spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
});

export default CommonModal;
