import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, View } from 'react-native';

import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { ContactMethod } from '@/types/connect';
import type { EmergencyContact } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { getDisplayPhone } from '@/utils/phoneNumberUtils';

import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import ThemedText from '@/components/atoms/ThemedText';
import NoteMessage from '@/components/screens/Connect/NoteMessage';
import SectionContainer from '@/components/screens/Connect/SectionContainer';

const MIN_ITEM_COUNT = 3;

const whatsAppColor = '#25A366';

// Keep leading '+' if present, remove all other non-digit characters except the leading '+'
const sanitizePhoneNumber = (phone: string): string => {
  if (phone.startsWith('+')) return '+' + phone.slice(1).replace(/\D/g, '');
  return phone.replace(/\D/g, '');
};

const getWhatsAppMessageUrl = (phone: string) => `https://wa.me/${phone}`;

const ContactRow = ({
  contact,
  isExpanded,
}: {
  contact: EmergencyContact;
  isExpanded: boolean;
}) => {
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

  return (
    <View style={styles.contactRow}>
      <View style={styles.contactInfo}>
        <ThemedText>{contact.name}</ThemedText>
        {isExpanded && (
          <ThemedText variant="bodyMedium" color="onSurfaceVariant">
            {getDisplayPhone(contact.phone)}
          </ThemedText>
        )}
      </View>
      <View style={styles.contactActions}>
        {contact.methods.includes(ContactMethod.PHONE) && (
          <ThemedIconButton
            mode="outlined"
            name="phone.fill"
            size={'medium'}
            color={theme.colors.primary}
            onPress={handleEmergencyCall}
            accessibilityLabel={t('Call {{name}}', { name: contact.name })}
          />
        )}
        {contact.methods.includes(ContactMethod.WHATSAPP) && (
          <ThemedIconButton
            mode="outlined"
            name="message.fill"
            size={'medium'}
            color={whatsAppColor}
            onPress={handleWhatsAppMessage}
            accessibilityLabel={t('Send WhatsApp to {{name}}', { name: contact.name })}
          />
        )}
        {isExpanded && (
          <ThemedIconButton
            mode="outlined"
            name="pencil"
            size={'medium'}
            color={theme.colors.outline}
            onPress={handleEditContact}
            accessibilityLabel={t('Edit {{name}}', { name: contact.name })}
          />
        )}
      </View>
    </View>
  );
};

const EmergencySection = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const { t } = useTranslation('connect');
  const user = useUserStore((s) => s.user);

  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddContact = useCallback(() => {
    router.push({
      pathname: ROUTES.ADD_EMERGENCY_CONTACT,
      params: { from: ROUTES.CONNECT },
    });
  }, [router]);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const hasContacts = !!user?.settings?.emergencyContacts?.length;

  return (
    <SectionContainer
      title={t('Emergency Contact')}
      isExpanded={isExpanded}
      onToggle={handleToggleExpanded}
      hideToggle={!hasContacts}
    >
      {hasContacts ? (
        <View style={styles.root}>
          {/* Emergency Contacts List */}
          <View style={styles.contactsContainer}>
            <View style={styles.contactList}>
              {user?.settings?.emergencyContacts?.map((contact, idx) =>
                isExpanded || idx < MIN_ITEM_COUNT ? (
                  <ContactRow key={contact.id} contact={contact} isExpanded={isExpanded} />
                ) : null,
              )}
            </View>
            {isExpanded && (
              <ThemedButton
                mode="contained"
                icon="plus"
                onPress={handleAddContact}
                style={styles.button}
              >
                {t('Add Contact')}
              </ThemedButton>
            )}
          </View>
        </View>
      ) : (
        <NoteMessage
          message={t('No emergency contacts yet. Add contacts below for quick access.')}
          buttonProps={{
            mode: 'contained',
            icon: 'plus',
            onPress: handleAddContact,
            children: t('Add Contact'),
          }}
        />
      )}
    </SectionContainer>
  );
};

const getContactRowStyles = createStyles<
  StyleRecord<'contactRow' | 'contactInfo' | 'contactActions'>
>({
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm,
    borderRadius: StaticTheme.borderRadius.s,
    paddingHorizontal: StaticTheme.spacing.md,
    paddingVertical: StaticTheme.spacing.xs * 1.5,
    borderWidth: 1,
    borderColor: ({ colors }) => colors.outline,
  },
  contactInfo: {
    flex: 1,
  },
  contactActions: {
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm * 1.25,
  },
});

const getStyles = createStyles<
  StyleRecord<'root' | 'contactsContainer' | 'contactList' | 'button'>
>({
  root: {
    gap: StaticTheme.spacing.md,
  },
  contactsContainer: {
    gap: StaticTheme.spacing.sm,
  },
  contactList: {
    gap: StaticTheme.spacing.sm * 1.5,
  },
  button: {
    marginTop: StaticTheme.spacing.sm,
  },
});

export default EmergencySection;
