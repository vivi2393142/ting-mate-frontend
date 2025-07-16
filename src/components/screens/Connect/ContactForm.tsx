import * as Contacts from 'expo-contacts';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import uuid from 'react-native-uuid';

import { Alert, Button, Text, View } from 'react-native';
import { Divider, TouchableRipple } from 'react-native-paper';

import { useUpdateUserSettings } from '@/api/user';
import IconSymbol, { IconName } from '@/components/atoms/IconSymbol';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useContactMethodTranslation from '@/hooks/useContactMethodTranslation';
import useStackScreenOptionsHelper from '@/hooks/useStackScreenOptionsHelper';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { ContactMethod } from '@/types/connect';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { cleanPhoneInput, formatPhoneDisplay, validatePhoneNumber } from '@/utils/phoneNumberUtils';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedView from '@/components/atoms/ThemedView';

interface ContactMethodOption {
  type: ContactMethod;
  icon: IconName;
}

const contactMethods: ContactMethodOption[] = [
  { type: ContactMethod.PHONE, icon: 'phone' },
  { type: ContactMethod.WHATSAPP, icon: 'message' },
];

const ContactFormScreen = () => {
  const { t } = useTranslation('connect');
  const { t: tCommon } = useTranslation('common');
  const { tContactMethod } = useContactMethodTranslation();
  const getStackScreenOptions = useStackScreenOptionsHelper();

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const router = useRouter();
  const params = useLocalSearchParams();

  const isEditMode = params.contactId !== undefined;

  const user = useUserStore((s) => s.user);
  const updateUserSettingsMutation = useUpdateUserSettings();

  const [hasInit, setHasInit] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [methods, setMethods] = useState<ContactMethod[]>([]);

  const [hasPermission, setHasPermission] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const [showMethodOptions, setShowMethodOptions] = useState(false);

  const isPhoneValid = useMemo(() => validatePhoneNumber(phone), [phone]);
  const displayPhone = useMemo(() => formatPhoneDisplay(phone), [phone]);

  const handlePhoneChange = useCallback((text: string) => {
    const cleaned = cleanPhoneInput(text);
    setPhone(cleaned);
  }, []);

  const requestContactsPermission = useCallback(async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      return status === 'granted';
    } catch {
      Alert.alert('Error', t('Failed to request contacts permission'));
      return false;
    }
  }, [t]);

  const handleLoadFromContacts = useCallback(async () => {
    setIsRequesting(true);
    if (!hasPermission) {
      const granted = await requestContactsPermission();
      if (!granted) return;
    }

    try {
      const data = await Contacts.presentContactPickerAsync();
      if (!data) return;

      const phone = data.phoneNumbers?.[0]?.number;
      if (!phone) {
        Alert.alert('Error', t('No phone number found'));
        return;
      }

      const name = data.name || `${data.firstName} ${data.lastName}`;
      setName(name.trim() || 'Unknown');
      setPhone(cleanPhoneInput(phone));
    } catch (error) {
      if (__DEV__) console.error('Error loading contacts:', error);
      Alert.alert('Error', t('Failed to load contacts'));
    } finally {
      setIsRequesting(false);
    }
  }, [hasPermission, requestContactsPermission, t]);

  const handleMethodToggle = useCallback((method: ContactMethod) => {
    setMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method],
    );
  }, []);

  const handleSave = useCallback(() => {
    if (!name) {
      Alert.alert('Error', t('Please enter a name.'));
      return;
    }

    if (!phone) {
      Alert.alert('Error', t('Please enter a phone number.'));
      return;
    }

    if (!isPhoneValid) {
      Alert.alert('Error', t('Please enter a valid phone number (at least 7 digits).'));
      return;
    }

    if (methods.length === 0) {
      Alert.alert('Error', t('Please select at least one contact method.'));
      return;
    }

    if (!user) return;
    const originContacts = user.settings.emergencyContacts;

    if (isEditMode) {
      updateUserSettingsMutation.mutate(
        {
          emergencyContacts: originContacts.map((c) =>
            c.id === params.contactId ? { ...c, name, phone, methods } : c,
          ),
        },
        {
          onSuccess: () => {
            router.back();
          },
        },
      );
    } else {
      updateUserSettingsMutation.mutate(
        {
          emergencyContacts: [...originContacts, { id: uuid.v4(), name, phone, methods }],
        },
        {
          onSuccess: () => {
            router.back();
          },
        },
      );
    }
  }, [
    name,
    phone,
    isPhoneValid,
    methods,
    user,
    isEditMode,
    t,
    updateUserSettingsMutation,
    params.contactId,
    router,
  ]);

  const handleDeleteContact = useCallback(() => {
    if (!isEditMode || !user) return;
    const originContacts = user.settings.emergencyContacts;
    updateUserSettingsMutation.mutate(
      {
        emergencyContacts: originContacts.filter((c) => c.id !== params.contactId),
      },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  }, [isEditMode, params.contactId, updateUserSettingsMutation, user, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleMethodPress = () => {
    setShowMethodOptions((prev) => !prev);
  };

  useEffect(() => {
    if (hasInit) return;
    if (isEditMode) {
      const targetContact = user?.settings?.emergencyContacts?.find(
        (c) => c.id === params.contactId,
      );
      if (targetContact) {
        setName(targetContact.name);
        setPhone(targetContact.phone);
        setMethods(targetContact.methods);
      }
      setHasInit(true);
    } else {
      setHasInit(true);
    }
  }, [hasInit, isEditMode, params.contactId, user?.settings?.emergencyContacts]);

  return (
    <Fragment>
      <Stack.Screen
        options={{
          ...getStackScreenOptions({
            title: isEditMode ? ROUTES.EDIT_EMERGENCY_CONTACT : ROUTES.ADD_EMERGENCY_CONTACT,
          }),
          headerLeft: () => (
            <Button color={theme.colors.primary} onPress={handleCancel} title={tCommon('Cancel')} />
          ),
          headerRight: () => (
            <Button
              color={theme.colors.primary}
              onPress={handleSave}
              title={isEditMode ? tCommon('Save') : tCommon('Done')}
              disabled={updateUserSettingsMutation.isPending}
            />
          ),
        }}
      />
      <ScreenContainer isRoot={false} style={styles.screenContainer}>
        <ThemedView>
          <FormInput
            label={t('Name')}
            icon="person"
            placeholder={t('Enter name')}
            value={name}
            valueColor={theme.colors.onSurfaceVariant}
            onChangeValue={setName}
          />
          <FormInput
            label={t('Phone')}
            icon="phone"
            placeholder={t('Enter phone number')}
            value={displayPhone}
            onChangeValue={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={25}
            valueColor={isPhoneValid ? theme.colors.onSurfaceVariant : theme.colors.error}
          />
          {/* Contact Methods */}
          <FormInput
            label={t('Methods')}
            icon="phone.bubble"
            rightIconName="chevron.up.chevron.down"
            placeholder={t('Select contact methods')}
            divider={showMethodOptions}
            value={methods.map((method) => tContactMethod(method)).join(', ')}
            valueColor={theme.colors.onSurfaceVariant}
            onPress={handleMethodPress}
          />
          {/* Methods List */}
          {showMethodOptions && (
            <View style={styles.methodsList}>
              {contactMethods.map((method) => (
                <TouchableRipple
                  key={method.type}
                  onPress={() => handleMethodToggle(method.type)}
                  style={[
                    styles.methodRow,
                    methods.includes(method.type) && styles.selectedMethodRow,
                  ]}
                  rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
                >
                  <Fragment>
                    <IconSymbol
                      name={method.icon}
                      size={StaticTheme.iconSize.m}
                      color={
                        methods.includes(method.type) ? theme.colors.primary : theme.colors.outline
                      }
                    />
                    <Text
                      style={[
                        styles.methodLabel,
                        methods.includes(method.type) && styles.selectedMethodLabel,
                      ]}
                    >
                      {tContactMethod(method.type)}
                    </Text>
                    {methods.includes(method.type) && (
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={StaticTheme.iconSize.s}
                        color={theme.colors.primary}
                      />
                    )}
                  </Fragment>
                </TouchableRipple>
              ))}
            </View>
          )}
          <Divider />
        </ThemedView>
        <View style={styles.actionButtonsContainer}>
          <ThemedButton
            mode="outlined"
            onPress={handleLoadFromContacts}
            color="primary"
            icon="square.and.arrow.down"
            loading={isRequesting}
            disabled={isRequesting || updateUserSettingsMutation.isPending}
          >
            {t('Load from Contacts')}
          </ThemedButton>
          {isEditMode && (
            <ThemedButton
              mode="outlined"
              onPress={handleDeleteContact}
              color="error"
              icon="trash"
              disabled={updateUserSettingsMutation.isPending}
              loading={updateUserSettingsMutation.isPending}
            >
              {t('Delete Contact')}
            </ThemedButton>
          )}
        </View>
      </ScreenContainer>
    </Fragment>
  );
};

const getStyles = createStyles<
  StyleRecord<
    | 'screenContainer'
    | 'methodsList'
    | 'methodRow'
    | 'selectedMethodRow'
    | 'actionButtonsContainer',
    'methodLabel' | 'selectedMethodLabel'
  >
>({
  screenContainer: {
    gap: StaticTheme.spacing.md,
    paddingTop: StaticTheme.spacing.md,
  },
  methodsList: {
    gap: StaticTheme.spacing.sm * 1.5,
    marginVertical: StaticTheme.spacing.md,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StaticTheme.spacing.sm,
    paddingHorizontal: StaticTheme.spacing.md,
    paddingVertical: StaticTheme.spacing.sm,
    borderRadius: StaticTheme.borderRadius.s,
    borderWidth: 1,
    borderColor: ({ colors }) => colors.outline,
  },
  selectedMethodRow: {
    borderColor: ({ colors }) => colors.primary,
    backgroundColor: ({ colors }) => colorWithAlpha(colors.primary, 0.05),
  },
  methodLabel: {
    flex: 1,
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
  },
  selectedMethodLabel: {
    color: ({ colors }) => colors.primary,
  },
  actionButtonsContainer: {
    gap: StaticTheme.spacing.md,
  },
});

export default ContactFormScreen;
