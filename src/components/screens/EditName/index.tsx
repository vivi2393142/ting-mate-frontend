import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from 'react-native';

import { useUpdateUserSettings } from '@/api/user';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useStackScreenOptionsHelper from '@/hooks/useStackScreenOptionsHelper';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedView from '@/components/atoms/ThemedView';

const EditNameScreen = () => {
  const { t } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');
  const getStackScreenOptions = useStackScreenOptionsHelper();

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const user = useUserStore((s) => s.user);
  const router = useRouter();
  const updateUserSettingsMutation = useUpdateUserSettings();
  const params = useLocalSearchParams();

  // Check if user came from signup
  const isFromSignup = params.from === 'signup';

  const [name, setName] = useState(user?.settings.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim()) return;

    setIsSaving(true);
    updateUserSettingsMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          if (isFromSignup) {
            router.replace({
              pathname: ROUTES.ROLE_SELECTION,
              params: { from: 'signup' },
            });
          } else {
            router.back();
          }
        },
        onError: () => {
          Alert.alert(tCommon('Error'), t('Failed to update name. Please try again.'));
        },
        onSettled: () => {
          setIsSaving(false);
        },
      },
    );
  }, [name, updateUserSettingsMutation, router, t, tCommon, isFromSignup]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <Fragment>
      <Stack.Screen
        options={{
          ...getStackScreenOptions({ title: ROUTES.EDIT_NAME }),
          headerLeft: () =>
            isFromSignup ? undefined : (
              <Button
                color={theme.colors.primary}
                onPress={handleCancel}
                title={tCommon('Cancel')}
              />
            ),
          headerRight: () => (
            <Button
              color={theme.colors.primary}
              onPress={handleSave}
              title={isFromSignup ? tCommon('Done') : tCommon('Save')}
              disabled={!name.trim() || isSaving}
            />
          ),
          headerBackVisible: isFromSignup,
        }}
      />
      <ScreenContainer isRoot={false} style={styles.screenContainer}>
        <ThemedView>
          <FormInput
            label={t('Name')}
            icon="person"
            placeholder={t('Enter your name')}
            value={name}
            valueColor={theme.colors.onSurfaceVariant}
            onChangeValue={handleNameChange}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSave}
            editable={!isSaving}
          />
        </ThemedView>
        {isFromSignup && (
          <ThemedButton
            onPress={handleSave}
            disabled={!name.trim() || isSaving}
            style={styles.doneButton}
          >
            {tCommon('Done')}
          </ThemedButton>
        )}
      </ScreenContainer>
    </Fragment>
  );
};

const getStyles = createStyles<StyleRecord<'screenContainer' | 'doneButton'>>({
  screenContainer: {
    gap: StaticTheme.spacing.md,
    paddingTop: StaticTheme.spacing.md,
  },
  doneButton: {
    marginTop: StaticTheme.spacing.md,
  },
});

export default EditNameScreen;
