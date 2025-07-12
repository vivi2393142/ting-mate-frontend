import { useCallback, useState } from 'react';

import { Text, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedButton from '@/components/atoms/ThemedButton';
import { useTranslation } from 'react-i18next';

enum TabType {
  LOG = 'LOG',
  NOTE = 'NOTE',
}

interface LogEntry {
  time: string;
  text: string;
  type: TabType.LOG;
}

interface NoteEntry {
  id: number;
  name: string;
  text: string;
}

// TODO: change to real data
const mockLogEntries: LogEntry[] = [
  { time: '8:10 AM', text: 'Took medication', type: TabType.LOG },
  { time: '12:15 PM', text: 'Skipped lunch (not hungry)', type: TabType.LOG },
  { time: '2:30 PM', text: 'Mood: Calm', type: TabType.LOG },
];

const mockNotes: NoteEntry[] = [
  { id: 1, name: 'Note 1', text: 'Keep tea on lower shelf for easy access' },
  { id: 2, name: 'Note 2', text: 'Doctor visit this Saturday at 10 AM' },
];

const SharedSection = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const { t } = useTranslation('connect');

  const [activeTab, setActiveTab] = useState<TabType>(TabType.LOG);

  const handleAddNote = useCallback(() => {
    // TODO: Implement add note functionality
  }, []);

  return (
    <View>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableRipple
          onPress={() => setActiveTab(TabType.LOG)}
          style={[styles.tabButton, activeTab === TabType.LOG && styles.activeTabButton]}
          rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
        >
          <Text style={[styles.tabText, activeTab === TabType.LOG && styles.activeTabText]}>
            {t('Shared Log')}
          </Text>
        </TouchableRipple>
        <TouchableRipple
          onPress={() => setActiveTab(TabType.NOTE)}
          style={[styles.tabButton, activeTab === TabType.NOTE && styles.activeTabButton]}
          rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
        >
          <Text style={[styles.tabText, activeTab === TabType.NOTE && styles.activeTabText]}>
            {t('Shared Note')}
          </Text>
        </TouchableRipple>
      </View>
      {/* Content Area */}
      <View style={styles.contentArea}>
        {activeTab === TabType.LOG ? (
          <View style={styles.logContent}>
            {mockLogEntries.map((entry, index) => (
              <View key={index} style={styles.logEntry}>
                <Text style={styles.logTime}>• {entry.time}</Text>
                <Text style={styles.logText}> - {entry.text}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noteContent}>
            {mockNotes.map((note) => (
              <View key={note.id} style={styles.noteEntry}>
                {/* TODO: Open note in separate screen */}
                <Text style={styles.noteText}>
                  {note.name}: {note.text}
                </Text>
              </View>
            ))}
            <ThemedButton
              mode="outlined"
              icon="plus"
              onPress={handleAddNote}
              style={styles.addButton}
            >
              {t('Add Note')}
            </ThemedButton>
          </View>
        )}
      </View>
    </View>
  );
};

const getStyles = createStyles<
  StyleRecord<
    | 'tabContainer'
    | 'tabButton'
    | 'activeTabButton'
    | 'contentArea'
    | 'logContent'
    | 'noteContent'
    | 'logEntry'
    | 'noteEntry'
    | 'addButton',
    'tabText' | 'activeTabText' | 'logText' | 'logTime' | 'noteText'
  >
>({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: ({ colors }) => colors.surfaceVariant,
    borderRadius: StaticTheme.borderRadius.s,
    padding: StaticTheme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: StaticTheme.spacing.sm,
    borderRadius: StaticTheme.borderRadius.s,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: ({ colors }) => colors.primary,
  },
  tabText: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
  },
  activeTabText: {
    color: ({ colors }) => colors.onPrimary,
  },
  contentArea: {
    backgroundColor: ({ colors }) => colors.surfaceVariant,
    paddingVertical: StaticTheme.spacing.md * 1.25,
    paddingHorizontal: StaticTheme.spacing.lg,
    borderRadius: StaticTheme.borderRadius.s,
    gap: StaticTheme.spacing.sm,
    marginTop: StaticTheme.spacing.sm,
  },
  logContent: {
    gap: StaticTheme.spacing.sm,
  },
  noteContent: {
    gap: StaticTheme.spacing.sm,
  },
  logEntry: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  logTime: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.primary,
  },
  logText: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
    flex: 1,
  },
  noteEntry: {
    flexDirection: 'row',
  },
  noteText: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
    flex: 1,
  },
  addButton: {
    marginTop: StaticTheme.spacing.sm,
  },
});

export default SharedSection;
