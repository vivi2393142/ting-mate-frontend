import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Stack } from 'expo-router';
import { Text, TextInput, View } from 'react-native';
import { IconButton, TouchableRipple } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import IconSymbol from '@/components/atoms/IconSymbol';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedView from '@/components/atoms/ThemedView';
import CommonModal from '@/components/screens/AccountLinking/CommonModal';

const AccountLinkingScreen = () => {
  const { t } = useTranslation('accountLinking');
  const { t: tCommon } = useTranslation('common');

  const theme = useAppTheme();
  const styles = getStyles(theme);

  // TODO: Replace with real user/link/invite data from store or API
  const [inviteCode] = useState('123456');
  const [inputCode, setInputCode] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);

  // TODO: Replace with real linked users from store or API
  const linkedUsers = [
    { name: 'Jane Lee', email: 'jane@email.com' },
    { name: 'John Doe', email: 'john@email.com' },
  ];

  // TODO: Implement these handlers
  const handleUnlink = () => {};
  const handleCopy = () => {};
  const handleShare = () => {};
  const handleLink = () => {
    // TODO: Implement link logic
    setShowInputModal(false);
    setInputCode('');
  };

  const handleShowInviteModal = () => {
    setShowInviteModal(true);
  };

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
  };

  const handleShowInputModal = () => {
    setShowInputModal(true);
  };

  const handleCloseInputModal = () => {
    setShowInputModal(false);
    setInputCode('');
  };

  const handleInputCodeChange = (text: string) => {
    setInputCode(text);
  };

  const purposeItems = [
    { text: t('Keep track of tasks together'), icon: 'checklist' },
    { text: t('Get gentle updates when things are done'), icon: 'bell' },
    { text: t("Stay close, even when you're apart"), icon: 'heart' },
  ] as const;

  return (
    <Fragment>
      <Stack.Screen
        options={{
          title: t('Linking Account'),
          headerBackTitle: tCommon('Settings'),
        }}
      />
      <ScreenContainer
        isRoot={false}
        scrollable
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* desc Section */}
        <ThemedView style={styles.descContainer}>
          <ThemedView>
            <Text style={styles.descTitle}>{t('Link Account with Others')}</Text>
            <Text style={styles.descSubtitle}>
              {t('Share tasks and stay with someone you care.')}
            </Text>
          </ThemedView>
          <ThemedView style={styles.note}>
            <Text style={styles.noteTitle}>{t('Why link accounts?')}</Text>
            {purposeItems.map((item, idx) => (
              <View key={idx} style={styles.purposeRow}>
                <IconSymbol name={item.icon} size={18} color={theme.colors.primary} />
                <Text style={styles.noteText}>{item.text}</Text>
              </View>
            ))}
          </ThemedView>
        </ThemedView>
        {/* Linked Account Section */}
        <ThemedView style={styles.linkedAccountsContainer}>
          <Text style={styles.linkedAccountsTitle}>{t('Linked Accounts')}</Text>
          {linkedUsers?.length > 0 && (
            <View style={styles.linkedAccountsList}>
              {linkedUsers.map((user) => (
                <View key={user.email} style={styles.linkedRow}>
                  <Text style={styles.linkedName}>
                    {user.name || '---'} ({user.email})
                  </Text>
                  <IconButton
                    icon={() => (
                      <IconSymbol name="xmark.circle" size={20} color={theme.colors.error} />
                    )}
                    size={20}
                    onPress={handleUnlink}
                    accessibilityLabel={t('Unlink')}
                  />
                </View>
              ))}
            </View>
          )}
        </ThemedView>
        {/* Add Link Section */}
        <ThemedView style={styles.addLinkContainer}>
          <Text style={styles.addLinkTitle}>{t('Add Link')}</Text>
          <View style={styles.addLinkContent}>
            <TouchableRipple
              onPress={handleShowInviteModal}
              style={styles.actionCard}
              rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
            >
              <View style={styles.actionCardContent}>
                <IconSymbol name="qrcode" size={24} color={theme.colors.primary} />
                <Text style={styles.actionCardText}>{t('Invite Someone')}</Text>
              </View>
            </TouchableRipple>
            <TouchableRipple
              onPress={handleShowInputModal}
              style={styles.actionCard}
              rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
            >
              <View style={styles.actionCardContent}>
                <IconSymbol name="plus" size={24} color={theme.colors.primary} />
                <Text style={styles.actionCardText}>{t('I Got a Code')}</Text>
              </View>
            </TouchableRipple>
          </View>
        </ThemedView>
        {/* Invite Code Modal */}
        <CommonModal
          visible={showInviteModal}
          onDismiss={handleCloseInviteModal}
          title={t('Share Your Invite Code')}
          subtitle={t('Share this code to link and manage tasks together')}
          topIcon="qrcode"
        >
          <View style={styles.codeDisplay}>
            <Text style={styles.codeText}>{inviteCode}</Text>
            <IconButton
              icon={() => (
                <IconSymbol name="document.on.document" size={20} color={theme.colors.primary} />
              )}
              size={20}
              onPress={handleCopy}
              accessibilityLabel={t('Copy code')}
            />
          </View>
          <View style={styles.modalButtonContainer}>
            <ThemedButton mode="contained" icon="square.and.arrow.up" onPress={handleShare}>
              {t('Share')}
            </ThemedButton>
            <ThemedButton mode="outlined" onPress={handleCloseInviteModal} color="error">
              {tCommon('Cancel')}
            </ThemedButton>
          </View>
        </CommonModal>
        {/* Input Code Modal */}
        <CommonModal
          visible={showInputModal}
          onDismiss={handleCloseInputModal}
          title={t('Link with Invite Code')}
          subtitle={t('Enter the code shared by someone else')}
          topIcon="plus"
        >
          <TextInput
            value={inputCode}
            onChangeText={handleInputCodeChange}
            placeholder={t('Enter invite code')}
            style={styles.codeInput}
            maxLength={6}
            autoFocus
          />
          <View style={styles.modalButtonContainer}>
            <ThemedButton mode="contained" onPress={handleLink} disabled={!inputCode.trim()}>
              {t('Link Account')}
            </ThemedButton>
            <ThemedButton mode="outlined" onPress={handleCloseInputModal} color="error">
              {tCommon('Cancel')}
            </ThemedButton>
          </View>
        </CommonModal>
      </ScreenContainer>
    </Fragment>
  );
};

const getStyles = createStyles<
  StyleRecord<
    | 'container'
    | 'content'
    | 'descContainer'
    | 'note'
    | 'purposeRow'
    | 'linkedAccountsContainer'
    | 'linkedAccountsList'
    | 'linkedRow'
    | 'addLinkContainer'
    | 'addLinkContent'
    | 'actionCard'
    | 'actionCardContent'
    | 'codeDisplay'
    | 'modalButtonContainer',
    | 'descTitle'
    | 'descSubtitle'
    | 'noteTitle'
    | 'noteText'
    | 'linkedAccountsTitle'
    | 'linkedName'
    | 'addLinkTitle'
    | 'actionCardText'
    | 'codeText'
    | 'codeInput'
  >
>({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: StaticTheme.spacing.sm,
    gap: StaticTheme.spacing.md,
  },
  descContainer: {
    gap: StaticTheme.spacing.sm * 1.5,
  },
  descTitle: {
    fontSize: ({ fonts }) => fonts.titleMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.titleMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleMedium.lineHeight,
  },
  descSubtitle: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.outline,
  },
  note: {
    backgroundColor: ({ colors }) => colors.surfaceVariant,
    paddingVertical: StaticTheme.spacing.md * 1.25,
    paddingHorizontal: StaticTheme.spacing.lg,
    borderRadius: StaticTheme.borderRadius.s,
    gap: StaticTheme.spacing.sm * 1.25,
  },
  noteTitle: {
    fontSize: ({ fonts }) => fonts.titleSmall.fontSize,
    fontWeight: ({ fonts }) => fonts.titleSmall.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleSmall.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
  },
  noteText: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.outline,
  },
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StaticTheme.spacing.sm * 1.25,
  },
  linkedAccountsContainer: {
    gap: StaticTheme.spacing.sm,
  },
  linkedAccountsList: {
    gap: StaticTheme.spacing.sm * 1.5,
    marginBottom: StaticTheme.spacing.xs * 1.5,
  },
  linkedAccountsTitle: {
    fontSize: ({ fonts }) => fonts.titleMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.titleMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleMedium.lineHeight,
  },
  linkedRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm,
    borderRadius: StaticTheme.borderRadius.s,
    paddingHorizontal: StaticTheme.spacing.md,
    borderWidth: 1,
    borderColor: ({ colors }) => colorWithAlpha(colors.onSurfaceVariant, 0.5),
  },
  linkedName: {
    flex: 1,
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
  },
  addLinkContainer: {
    gap: StaticTheme.spacing.sm,
  },
  addLinkTitle: {
    fontSize: ({ fonts }) => fonts.titleMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.titleMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleMedium.lineHeight,
  },
  addLinkContent: {
    flexDirection: 'row',
    gap: StaticTheme.spacing.md,
  },
  actionCard: {
    flex: 1,
    borderWidth: 1,
    minHeight: 100,
    backgroundColor: 'transparent',
    borderRadius: StaticTheme.borderRadius.s,
    borderColor: ({ colors }) => colors.primary,
  },
  actionCardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: StaticTheme.spacing.sm,
  },
  actionCardText: {
    textAlign: 'center',
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
    color: ({ colors }) => colors.primary,
  },
  codeDisplay: {
    paddingVertical: StaticTheme.spacing.sm,
    paddingLeft: StaticTheme.spacing.md * 1.5,
    paddingRight: StaticTheme.spacing.xs,
    borderRadius: StaticTheme.borderRadius.s,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: StaticTheme.spacing.md * 1.5,
    backgroundColor: ({ colors }) => colors.surfaceVariant,
  },
  codeText: {
    letterSpacing: 2,
    marginRight: 'auto',
    fontSize: ({ fonts }) => fonts.headlineMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.headlineMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.headlineMedium.lineHeight,
  },
  codeInput: {
    borderRadius: StaticTheme.borderRadius.s,
    paddingHorizontal: StaticTheme.spacing.lg,
    paddingVertical: StaticTheme.spacing.md,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: StaticTheme.spacing.md * 1.5,
    fontSize: ({ fonts }) => fonts.headlineMedium.fontSize,
    color: ({ colors }) => colors.onSurface,
    backgroundColor: ({ colors }) => colors.surfaceVariant,
  },
  modalButtonContainer: {
    gap: StaticTheme.spacing.sm * 1.5,
  },
});

export default AccountLinkingScreen;
