import type { ReactNode } from 'react';

import { Modal, Text, View } from 'react-native';
import { Portal } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import IconSymbol, { type IconName } from '@/components/atoms/IconSymbol';
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
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContainer}>
            {topIcon && (
              <View style={styles.topIconContainer}>
                <View style={styles.topIconBackground}>
                  <IconSymbol name={topIcon} size={28} color={theme.colors.onPrimary} />
                </View>
              </View>
            )}
            <View style={styles.content}>
              <View style={styles.titleWrapper}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
              {children}
            </View>
          </ThemedView>
        </ThemedView>
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
    fontSize: ({ fonts }) => fonts.titleLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.titleLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleLarge.lineHeight,
    color: ({ colors }) => colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.outline,
    textAlign: 'center',
  },
});

export default CommonModal;
