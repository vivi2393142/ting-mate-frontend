import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert } from 'react-native';
import { Text } from 'react-native-paper';

import { useGetTasks } from '@/api/tasks';
import { useTransitionUserRole } from '@/api/user';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useRoleTranslation from '@/hooks/useRoleTranslation';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { Role } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconSymbol from '@/components/atoms/IconSymbol';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedView from '@/components/atoms/ThemedView';

const RoleSelectionScreen = () => {
  const { t } = useTranslation('roleSelection');
  const { t: tCommon } = useTranslation('common');
  const { tRole } = useRoleTranslation();

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const { user, token } = useUserStore();
  const router = useRouter();
  const params = useLocalSearchParams();

  const transitionUserRoleMutation = useTransitionUserRole();
  const { data: tasks = [] } = useGetTasks();

  // Check if user came from signup
  const isFromSignup = params.from === 'signup';

  // Check if user is authenticated
  const isAuthenticated = !!token;

  const [selectedRole, setSelectedRole] = useState<Role | null>(user?.role ?? null);
  const [isSaving, setIsSaving] = useState(false);

  const handleRoleSelect = useCallback((role: Role) => {
    setSelectedRole(role);
  }, []);

  const doTransition = useCallback(() => {
    if (!selectedRole) return;

    setIsSaving(true);
    transitionUserRoleMutation.mutate(
      { target_role: selectedRole },
      {
        onSuccess: () => {
          router.back();
        },
        onError: () => {
          Alert.alert(tCommon('Error'), t('Failed to update role. Please try again.'));
        },
        onSettled: () => {
          setIsSaving(false);
        },
      },
    );
  }, [selectedRole, transitionUserRoleMutation, router, tCommon, t]);

  const handleConfirm = useCallback(() => {
    if (!selectedRole) return;

    // 1. If the target role is the same as the current role, just go back without API call
    if (selectedRole === user?.role) {
      router.back();
      return;
    }

    // 2. If the user has any linked users, show an alert and do not call the API
    if (user?.settings.linked && user.settings.linked.length > 0) {
      Alert.alert(
        t('Cannot Switch Role'),
        t('You must remove all linked users before switching roles.'),
        [
          {
            text: tCommon('Confirm'),
            style: 'default',
          },
        ],
      );
      return;
    }

    // 3. If switching from carereceiver and has tasks, show a confirmation alert before API call
    if (user?.role === Role.CARERECEIVER && tasks.length > 0) {
      Alert.alert(
        t('Switch Role?'),
        t('Switching role will delete all your tasks. Are you sure?'),
        [
          {
            text: tCommon('Cancel'),
            style: 'cancel',
          },
          {
            text: tCommon('Confirm'),
            style: 'destructive',
            onPress: () => doTransition(),
          },
        ],
      );
      return;
    }

    // 4. Otherwise, call the API to switch role
    doTransition();
  }, [selectedRole, user, tasks, t, tCommon, router, doTransition]);

  const handleSignInPress = useCallback(() => {
    router.push(ROUTES.LOGIN);
  }, [router]);

  const roles = [
    {
      role: Role.CARERECEIVER,
      subtitle: t('You can use the app alone or invite a Companion to support you.'),
      icon: 'person.fill' as const,
    },
    {
      role: Role.CAREGIVER,
      subtitle: t('Stay in sync and help with their daily tasks.'),
      icon: 'person.2' as const,
    },
  ];

  // TODO: Adjust layout for Large mode
  return (
    <Fragment>
      <Stack.Screen
        options={{
          title: t('Role Selection'),
          headerBackTitle: isFromSignup ? undefined : tCommon('Back'),
          headerBackVisible: !isFromSignup,
        }}
      />
      <ScreenContainer
        isRoot={false}
        scrollable
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <ThemedView style={styles.header}>
          <Text style={styles.headerTitle}>{t('Choose Your Role')}</Text>
          <Text style={styles.headerSubtitle}>{t('Select how you’ll use Ting Mate!')}</Text>
        </ThemedView>
        <ThemedView style={styles.roleContainer}>
          {roles.map((roleOption) => (
            <ThemedButton
              key={roleOption.role}
              mode="outlined"
              onPress={() => handleRoleSelect(roleOption.role)}
              style={[
                styles.roleCard,
                selectedRole === roleOption.role && styles.selectedRoleCard,
                !isAuthenticated && styles.disabledRoleCard,
              ]}
              disabled={!isAuthenticated}
            >
              <ThemedView style={styles.roleContent}>
                <IconSymbol
                  name={roleOption.icon}
                  size={32}
                  color={isAuthenticated ? theme.colors.primary : theme.colors.outline}
                />
                <ThemedView style={styles.roleTextContainer}>
                  <Text style={[styles.roleTitle, !isAuthenticated && styles.disabledRoleTitle]}>
                    {tRole(roleOption.role)}
                  </Text>
                  <Text style={styles.roleSubtitle}>{roleOption.subtitle}</Text>
                </ThemedView>
              </ThemedView>
            </ThemedButton>
          ))}
        </ThemedView>
        {!isAuthenticated && (
          <Fragment>
            <ThemedView style={styles.note}>
              <ThemedView style={styles.noteTitleWrapper}>
                <IconSymbol name="exclamationmark.triangle" size={16} color={theme.colors.error} />
                <Text style={styles.noteTitle}>{t('Sign in required')}</Text>
              </ThemedView>
              <Text style={styles.noteText}>
                {t('You need to sign in to save your role selection.')}
              </Text>
            </ThemedView>
            <ThemedButton disabled={!selectedRole} onPress={handleSignInPress}>
              {tCommon('Sign In / Sign Up')}
            </ThemedButton>
          </Fragment>
        )}
        {isAuthenticated && (
          <Fragment>
            {params.from !== 'signup' && (
              <ThemedView style={styles.note}>
                <ThemedView style={styles.noteTitleWrapper}>
                  <IconSymbol
                    name="arrow.left.and.right"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text style={styles.noteTitle}>{t('Switching roles?')}</Text>
                </ThemedView>
                <Text style={styles.noteText}>
                  {t(
                    'Changing to Companion will remove your current tasks and connect you to a Core User.',
                  )}
                </Text>
              </ThemedView>
            )}
            <ThemedButton disabled={!selectedRole || isSaving} onPress={handleConfirm}>
              {tCommon('Save')}
            </ThemedButton>
          </Fragment>
        )}
      </ScreenContainer>
    </Fragment>
  );
};

const getStyles = createStyles<
  StyleRecord<
    | 'container'
    | 'content'
    | 'header'
    | 'roleContainer'
    | 'roleCard'
    | 'disabledRoleCard'
    | 'selectedRoleCard'
    | 'roleContent'
    | 'roleTextContainer'
    | 'note'
    | 'noteTitleWrapper',
    | 'headerTitle'
    | 'headerSubtitle'
    | 'roleTitle'
    | 'disabledRoleTitle'
    | 'roleSubtitle'
    | 'noteTitle'
    | 'noteText'
  >
>({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: StaticTheme.spacing.sm,
    gap: StaticTheme.spacing.lg,
  },
  header: {
    gap: StaticTheme.spacing.xs,
  },
  headerTitle: {
    fontSize: ({ fonts }) => fonts.titleLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.titleLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleLarge.lineHeight,
  },
  headerSubtitle: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.outline,
  },
  roleContainer: {
    gap: StaticTheme.spacing.sm * 1.5,
  },
  roleCard: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  disabledRoleCard: {
    borderWidth: 2,
  },
  selectedRoleCard: {
    backgroundColor: ({ colors }) => colorWithAlpha(colors.primary, 0.05),
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StaticTheme.spacing.md,
    backgroundColor: 'transparent',
  },
  roleTextContainer: {
    flex: 1,
    gap: StaticTheme.spacing.xs * 1.5,
    backgroundColor: 'transparent',
  },
  roleTitle: {
    color: ({ colors }) => colors.primary,
    fontSize: ({ fonts }) => fonts.titleLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.titleLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleLarge.lineHeight,
  },
  disabledRoleTitle: {
    color: ({ colors }) => colors.outline,
  },
  roleSubtitle: {
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
  noteTitleWrapper: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: StaticTheme.spacing.sm * 1.25,
  },
  noteTitle: {
    fontSize: ({ fonts }) => fonts.titleMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.titleMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleMedium.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
  },
  noteText: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.outline,
  },
});

export default RoleSelectionScreen;
