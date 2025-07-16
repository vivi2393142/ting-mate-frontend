import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Text, View } from 'react-native';

import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import type { EmergencyContact } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import NoteMessage from '@/components/screens/Connect/NoteMessage';
import SectionContainer from '@/components/screens/Connect/SectionContainer';

const whatsAppColor = '#25A366';

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

  const handleEmergencyCall = useCallback(() => {
    // TODO: Implement emergency call functionality
    console.log('Emergency call to:', contact);
  }, [contact]);

  const handleWhatsAppMessage = useCallback(() => {
    // TODO: Implement WhatsApp message functionality
    console.log('WhatsApp message to:', contact);
  }, [contact]);

  const handleEditContact = useCallback(() => {
    router.push({
      pathname: ROUTES.EDIT_EMERGENCY_CONTACT,
      params: { contactId: contact.id, from: ROUTES.CONNECT },
    });
  }, [contact.id, router]);

  return (
    <View style={styles.contactRow}>
      <Text style={styles.contactText}>
        {contact.name} ({contact.phone})
      </Text>
      <View style={styles.contactActions}>
        <ThemedIconButton
          mode="outlined"
          name="phone.fill"
          size={'medium'}
          color={theme.colors.primary}
          onPress={handleEmergencyCall}
          accessibilityLabel={t('Call {{name}}', { name: contact.name })}
        />
        <ThemedIconButton
          mode="outlined"
          name="message.fill"
          size={'medium'}
          color={whatsAppColor}
          onPress={handleWhatsAppMessage}
          accessibilityLabel={t('Send WhatsApp to {{name}}', { name: contact.name })}
        />
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
              {user?.settings?.emergencyContacts?.map((contact) => (
                <ContactRow key={contact.id} contact={contact} isExpanded={isExpanded} />
              ))}
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
  StyleRecord<'contactRow' | 'contactActions', 'contactText'>
>({
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
