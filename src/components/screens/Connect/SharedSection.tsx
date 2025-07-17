import dayjs from 'dayjs';
import { router } from 'expo-router';
import { Fragment, useCallback, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ScrollView, Text, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import { useInfiniteActivityLogs } from '@/api/activityLog';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import { useLogTranslation } from '@/hooks/useLogTranslation';
import { StaticTheme } from '@/theme';
import { Action, type ActivityLogFilter, type ActivityLogResponse } from '@/types/connect';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import Skeleton from '@/components/atoms/Skeleton';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import SectionContainer from '@/components/screens/Connect/SectionContainer';

const MIN_ITEM_COUNT = 3;
const LOGS_PER_PAGE = 10;

enum TabType {
  LOG = 'LOG',
  NOTE = 'NOTE',
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
  isLoading?: boolean;
}

const ContentContainer = ({
  isExpanded,
  children,
  hasMoreItems,
  onLoadMore,
  isLoading,
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
              loading={isLoading}
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

const logActionsFilter: ActivityLogFilter['actions'] = [
  Action.CREATE_TASK,
  Action.UPDATE_TASK,
  Action.UPDATE_TASK_STATUS,
  Action.DELETE_TASK,
  Action.CREATE_SHARED_NOTE,
  Action.UPDATE_SHARED_NOTE,
  Action.DELETE_SHARED_NOTE,
  Action.ADD_USER_LINK,
  Action.REMOVE_USER_LINK,
];

// TODO: change to real data
const mockNoteCount = 5;
const mockNotes: NoteEntry[] = [
  { id: 1, name: 'Note 1', text: 'Keep tea on lower shelf for easy access and easy access' },
  { id: 2, name: 'Note 2', text: 'Doctor visit this Saturday at 10 AM' },
  { id: 3, name: 'Note 3', text: 'Remember to refill prescription' },
  { id: 4, name: 'Note 4', text: 'Call pharmacy about delivery' },
  { id: 5, name: 'Note 5', text: 'Schedule follow-up appointment' },
];

const SharedSection = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const { t } = useTranslation('connect');
  const formatLogText = useLogTranslation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.LOG);

  const filter: ActivityLogFilter = useMemo(
    () => ({
      actions: logActionsFilter,
      limit: LOGS_PER_PAGE,
    }),
    [],
  );
  const {
    data: activityLogsPages,
    isLoading: isLoadingLogs,
    isFetching: isFetchingLogs,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteActivityLogs(filter);

  const logs = useMemo(
    () => activityLogsPages?.pages.flatMap((page) => page.logs) || [],
    [activityLogsPages],
  );

  const visibleLogCtn = isExpanded ? logs.length : Math.min(MIN_ITEM_COUNT, logs.length);
  const visibleLogs = useMemo(() => logs.slice(0, visibleLogCtn), [logs, visibleLogCtn]);
  const hasMoreLogs = hasNextPage;

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleAddNote = useCallback(() => {
    router.push({
      pathname: ROUTES.NOTE_EDIT,
      params: { from: ROUTES.CONNECT },
    });
  }, []);

  const handleLogPress = useCallback(
    (log: ActivityLogResponse) => {
      router.push({
        pathname: ROUTES.LOG_DETAIL,
        params: {
          from: ROUTES.CONNECT,
          id: log.id,
          user: `${log.user.name || '---'} (${log.user.email || '---'})`,
          date: dayjs(log.timestamp).format('MMM D, YYYY'),
          time: dayjs(log.timestamp).format('h:mm A'),
          content: formatLogText(log, 'description'),
        },
      });
    },
    [formatLogText],
  );

  const handleNotePress = useCallback((note: NoteEntry) => {
    router.push({
      pathname: ROUTES.NOTE_EDIT,
      params: {
        id: note.id.toString(),
        from: ROUTES.CONNECT,
      },
    });
  }, []);

  const handleLoadMoreLogs = useCallback(() => {
    if (hasMoreLogs && !isFetchingLogs) fetchNextPage();
  }, [hasMoreLogs, isFetchingLogs, fetchNextPage]);

  const handleLoadMoreNotes = useCallback(() => {
    console.log('Fetch more notes');
  }, []);

  const visibleNoteCtn = isExpanded ? mockNoteCount : MIN_ITEM_COUNT;
  const visibleNotes = useMemo(() => mockNotes.slice(0, visibleNoteCtn), [visibleNoteCtn]);

  const hasMoreNotes = mockNoteCount < mockNotes.length;

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
    <SectionContainer
      title={t('Shared Information')}
      isExpanded={isExpanded}
      onToggle={handleToggleExpanded}
    >
      <View style={styles.root}>
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
              isLoading={isFetchingLogs}
            >
              {isLoadingLogs && (
                <View style={styles.loadingContainer}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} width={'100%'} height={28} variant="rectangular" />
                  ))}
                </View>
              )}
              {!isLoadingLogs &&
                visibleLogs.map((log) => (
                  <ChipItem
                    key={log.id}
                    label={dayjs(log.timestamp).format('h:mm A')}
                    description={formatLogText(log, 'summary')}
                    onPress={() => handleLogPress(log)}
                  />
                ))}
              {!isLoadingLogs && !visibleLogs.length && (
                <Text style={styles.contentNoteText}>{t('No Log Found')}</Text>
              )}
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
    </SectionContainer>
  );
};

const getStyles = createStyles<
  StyleRecord<
    | 'root'
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
    | 'addNoteButton'
    | 'loadingContainer',
    'tabText' | 'activeTabText' | 'contentNoteText' | 'chipLabel' | 'chipDesc' | 'loadingText'
  >
>({
  root: {
    gap: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: ({ colors }) => colors.outline,
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
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
  },
  activeTabText: {
    color: ({ colors }) => colors.onPrimary,
  },
  contentArea: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: ({ colors }) => colors.outline,
    borderBottomLeftRadius: StaticTheme.borderRadius.s,
    borderBottomRightRadius: StaticTheme.borderRadius.s,
    position: 'relative',
  },
  contentAreaExpanded: {
    height: 180,
  },
  contentNoteText: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
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
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
    color: ({ colors }) => colors.primary,
  },
  chipDesc: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
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
  loadingText: {
    textAlign: 'center' as const,
    paddingVertical: StaticTheme.spacing.md,
    color: ({ colors }) => colors.onSurfaceVariant,
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
  },
  loadingContainer: {
    gap: StaticTheme.spacing.xs,
  },
});

export default SharedSection;
