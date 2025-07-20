import * as Contacts from 'expo-contacts';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput, {
  ICountry,
  getCountriesByCallingCode,
  getCountryByCca2,
  isValidPhoneNumber,
} from 'react-native-international-phone-number';
import uuid from 'react-native-uuid';

import { Alert, Button, View } from 'react-native';
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
import { getMergedPhone, getSeparatedPhone } from '@/utils/phoneNumberUtils';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedText from '@/components/atoms/ThemedText';
import ThemedView from '@/components/atoms/ThemedView';

const defaultPhoneCountry = getCountryByCca2('GB') || null;

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
  const [methods, setMethods] = useState<ContactMethod[]>([]);

  const [phoneCountry, setPhoneCountry] = useState<null | ICountry>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const [hasPermission, setHasPermission] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const [showMethodOptions, setShowMethodOptions] = useState(false);

  const handlePhoneNumberChange = useCallback((phoneNumber: string) => {
    setPhoneNumber(phoneNumber);
  }, []);

  const handlePhonCountryChange = useCallback((country: ICountry) => {
    setPhoneCountry(country);
  }, []);

  const handleMethodPress = useCallback(() => {
    setShowMethodOptions((prev) => !prev);
  }, []);

  const handleMethodToggle = useCallback((method: ContactMethod) => {
    setMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method],
    );
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

      const phoneData = data.phoneNumbers?.[0];
      if (!phoneData) {
        Alert.alert('Error', t('No phone number found'));
        return;
      }

      const name = data.name || `${data.firstName} ${data.lastName}`;
      setName(name.trim() || 'Unknown');

      if (phoneData.countryCode) {
        setPhoneCountry(
          getCountriesByCallingCode(phoneData.countryCode)?.[0] || defaultPhoneCountry,
        );
      }
      if (phoneData.number) {
        setPhoneNumber(phoneData.number.replace(/[^\d]/g, ''));
      }
    } catch (error) {
      if (__DEV__) console.log('Error loading contacts:', error);
      Alert.alert('Error', t('Failed to load contacts'));
    } finally {
      setIsRequesting(false);
    }
  }, [hasPermission, requestContactsPermission, t]);

  const handleSave = useCallback(() => {
    if (!name) {
      Alert.alert('Error', t('Please enter a name.'));
      return;
    }

    if (!phoneCountry || !isValidPhoneNumber(phoneNumber, phoneCountry)) {
      Alert.alert('Error', t('Please enter a valid phone number.'));
      return;
    }

    if (methods.length === 0) {
      Alert.alert('Error', t('Please select at least one contact method.'));
      return;
    }

    if (!user) return;
    const originContacts = user.settings.emergencyContacts;
    const mergedPhone = getMergedPhone(phoneNumber, phoneCountry);

    if (isEditMode) {
      updateUserSettingsMutation.mutate(
        {
          emergencyContacts: originContacts.map((c) =>
            c.id === params.contactId ? { ...c, name, phone: mergedPhone, methods } : c,
          ),
        },
        {
          onSuccess: () => {
            router.back();
          },
        },
      );
    } else {
      const phone = getMergedPhone(phoneNumber, phoneCountry);
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
    phoneCountry,
    methods,
    user,
    phoneNumber,
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

  useEffect(() => {
    if (hasInit) return;
    if (isEditMode) {
      const targetContact = user?.settings?.emergencyContacts?.find(
        (c) => c.id === params.contactId,
      );
      if (targetContact) {
        setName(targetContact.name);
        setMethods(targetContact.methods);
        const { phoneCountry, phoneNumber } = getSeparatedPhone(targetContact.phone);
        setPhoneCountry(phoneCountry || null);
        setPhoneNumber(phoneNumber);
      }
      setHasInit(true);
    } else {
      setPhoneCountry(defaultPhoneCountry);
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
            render={() => (
              <PhoneInput
                value={phoneNumber}
                selectedCountry={phoneCountry}
                onChangePhoneNumber={handlePhoneNumberChange}
                onChangeSelectedCountry={handlePhonCountryChange}
                placeholder={t('Enter phone number')}
                phoneInputSelectionColor={theme.colors.primary}
                phoneInputPlaceholderTextColor={theme.colors.outline}
                phoneInputStyles={{
                  container: styles.phoneInputContainer,
                  flagContainer: styles.phoneInputFlagContainer,
                  flag: styles.phoneInputFlag,
                  caret: styles.phoneInputCaret,
                  divider: styles.phoneInputDivider,
                  callingCode: styles.phoneInputCallingCode,
                  input: styles.phoneInputInput,
                }}
                modalStyles={{
                  searchInput: styles.phoneInputModalSearchInput,
                  countryItem: styles.phoneInputModalCountryItem,
                }}
              />
            )}
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
                    <ThemedText
                      color={methods.includes(method.type) ? 'primary' : 'onSurface'}
                      style={styles.methodLabel}
                    >
                      {tContactMethod(method.type)}
                    </ThemedText>
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
    | 'actionButtonsContainer'
    | 'phoneInputContainer'
    | 'phoneInputFlagContainer'
    | 'phoneInputDivider'
    | 'phoneInputModalCountryItem',
    | 'methodLabel'
    | 'phoneInputFlag'
    | 'phoneInputCaret'
    | 'phoneInputCallingCode'
    | 'phoneInputInput'
    | 'phoneInputModalSearchInput'
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
  },
  actionButtonsContainer: {
    gap: StaticTheme.spacing.md,
  },
  phoneInputContainer: {
    borderWidth: 0,
    borderRadius: 0,
    flex: 1,
    width: null,
    backgroundColor: 'transparent',
  },
  phoneInputFlagContainer: {
    paddingHorizontal: StaticTheme.spacing.xs,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: 'transparent',
  },
  phoneInputFlag: {
    fontSize: 16,
  },
  phoneInputCaret: {
    display: 'none',
  },
  phoneInputDivider: {
    display: 'none',
  },
  phoneInputCallingCode: {
    color: ({ colors }) => colors.onSurfaceVariant,
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
  },
  phoneInputInput: {
    paddingHorizontal: StaticTheme.spacing.xs,
    paddingVertical: 0,
    width: 'auto',
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
  },
  phoneInputModalSearchInput: {
    borderRadius: StaticTheme.borderRadius.s,
  },
  phoneInputModalCountryItem: {
    borderRadius: StaticTheme.borderRadius.s,
  },
});

export default ContactFormScreen;
