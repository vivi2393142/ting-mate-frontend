import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Text, View } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import ROUTES from '@/constants/routes';

// TODO: Replace with real API data
const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'Mom',
    phoneNumber: '+1234567890',
    note: 'Primary caregiver',
    contactMethods: ['phone', 'whatsapp'],
  },
  {
    id: '2',
    name: 'Dad',
    phoneNumber: '+1234567891',
    note: 'Emergency contact',
    contactMethods: ['phone'],
  },
];

const whatsAppColor = '#25A366';

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  note?: string;
  contactMethods: ('phone' | 'whatsapp')[];
}

const EmergencySection = ({ isExpanded }: { isExpanded: boolean }) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const { t } = useTranslation('connect');

  const handleEmergencyCall = useCallback((contact: EmergencyContact) => {
    // TODO: Implement emergency call functionality
    console.log('Emergency call to:', contact);
  }, []);

  const handleWhatsAppMessage = useCallback((contact: EmergencyContact) => {
    // TODO: Implement WhatsApp message functionality
    console.log('WhatsApp message to:', contact);
  }, []);

  const handleAddContact = useCallback(() => {
    router.push(ROUTES.ADD_EMERGENCY_CONTACT);
  }, [router]);

  const handleEditContact = useCallback(
    (contact: EmergencyContact) => {
      router.push({
        pathname: ROUTES.EDIT_EMERGENCY_CONTACT,
        params: { contactId: contact.id },
      });
    },
    [router],
  );

  return (
    <View style={styles.root}>
      {/* Emergency Contacts List */}
      <View style={styles.contactsContainer}>
        {mockEmergencyContacts.length > 0 ? (
          <View style={styles.contactList}>
            {mockEmergencyContacts.map((contact, idx) => (
              <View key={idx} style={styles.contactRow}>
                <Text style={styles.contactText}>
                  {contact.name} ({contact.phoneNumber})
                </Text>
                <View style={styles.contactActions}>
                  <ThemedIconButton
                    mode="outlined"
                    name="phone.fill"
                    size={'medium'}
                    color={theme.colors.primary}
                    onPress={() => handleEmergencyCall(contact)}
                    accessibilityLabel={t('Call {{name}}', { name: contact.name })}
                  />
                  <ThemedIconButton
                    mode="outlined"
                    name="message.fill"
                    size={'medium'}
                    color={whatsAppColor}
                    onPress={() => handleWhatsAppMessage(contact)}
                    accessibilityLabel={t('Send WhatsApp to {{name}}', { name: contact.name })}
                  />
                  {isExpanded && (
                    <ThemedIconButton
                      mode="outlined"
                      name="pencil"
                      size={'medium'}
                      color={theme.colors.outline}
                      onPress={() => handleEditContact(contact)}
                      accessibilityLabel={t('Edit {{name}}', { name: contact.name })}
                    />
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noteText}>
            {t('No emergency contacts yet. Add contacts below for quick access.')}
          </Text>
        )}
        {isExpanded && (
          <ThemedButton
            mode="contained"
            icon="plus"
            onPress={handleAddContact}
            style={styles.addButton}
          >
            {t('Add Contact')}
          </ThemedButton>
        )}
      </View>
    </View>
  );
};

const getStyles = createStyles<
  StyleRecord<
    'root' | 'contactsContainer' | 'contactList' | 'contactRow' | 'contactActions' | 'addButton',
    'noteText' | 'contactText'
  >
>({
  root: {
    gap: StaticTheme.spacing.md,
  },
  contactsContainer: {
    gap: StaticTheme.spacing.sm,
  },
  noteText: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.outline,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  contactList: {
    gap: StaticTheme.spacing.sm * 1.5,
  },
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm,
    borderRadius: StaticTheme.borderRadius.s,
    paddingHorizontal: StaticTheme.spacing.md,
    paddingVertical: StaticTheme.spacing.sm,
    borderWidth: 1,
    borderColor: ({ colors }) => colors.outline,
  },
  contactText: {
    flex: 1,
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
    color: ({ colors }) => colors.onSurface,
  },
  contactActions: {
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm * 1.25,
  },
  addButton: {
    marginTop: StaticTheme.spacing.sm,
  },
});

export default EmergencySection;
