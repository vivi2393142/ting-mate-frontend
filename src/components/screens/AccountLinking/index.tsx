import * as Clipboard from 'expo-clipboard';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Stack, useRouter } from 'expo-router';
import { Alert, Share, TextInput, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import { useAcceptInvitation, useGenerateInvitation } from '@/api/invitation';
import { useRemoveUserLink } from '@/api/user';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useStackScreenOptionsHelper from '@/hooks/useStackScreenOptionsHelper';
import useAuthStore from '@/store/useAuthStore';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { Role, type UserLink } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import CommonModal from '@/components/atoms/CommonModal';
import IconSymbol from '@/components/atoms/IconSymbol';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import ThemedText from '@/components/atoms/ThemedText';
import ThemedView from '@/components/atoms/ThemedView';

const LinkedAccountList = ({
  title,
  users,
  handleUnlink,
}: {
  title: string;
  users: UserLink[];
  handleUnlink: (userEmail: string, userName: string) => () => void;
}) => {
  const { t } = useTranslation('accountLinking');
  const theme = useAppTheme();
  const styles = getLinkedAccountListStyles(theme);

  return (
    <Fragment>
      <ThemedText variant="bodyMedium" color="outline">
        {title}
      </ThemedText>
      <View style={styles.linkedAccountsList}>
        {users.map((user) => (
          <View key={user.email} style={styles.linkedRow}>
            <ThemedText color="onSurfaceVariant" style={styles.linkedName}>
              {user.name || '---'} ({user.email})
            </ThemedText>
            <ThemedIconButton
              name="xmark.circle"
              color={theme.colors.error}
              onPress={handleUnlink(user.email, user.name)}
              accessibilityLabel={t('Unlink')}
            />
          </View>
        ))}
      </View>
    </Fragment>
  );
};

const AccountLinkingScreen = () => {
  const { t } = useTranslation('accountLinking');
  const { t: tCommon } = useTranslation('common');
  const getStackScreenOptions = useStackScreenOptionsHelper();

  const router = useRouter();

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const user = useUserStore((s) => s.user);
  const linkedUsers = useMemo(() => user?.settings.linked || [], [user]);

  // Check if user is caregiver and has linked accounts
  const isCaregiver = user?.role === Role.CAREGIVER;
  const hasLinkedAccounts = linkedUsers.length > 0;
  const isLoggedIn = !!useAuthStore((s) => s.token);
  const shouldDisableAddLink = (isCaregiver && hasLinkedAccounts) || !isLoggedIn;

  const [inviteCode, setInviteCode] = useState('');
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string>('');
  const [inputCode, setInputCode] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const generateInvitationMutation = useGenerateInvitation();
  const acceptInvitationMutation = useAcceptInvitation();

  const removeUserLink = useRemoveUserLink({
    onSuccess: (data) => {
      Alert.alert(tCommon('Success'), data.message);
    },
    onError: (error) => {
      Alert.alert(tCommon('Error'), error.message);
    },
  });

  const handleUnlink = (userEmail: string, userName: string) => () => {
    Alert.alert(t('Unlink Account'), `${t('Are you sure you want to unlink')} ${userName}?`, [
      {
        text: tCommon('Cancel'),
        style: 'cancel',
      },
      {
        text: tCommon('Confirm'),
        style: 'destructive',
        onPress: () => removeUserLink.mutate(userEmail),
      },
    ]);
  };

  const handleCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(inviteCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      Alert.alert(tCommon('Error'), t('Failed to copy code to clipboard'));
    }
  }, [inviteCode, tCommon, t]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${t("I'm using Ting Mate to manage tasks and stay in touch.")}\n${t('Join me with this code')}: ${inviteCode}`,
      });
    } catch {
      Alert.alert(tCommon('Error'), t('Failed to share code'));
    }
  }, [inviteCode, t, tCommon]);

  const handleLink = () => {
    if (!inputCode.trim()) return;
    acceptInvitationMutation.mutate(inputCode.trim(), {
      onSuccess: () => {
        setShowInputModal(false);
        setInputCode('');
      },
      onError: () => {
        Alert.alert(
          tCommon('Error'),
          t('Failed to link account. Make sure the code is correct and not expired.'),
        );
      },
    });
  };

  const handleShowInviteModal = useCallback(() => {
    generateInvitationMutation.mutate(undefined, {
      onSuccess: (data) => {
        setInviteCode(data.invitation_code);
        setInviteExpiresAt(data.expires_at);
      },
      onError: () => {
        Alert.alert(tCommon('Error'), t('Failed to generate invitation code. Please try again.'));
      },
    });
    setShowInviteModal(true);
  }, [generateInvitationMutation, t, tCommon]);

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

  const formatExpiryDate = (expiresAt: string) => {
    try {
      const date = new Date(expiresAt);
      return date.toLocaleString();
    } catch {
      return '';
    }
  };

  const handleSignInPress = useCallback(() => {
    router.push({
      pathname: ROUTES.LOGIN,
      params: {
        from: ROUTES.ACCOUNT_LINKING,
      },
    });
  }, [router]);

  const [carereceivers, caregivers] = useMemo(
    () =>
      linkedUsers.reduce<[UserLink[], UserLink[]]>(
        (acc, curr) => {
          acc[curr.role === Role.CAREGIVER ? 1 : 0].push(curr);
          return acc;
        },
        [[], []],
      ),
    [linkedUsers],
  );

  const purposeItems = [
    { text: t('Keep track of tasks together'), icon: 'checklist' },
    { text: t('Get gentle updates when things are done'), icon: 'bell' },
    { text: t("Stay close, even when you're apart"), icon: 'heart' },
  ] as const;

  // TODO: Adjust layout for Large mode
  // TODO: Show accounts that are in same group (same carereceiver)
  return (
    <Fragment>
      <Stack.Screen options={getStackScreenOptions({ title: ROUTES.ACCOUNT_LINKING })} />
      <ScreenContainer
        isRoot={false}
        scrollable
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Linked Account Section */}
        <ThemedView style={styles.linkedAccountsContainer}>
          <ThemedText variant="titleLarge">{t('Linked Accounts')}</ThemedText>
          {carereceivers.length !== 0 && (
            <LinkedAccountList
              title={tCommon('role.Core User')}
              users={carereceivers}
              handleUnlink={handleUnlink}
            />
          )}
          {caregivers.length !== 0 && (
            <LinkedAccountList
              title={tCommon('role.Companion')}
              users={caregivers}
              handleUnlink={handleUnlink}
            />
          )}
          {linkedUsers?.length === 0 && (
            <ThemedText variant="bodyMedium" color="outline">
              {t('No linked accounts yet. Use the options below to connect with someone.')}
            </ThemedText>
          )}
        </ThemedView>
        {/* Add Link Section */}
        <ThemedView style={styles.addLinkContainer}>
          <ThemedText variant="titleLarge">{t('Add Link')}</ThemedText>
          {shouldDisableAddLink && (
            <View style={styles.warningContainer}>
              <IconSymbol
                name="exclamationmark.triangle"
                size={StaticTheme.iconSize.s}
                color={theme.colors.error}
                style={styles.warmingIcon}
              />
              <ThemedText variant="bodyMedium" color="outline">
                {!isLoggedIn
                  ? t('Please sign in to link accounts with others.')
                  : t(
                      'Caregivers can only link with one account. To link other account, please remove existing links first.',
                    )}
              </ThemedText>
            </View>
          )}
          <View style={styles.addLinkContent}>
            <TouchableRipple
              onPress={handleShowInviteModal}
              style={[styles.actionCard, shouldDisableAddLink && styles.disabledCard]}
              rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
              disabled={shouldDisableAddLink}
            >
              <View style={styles.actionCardContent}>
                <IconSymbol
                  name="qrcode"
                  size={StaticTheme.iconSize.l}
                  color={shouldDisableAddLink ? theme.colors.outlineVariant : theme.colors.primary}
                />
                <ThemedText color={shouldDisableAddLink ? 'outlineVariant' : 'primary'}>
                  {t('Invite Someone')}
                </ThemedText>
              </View>
            </TouchableRipple>
            <TouchableRipple
              onPress={handleShowInputModal}
              style={[styles.actionCard, shouldDisableAddLink && styles.disabledCard]}
              rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
              disabled={shouldDisableAddLink}
            >
              <View style={styles.actionCardContent}>
                <IconSymbol
                  name="plus"
                  size={StaticTheme.iconSize.l}
                  color={shouldDisableAddLink ? theme.colors.outlineVariant : theme.colors.primary}
                />
                <ThemedText color={shouldDisableAddLink ? 'outlineVariant' : 'primary'}>
                  {t('I Got a Code')}
                </ThemedText>
              </View>
            </TouchableRipple>
          </View>
          <ThemedView style={styles.note}>
            <ThemedText variant="titleMedium" color="onSurfaceVariant" style={styles.noteTitle}>
              {t('Why link accounts?')}
            </ThemedText>
            {purposeItems.map((item, idx) => (
              <View key={idx} style={styles.purposeRow}>
                <IconSymbol
                  name={item.icon}
                  size={StaticTheme.iconSize.m}
                  color={theme.colors.primary}
                />
                <ThemedText variant="bodyMedium" color="outline">
                  {item.text}
                </ThemedText>
              </View>
            ))}
          </ThemedView>
          {!isLoggedIn && (
            <ThemedButton onPress={handleSignInPress} style={styles.signInButton}>
              {tCommon('Login / Sign Up')}
            </ThemedButton>
          )}
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
            <ThemedText variant="headlineMedium" style={styles.codeText}>
              {inviteCode}
            </ThemedText>
            <ThemedIconButton
              name={copySuccess ? 'checkmark.circle.fill' : 'document.on.document'}
              color={theme.colors.primary}
              onPress={handleCopy}
              accessibilityLabel={t('Copy code')}
            />
          </View>
          {inviteExpiresAt && (
            <View style={styles.expiryContainer}>
              <IconSymbol
                name="clock"
                size={StaticTheme.iconSize.xs}
                color={theme.colors.outline}
              />
              <ThemedText variant="bodySmall" color="outline">
                {t('Expires at')}: {formatExpiryDate(inviteExpiresAt)}
              </ThemedText>
            </View>
          )}
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
            maxLength={8}
            autoFocus
          />
          <View style={styles.modalButtonContainer}>
            <ThemedButton
              mode="contained"
              onPress={handleLink}
              disabled={!inputCode.trim() || acceptInvitationMutation.isPending}
              loading={acceptInvitationMutation.isPending}
            >
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

const getLinkedAccountListStyles = createStyles<
  StyleRecord<'linkedAccountsList' | 'linkedRow', 'linkedName'>
>({
  linkedAccountsList: {
    gap: StaticTheme.spacing.sm * 1.5,
    marginBottom: StaticTheme.spacing.xs * 1.5,
  },
  linkedRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm,
    borderRadius: StaticTheme.borderRadius.s,
    paddingLeft: StaticTheme.spacing.md,
    paddingRight: StaticTheme.spacing.sm * 1.25,
    paddingVertical: StaticTheme.spacing.sm,
    borderWidth: 1,
    borderColor: ({ colors }) => colorWithAlpha(colors.primary, 0.5),
  },
  linkedName: {
    flex: 1,
  },
});

const getStyles = createStyles<
  StyleRecord<
    | 'container'
    | 'content'
    | 'note'
    | 'purposeRow'
    | 'linkedAccountsContainer'
    | 'addLinkContainer'
    | 'addLinkContent'
    | 'actionCard'
    | 'actionCardContent'
    | 'disabledCard'
    | 'codeDisplay'
    | 'modalButtonContainer'
    | 'expiryContainer'
    | 'warningContainer'
    | 'signInButton',
    'noteTitle' | 'codeText' | 'codeInput' | 'warmingIcon'
  >
>({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: StaticTheme.spacing.sm,
    gap: StaticTheme.spacing.md * 1.5,
  },
  note: {
    backgroundColor: ({ colors }) => colors.surfaceVariant,
    paddingVertical: StaticTheme.spacing.md * 1.25,
    paddingHorizontal: StaticTheme.spacing.lg,
    borderRadius: StaticTheme.borderRadius.s,
    gap: StaticTheme.spacing.sm * 1.25,
  },
  noteTitle: {
    marginBottom: StaticTheme.spacing.xs,
  },
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StaticTheme.spacing.sm * 1.25,
  },
  linkedAccountsContainer: {
    gap: StaticTheme.spacing.sm,
  },
  addLinkContainer: {
    gap: StaticTheme.spacing.sm,
  },
  addLinkContent: {
    flexDirection: 'row',
    gap: StaticTheme.spacing.md,
    marginBottom: StaticTheme.spacing.sm,
  },
  actionCard: {
    flex: 1,
    borderWidth: 1,
    minHeight: 100,
    borderRadius: StaticTheme.borderRadius.s,
    borderColor: ({ colors }) => colors.primary,
    backgroundColor: ({ colors }) => colorWithAlpha(colors.primary, 0.05),
  },
  disabledCard: {
    borderColor: ({ colors }) => colors.outlineVariant,
    backgroundColor: ({ colors }) => colorWithAlpha(colors.surfaceVariant, 0.5),
  },
  actionCardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: StaticTheme.spacing.sm,
  },
  codeDisplay: {
    paddingVertical: StaticTheme.spacing.sm,
    paddingLeft: StaticTheme.spacing.md * 1.5,
    paddingRight: StaticTheme.spacing.xs,
    borderRadius: StaticTheme.borderRadius.s,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: StaticTheme.spacing.xs,
    backgroundColor: ({ colors }) => colors.surfaceVariant,
  },
  codeText: {
    letterSpacing: 2,
    marginRight: 'auto',
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
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StaticTheme.spacing.xs,
    marginBottom: StaticTheme.spacing.md * 1.5,
  },
  warmingIcon: {
    marginTop: StaticTheme.spacing.xs * 0.5,
  },
  warningContainer: {
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm,
  },
  signInButton: {
    marginTop: StaticTheme.spacing.xs * 1.5,
  },
});

export default AccountLinkingScreen;
