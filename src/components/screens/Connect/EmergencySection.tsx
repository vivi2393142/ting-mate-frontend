import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { ContactMethod } from '@/types/connect';
import type { EmergencyContact } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { getDisplayPhone } from '@/utils/phoneNumberUtils';

import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import ThemedText from '@/components/atoms/ThemedText';
import NoteMessage from '@/components/screens/Connect/NoteMessage';

const MIN_ITEM_COUNT = 3;

// TODO: use theme color
const whatsAppColor = '#25A366';

// Keep leading '+' if present, remove all other non-digit characters except the leading '+'
const sanitizePhoneNumber = (phone: string): string => {
  if (phone.startsWith('+')) return '+' + phone.slice(1).replace(/\D/g, '');
  return phone.replace(/\D/g, '');
};

const getWhatsAppMessageUrl = (phone: string) => `https://wa.me/${phone}`;

const ContactRow = ({ contact }: { contact: EmergencyContact }) => {
  const { t } = useTranslation('connect');

  const theme = useAppTheme();
  const styles = getContactRowStyles(theme);

  const router = useRouter();

  const handleEmergencyCall = useCallback(async () => {
    const sanitized = sanitizePhoneNumber(contact.phone);
    const url = `tel:${sanitized}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', t('Cannot make a call to this number.'));
      }
    } catch {
      Alert.alert('Error', t('Failed to initiate call.'));
    }
  }, [contact.phone, t]);

  const handleWhatsAppMessage = useCallback(async () => {
    // Sanitize phone number for WhatsApp (remove '+', only digits)
    const sanitized = sanitizePhoneNumber(contact.phone).replace(/^\+/, '');
    const url = getWhatsAppMessageUrl(sanitized);
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', t('WhatsApp is not installed or the number is invalid.'));
      }
    } catch {
      Alert.alert('Error', t('Failed to open WhatsApp.'));
    }
  }, [contact.phone, t]);

  const handleEditContact = useCallback(() => {
    router.push({
      pathname: ROUTES.EDIT_EMERGENCY_CONTACT,
      params: { contactId: contact.id, from: ROUTES.CONNECT },
    });
  }, [contact.id, router]);

  const validPhone = useMemo(() => getDisplayPhone(contact.phone), [contact.phone]);
  const isPhoneDisabled = useMemo(
    () => !validPhone || !contact.methods.includes(ContactMethod.PHONE),
    [contact.methods, validPhone],
  );
  const isWhatsAppDisabled = useMemo(
    () => !validPhone || !contact.methods.includes(ContactMethod.WHATSAPP),
    [contact.methods, validPhone],
  );

  return (
    <TouchableRipple onPress={handleEditContact}>
      <View style={styles.contactRow}>
        <View style={styles.contactInfo}>
          <ThemedText>{contact.name}</ThemedText>
          <ThemedText variant="bodyMedium" color="onSurfaceVariant">
            {validPhone || '---'}
          </ThemedText>
        </View>
        <View style={styles.contactActions}>
          <ThemedIconButton
            mode="outlined"
            name="phone.fill"
            size={'xlarge'}
            color={whatsAppColor}
            onPress={handleEmergencyCall}
            accessibilityLabel={t('Call {{name}}', { name: contact.name })}
            disabled={isPhoneDisabled}
          />
          <ThemedIconButton
            mode="outlined"
            name="message.fill"
            size={'xlarge'}
            color={whatsAppColor}
            onPress={handleWhatsAppMessage}
            accessibilityLabel={t('Send WhatsApp to {{name}}', { name: contact.name })}
            disabled={isWhatsAppDisabled}
          />
        </View>
      </View>
    </TouchableRipple>
  );
};

const EmergencySection = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const router = useRouter();

  const { t } = useTranslation('connect');
  const user = useUserStore((s) => s.user);

  const handleLinkAccount = useCallback(() => {
    router.push({
      pathname: ROUTES.ACCOUNT_LINKING,
      params: { from: ROUTES.CONNECT },
    });
  }, [router]);

  const hasContacts = !!user?.settings?.emergencyContacts?.length;

  return hasContacts ? (
    <View>
      <ThemedText variant="bodyMedium" color="outline" style={styles.sectionDesc}>
        {t('Keep quick contact details for your mates here.')}
      </ThemedText>
      <View style={styles.emergencyContainer}>
        {user?.settings?.emergencyContacts?.map((contact, idx) =>
          idx < MIN_ITEM_COUNT ? <ContactRow key={contact.id} contact={contact} /> : null,
        )}
      </View>
    </View>
  ) : (
    <NoteMessage
      message={t('Connect with a mate first to add quick contacts.')}
      buttonProps={{
        mode: 'contained',
        icon: 'plus',
        onPress: handleLinkAccount,
        children: t('Connect Now'),
      }}
    />
  );
};

const getStyles = createStyles<StyleRecord<'emergencyContainer', 'sectionDesc'>>({
  sectionDesc: {
    marginBottom: StaticTheme.spacing.sm * 1.5,
    paddingHorizontal: StaticTheme.spacing.sm * 1.25,
  },
  emergencyContainer: {
    backgroundColor: ({ colors }) => colorWithAlpha(colors.surfaceVariant, 0.5),
    borderRadius: StaticTheme.borderRadius.s,
    paddingHorizontal: StaticTheme.spacing.sm * 1.5,
    paddingVertical: StaticTheme.spacing.sm,
  },
});

const getContactRowStyles = createStyles<
  StyleRecord<'contactRow' | 'contactInfo' | 'contactActions'>
>({
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm,
    paddingHorizontal: StaticTheme.spacing.md,
    paddingVertical: StaticTheme.spacing.md,
    borderColor: ({ colors }) => colors.outline,
    borderBottomWidth: 1 / 3,
  },
  contactInfo: {
    flex: 1,
  },
  contactActions: {
    flexDirection: 'row',
    gap: StaticTheme.spacing.md,
  },
});

export default EmergencySection;
