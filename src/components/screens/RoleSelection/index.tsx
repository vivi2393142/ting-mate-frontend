import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Text } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import useRoleTranslation from '@/hooks/useRoleTranslation';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { Role } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconSymbol from '@/components/atoms/IconSymbol';
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

  // Check if user came from signup
  const isFromSignup = params.from === 'signup';

  // Check if user is authenticated
  const isAuthenticated = !!token;

  const [selectedRole, setSelectedRole] = useState<Role | null>(user?.role ?? null);

  const handleRoleSelect = useCallback((role: Role) => {
    setSelectedRole(role);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedRole) {
      // TODO: Update user role in store/API
      console.log('Selected role:', selectedRole);
      router.back();
    }
  }, [selectedRole, router]);

  const handleSignInPress = useCallback(() => {
    router.push('/login');
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

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: t('Choose Your Role'),
          headerBackTitle: isFromSignup ? undefined : tCommon('Back'),
          headerBackVisible: !isFromSignup,
        }}
      />
      <ThemedView style={styles.content}>
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
              contentStyle={styles.roleCardContent}
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
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={20}
                color={theme.colors.error}
              />
              <Text style={styles.noteTitle}>{t('Sign in required')}</Text>
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
            <ThemedView style={styles.note}>
              <IconSymbol name="arrow.left.and.right" size={20} color={theme.colors.onSurface} />
              <Text style={styles.noteTitle}>{t('Switching roles?')}</Text>
              <Text style={styles.noteText}>
                {t(
                  'Changing to Companion will remove your current tasks and connect you to a Core User.',
                )}
              </Text>
            </ThemedView>
            <ThemedButton disabled={!selectedRole} onPress={handleConfirm}>
              {tCommon('Save')}
            </ThemedButton>
          </Fragment>
        )}
      </ThemedView>
    </ThemedView>
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
    | 'roleCardContent'
    | 'roleContent'
    | 'roleTextContainer'
    | 'note',
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
    padding: StaticTheme.spacing.lg,
    gap: StaticTheme.spacing.lg,
  },
  header: {
    gap: StaticTheme.spacing.xs,
  },
  headerTitle: {
    fontSize: ({ fonts }) => fonts.headlineSmall.fontSize,
    fontWeight: ({ fonts }) => fonts.headlineSmall.fontWeight,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    color: ({ colors }) => colors.outline,
    textAlign: 'center',
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
  roleCardContent: {
    paddingHorizontal: StaticTheme.spacing.xs,
    paddingVertical: StaticTheme.spacing.sm,
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StaticTheme.spacing.md,
    backgroundColor: 'transparent',
  },
  roleTextContainer: {
    flex: 1,
    gap: StaticTheme.spacing.xs,
    backgroundColor: 'transparent',
  },
  roleTitle: {
    color: ({ colors }) => colors.primary,
    fontSize: ({ fonts }) => fonts.titleLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.titleLarge.fontWeight,
  },
  disabledRoleTitle: {
    color: ({ colors }) => colors.outline,
  },
  roleSubtitle: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    color: ({ colors }) => colors.outline,
  },
  note: {
    backgroundColor: ({ colors }) => colors.surfaceVariant,
    padding: StaticTheme.spacing.md,
    borderRadius: StaticTheme.borderRadius.s,
    alignItems: 'center',
    gap: StaticTheme.spacing.xs,
  },
  noteTitle: {
    fontSize: ({ fonts }) => fonts.titleSmall.fontSize,
    fontWeight: ({ fonts }) => fonts.titleSmall.fontWeight,
    textAlign: 'center',
  },
  noteText: {
    textAlign: 'center',
    fontSize: ({ fonts }) => fonts.bodySmall.fontSize,
    fontWeight: ({ fonts }) => fonts.bodySmall.fontWeight,
    color: ({ colors }) => colors.outline,
  },
});

export default RoleSelectionScreen;
