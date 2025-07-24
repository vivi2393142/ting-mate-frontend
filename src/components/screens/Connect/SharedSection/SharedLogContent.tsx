import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { useGetActivityLogs } from '@/api/activityLog';
import { LOG_DATE_FORMAT, LOG_TIME_FORMAT } from '@/constants';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import { useLogTranslation } from '@/hooks/useLogTranslation';
import { StaticTheme } from '@/theme';
import type { ActivityLogListResponse, ActivityLogResponse } from '@/types/connect';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import Skeleton from '@/components/atoms/Skeleton';
import ThemedText from '@/components/atoms/ThemedText';
import ChipItem from '@/components/screens/Connect/SharedSection/ChipItem';
import SharedContent from '@/components/screens/Connect/SharedSection/SharedContent';

const MIN_ITEM_COUNT = 5;
const MAX_LOG_COUNT = 50;
const LOG_CTN_PER_PAGE = 10;

const SharedLogContent = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const router = useRouter();

  const { t } = useTranslation('connect');
  const formatLogText = useLogTranslation();

  const [logFetchedCtn, setLogFetchedCtn] = useState(LOG_CTN_PER_PAGE);
  const [lastLogUpdate, setLastLogUpdate] = useState<Date | null>(null);
  const [prevLogData, setPrevLogData] = useState<ActivityLogListResponse>();

  const {
    data: activityLogsData,
    isLoading: isLoadingLogs,
    isFetching: isFetchingLogs,
    refetch: refetchLogs,
  } = useGetActivityLogs(
    { limit: logFetchedCtn },
    {
      placeholderData: prevLogData,
    },
  );
  const hasMoreLogs = !!(activityLogsData?.total && logFetchedCtn < activityLogsData.total);
  const isReachedLogLimit = logFetchedCtn >= MAX_LOG_COUNT && hasMoreLogs;

  useEffect(() => {
    if (activityLogsData) {
      setLastLogUpdate(new Date());
      setPrevLogData(activityLogsData);
    }
  }, [activityLogsData]);

  const handleRefreshLogs = useCallback(() => {
    refetchLogs();
  }, [refetchLogs]);

  const handleLogPress = useCallback(
    (log: ActivityLogResponse) => {
      router.push({
        pathname: ROUTES.LOG_DETAIL,
        params: {
          from: ROUTES.CONNECT,
          id: log.id,
          user: `${log.user.name || '---'} (${log.user.email || '---'})`,
          date: dayjs(log.timestamp).format(LOG_DATE_FORMAT),
          time: dayjs(log.timestamp).format(LOG_TIME_FORMAT),
          content: formatLogText(log, 'description'),
        },
      });
    },
    [formatLogText, router],
  );

  const handleLoadMoreLogs = useCallback(() => {
    setLogFetchedCtn((prev) => prev + LOG_CTN_PER_PAGE);
  }, []);

  return (
    <SharedContent
      title={t('Shared Logs')}
      hasMoreItems={hasMoreLogs && !isReachedLogLimit}
      onLoadMore={handleLoadMoreLogs}
      isLoading={isFetchingLogs}
      lastUpdated={lastLogUpdate}
      isFetching={isFetchingLogs}
      onRefresh={handleRefreshLogs}
    >
      {isLoadingLogs && (
        <View style={styles.loadingContainer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} width={'100%'} height={28} variant="rectangular" />
          ))}
        </View>
      )}
      {!isLoadingLogs &&
        activityLogsData?.logs?.map((log, idx) =>
          idx < MIN_ITEM_COUNT ? (
            <ChipItem
              key={log.id}
              size="small"
              label={dayjs(log.timestamp).format(LOG_TIME_FORMAT)}
              description={formatLogText(log, 'summary')}
              onPress={() => handleLogPress(log)}
            />
          ) : null,
        )}
      {!isLoadingLogs && !isFetchingLogs && !activityLogsData?.logs?.length && (
        <ThemedText color="onSurfaceVariant" style={styles.contentNoteText}>
          {t('No Log Found')}
        </ThemedText>
      )}
      {!isLoadingLogs && !isFetchingLogs && isReachedLogLimit && (
        <ThemedText color="outline" style={[styles.contentNoteText, styles.limitNoteText]}>
          {t('Only the latest {{count}} records are shown.', { count: MAX_LOG_COUNT })}
        </ThemedText>
      )}
    </SharedContent>
  );
};

const getStyles = createStyles<
  StyleRecord<'loadingContainer', 'contentNoteText' | 'limitNoteText'>
>({
  contentNoteText: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
  limitNoteText: {
    marginTop: StaticTheme.spacing.xs,
  },
  loadingContainer: {
    gap: StaticTheme.spacing.xs,
  },
});

export default SharedLogContent;
