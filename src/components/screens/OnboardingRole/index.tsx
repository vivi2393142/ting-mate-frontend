import { Stack, useRouter } from 'expo-router';
import { Fragment, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { StaticTheme } from '@/theme';
import { Role } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedText from '@/components/atoms/ThemedText';
import CaregiverSvg from '@/components/svg/CaregiverSvg';
import CarereceiverSvg from '@/components/svg/CarereceiverSvg';

export const OnboardingRoleScreen = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const handleRoleSelect = useCallback(
    (role: Role) => {
      setSelectedRole(role);
      void useOnboardingStore.getState().setHasSetOnboardingRole(true);
      router.replace({
        pathname: role === Role.CAREGIVER ? ROUTES.SETTINGS : ROUTES.HOME,
        params: { role },
      });
    },
    [router],
  );

  return (
    <Fragment>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenContainer isRoot style={styles.root}>
        <ThemedText variant="headlineLarge" style={styles.title}>
          {t('How do you plan to use Ting Mate?')}
        </ThemedText>
        <View style={styles.cardsWrapper}>
          {/* Try It for Yourself card */}
          <View style={styles.cardRow}>
            <TouchableRipple
              style={styles.svgLeftWrapper}
              onPress={() => handleRoleSelect(Role.CARERECEIVER)}
            >
              <CarereceiverSvg width={170} height={170} />
            </TouchableRipple>
            <TouchableRipple
              onPress={() => handleRoleSelect(Role.CARERECEIVER)}
              style={[styles.roleCard, selectedRole === Role.CARERECEIVER && styles.selectedCard]}
            >
              <ThemedText variant="titleLarge" color="onPrimary" style={styles.cardTextRight}>
                {t('Try It for Yourself')}
              </ThemedText>
            </TouchableRipple>
          </View>
          <ThemedText>{t('or')}</ThemedText>
          {/* Helping someone card */}
          <View style={styles.cardRow}>
            <TouchableRipple
              onPress={() => handleRoleSelect(Role.CAREGIVER)}
              style={[styles.roleCard, selectedRole === Role.CAREGIVER && styles.selectedCard]}
            >
              <ThemedText variant="titleLarge" color="onPrimary" style={styles.cardTextLeft}>
                {t('Connect with Mates')}
              </ThemedText>
            </TouchableRipple>
            <TouchableRipple
              style={styles.svgRightWrapper}
              onPress={() => handleRoleSelect(Role.CAREGIVER)}
            >
              <CaregiverSvg width={170} height={170} />
            </TouchableRipple>
          </View>
        </View>
      </ScreenContainer>
    </Fragment>
  );
};

const getStyles = createStyles<
  StyleRecord<
    | 'root'
    | 'cardsWrapper'
    | 'cardRow'
    | 'roleCard'
    | 'selectedCard'
    | 'svgLeftWrapper'
    | 'svgRightWrapper',
    'title' | 'cardTextRight' | 'cardTextLeft'
  >
>({
  root: {
    backgroundColor: ({ colors }) => colors.background,
    paddingHorizontal: StaticTheme.spacing.xxl,
    flex: 1,
    justifyContent: 'center',
    marginBottom: StaticTheme.spacing.xxl,
  },
  title: {
    marginBottom: StaticTheme.spacing.xxl * 1.5,
  },
  cardsWrapper: {
    gap: StaticTheme.spacing.xxl,
    alignItems: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  svgLeftWrapper: {
    position: 'absolute',
    left: -20,
    zIndex: 2,
  },
  svgRightWrapper: {
    position: 'absolute',
    right: -20,
    zIndex: 2,
  },
  roleCard: {
    flex: 1,
    minHeight: 120,
    borderRadius: StaticTheme.borderRadius.m,
    elevation: 2,
    paddingVertical: StaticTheme.spacing.xl,
    paddingHorizontal: StaticTheme.spacing.xl,
    backgroundColor: ({ colors }) => colors.tertiary,
    borderWidth: 0,
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: ({ colors }) => colors.primary,
  },
  cardTextLeft: {
    alignSelf: 'flex-start',
    marginRight: 80,
  },
  cardTextRight: {
    alignSelf: 'flex-end',
    marginLeft: 120,
    textAlign: 'right',
  },
});

export default OnboardingRoleScreen;
