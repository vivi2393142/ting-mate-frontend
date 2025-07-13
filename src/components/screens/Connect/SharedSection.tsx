import { Fragment, useCallback, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ScrollView, Text, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedIconButton from '@/components/atoms/ThemedIconButton';

const MIN_ITEM_COUNT = 3;

enum TabType {
  LOG = 'LOG',
  NOTE = 'NOTE',
}

interface LogEntry {
  id: number;
  time: string;
  text: string;
  type: TabType.LOG;
}

interface NoteEntry {
  id: number;
  name: string;
  text: string;
}

interface ContentContainerProps {
  isExpanded: boolean;
  children: ReactNode;
  hasMoreItems?: boolean;
  onLoadMore?: () => void;
}

const ContentContainer = ({
  isExpanded,
  children,
  hasMoreItems,
  onLoadMore,
}: ContentContainerProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  if (isExpanded) {
    return (
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <View style={styles.content}>
          {children}
          {hasMoreItems && onLoadMore && (
            <ThemedIconButton
              name="arrow.down.circle"
              size="medium"
              onPress={onLoadMore}
              style={styles.loadMoreButton}
            />
          )}
        </View>
      </ScrollView>
    );
  }

  return <View style={styles.content}>{children}</View>;
};

interface ChipItemProps {
  label: string;
  description: string;
  onPress: () => void;
}

const ChipItem = ({ label, description, onPress }: ChipItemProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <TouchableRipple
      onPress={onPress}
      style={styles.chip}
      rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
    >
      <View style={styles.chipContent}>
        <Text style={styles.chipLabel}>{label}</Text>
        <Text style={styles.chipDesc} numberOfLines={1} ellipsizeMode="tail">
          {description}
        </Text>
      </View>
    </TouchableRipple>
  );
};

const logCount = 12;
const noteCount = 5;

// TODO: change to real data
const mockLogEntries: LogEntry[] = [
  { id: 1, time: '8:10 AM', text: 'Took medication', type: TabType.LOG },
  { id: 2, time: '12:15 PM', text: 'Skipped lunch (not hungry)', type: TabType.LOG },
  { id: 3, time: '2:30 PM', text: 'Mood: Calm', type: TabType.LOG },
  { id: 4, time: '4:45 PM', text: 'Went for a walk', type: TabType.LOG },
  { id: 5, time: '6:20 PM', text: 'Had dinner', type: TabType.LOG },
  { id: 6, time: '8:00 PM', text: 'Watched TV', type: TabType.LOG },
  { id: 7, time: '9:30 PM', text: 'Prepared for bed', type: TabType.LOG },
  { id: 8, time: '10:15 PM', text: 'Read a book', type: TabType.LOG },
  { id: 9, time: '11:00 PM', text: 'Lights out', type: TabType.LOG },
  { id: 10, time: '11:30 PM', text: 'Fell asleep', type: TabType.LOG },
  { id: 11, time: '12:00 AM', text: 'Deep sleep', type: TabType.LOG },
  { id: 12, time: '1:30 AM', text: 'Brief wake up', type: TabType.LOG },
];

const mockNotes: NoteEntry[] = [
  { id: 1, name: 'Note 1', text: 'Keep tea on lower shelf for easy access and easy access' },
  { id: 2, name: 'Note 2', text: 'Doctor visit this Saturday at 10 AM' },
  { id: 3, name: 'Note 3', text: 'Remember to refill prescription' },
  { id: 4, name: 'Note 4', text: 'Call pharmacy about delivery' },
  { id: 5, name: 'Note 5', text: 'Schedule follow-up appointment' },
];

const SharedSection = ({ isExpanded }: { isExpanded: boolean }) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const { t } = useTranslation('connect');

  const [activeTab, setActiveTab] = useState<TabType>(TabType.LOG);

  const handleAddNote = useCallback(() => {
    // TODO: Implement add note functionality
    console.log('Add note');
  }, []);

  const handleLogPress = useCallback((log: LogEntry) => {
    // TODO: Navigate to log detail screen
    console.log('View log:', log);
  }, []);

  const handleNotePress = useCallback((note: NoteEntry) => {
    // TODO: Navigate to note detail/edit screen
    console.log('View/edit note:', note);
  }, []);

  const handleLoadMoreLogs = useCallback(() => {
    console.log('Fetch more logs');
  }, []);

  const handleLoadMoreNotes = useCallback(() => {
    console.log('Fetch more notes');
  }, []);

  const visibleLogCtn = isExpanded ? logCount : MIN_ITEM_COUNT;
  const visibleNoteCtn = isExpanded ? noteCount : MIN_ITEM_COUNT;

  const hasMoreLogs = logCount < mockLogEntries.length;
  const hasMoreNotes = noteCount < mockNotes.length;

  const visibleLogs = useMemo(() => mockLogEntries.slice(0, visibleLogCtn), [visibleLogCtn]);
  const visibleNotes = useMemo(() => mockNotes.slice(0, visibleNoteCtn), [visibleNoteCtn]);

  const tabs = [
    {
      label: t('Shared Log'),
      type: TabType.LOG,
    },
    {
      label: t('Shared Note'),
      type: TabType.NOTE,
    },
  ];

  return (
    <View>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableRipple
            key={tab.type}
            onPress={() => setActiveTab(tab.type)}
            style={[styles.tabButton, activeTab === tab.type && styles.activeTabButton]}
            rippleColor={colorWithAlpha(theme.colors.primary, 0.1)}
          >
            <Text style={[styles.tabText, activeTab === tab.type && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableRipple>
        ))}
      </View>
      {/* Content Area */}
      <View style={[styles.contentArea, isExpanded && styles.contentAreaExpanded]}>
        {activeTab === TabType.LOG && (
          <ContentContainer
            isExpanded={isExpanded}
            hasMoreItems={hasMoreLogs}
            onLoadMore={handleLoadMoreLogs}
          >
            {visibleLogs.map((log) => (
              <ChipItem
                key={log.id}
                label={log.time}
                description={log.text}
                onPress={() => handleLogPress(log)}
              />
            ))}
          </ContentContainer>
        )}
        {activeTab === TabType.NOTE && (
          <Fragment>
            <ContentContainer
              isExpanded={isExpanded}
              hasMoreItems={hasMoreNotes}
              onLoadMore={handleLoadMoreNotes}
            >
              {visibleNotes.map((note) => (
                <ChipItem
                  key={note.id}
                  label={note.name}
                  description={note.text}
                  onPress={() => handleNotePress(note)}
                />
              ))}
            </ContentContainer>
            {isExpanded && (
              <ThemedIconButton
                name="plus.circle.fill"
                size="large"
                onPress={handleAddNote}
                style={styles.addNoteButton}
              />
            )}
          </Fragment>
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
    | 'contentAreaExpanded'
    | 'scrollContainer'
    | 'content'
    | 'chip'
    | 'chipContent'
    | 'loadMoreButton'
    | 'addNoteButton',
    'tabText' | 'activeTabText' | 'chipLabel' | 'chipDesc'
  >
>({
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: ({ colors }) => colors.onSurface,
    borderTopLeftRadius: StaticTheme.borderRadius.s,
    borderTopRightRadius: StaticTheme.borderRadius.s,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: StaticTheme.spacing.sm,
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
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: ({ colors }) => colors.onSurface,
    borderBottomLeftRadius: StaticTheme.borderRadius.s,
    borderBottomRightRadius: StaticTheme.borderRadius.s,
    position: 'relative',
  },
  contentAreaExpanded: {
    height: 180,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: StaticTheme.spacing.sm,
  },
  chip: {
    borderBottomWidth: 1,
    borderColor: ({ colors }) => colors.outlineVariant,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StaticTheme.spacing.sm * 1.5,
    paddingHorizontal: StaticTheme.spacing.sm,
    paddingVertical: StaticTheme.spacing.xs * 1.5,
  },
  chipLabel: {
    fontSize: ({ fonts }) => fonts.bodySmall.fontSize,
    fontWeight: ({ fonts }) => fonts.bodySmall.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodySmall.lineHeight,
    color: ({ colors }) => colors.primary,
  },
  chipDesc: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.onSurface,
    flex: 1,
  },
  loadMoreButton: {
    alignSelf: 'center',
    marginTop: StaticTheme.spacing.sm,
  },
  addNoteButton: {
    position: 'absolute',
    bottom: StaticTheme.spacing.sm,
    right: StaticTheme.spacing.sm,
  },
});

export default SharedSection;
