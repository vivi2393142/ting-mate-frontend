import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import IconSymbol, { IconName } from '@/components/atoms/IconSymbol';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useStackScreenOptionsHelper from '@/hooks/useStackScreenOptionsHelper';
import { StaticTheme } from '@/theme';
import { Notification, NotificationCategory, NotificationLevel } from '@/types/notification';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';

dayjs.extend(relativeTime);

const NOTIFICATION_CTN_PER_PAGE = 10;

const categoryIconMap: Record<NotificationCategory, IconName> = {
  [NotificationCategory.TASK]: 'checklist',
  [NotificationCategory.USER_SETTING]: 'gearshape.fill',
  [NotificationCategory.SAFEZONE]: 'location',
  [NotificationCategory.SYSTEM]: 'bell',
};

const mockNotifications: Notification[] = Array.from({ length: 16 }).map((_, i) => ({
  id: `notification-${i + 1}`,
  userId: 'user-1',
  category: NotificationCategory.SYSTEM,
  message: `This is notification message #${i + 1}`,
  level: i % 2 === 0 ? NotificationLevel.ERROR : NotificationLevel.GENERAL,
  isRead: false,
  createdAt: dayjs()
    .subtract(i * 30, 'minutes')
    .toISOString(),
  payload: {
    notificationId: i + 1,
    timestamp: Date.now(),
  },
}));

const NotificationScreen = () => {
  const getStackScreenOptions = useStackScreenOptionsHelper();
  const { t } = useTranslation('home');

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const insets = useSafeAreaInsets();

  const [notificationFetchedCtn, setNotificationFetchedCtn] = useState(NOTIFICATION_CTN_PER_PAGE);

  const hasMoreItems = mockNotifications.length > notificationFetchedCtn;

  const handleMarkAllAsRead = useCallback(() => {
    // TODO: call mark read API
  }, []);

  const handleLoadMore = useCallback(() => {
    setNotificationFetchedCtn((prev) => prev + NOTIFICATION_CTN_PER_PAGE);
  }, []);

  const notifications = mockNotifications.slice(0, notificationFetchedCtn);

  useEffect(() => {
    handleMarkAllAsRead();
  }, [handleMarkAllAsRead]);

  const levelColorMap: Record<NotificationLevel, string> = useMemo(
    () => ({
      [NotificationLevel.GENERAL]: theme.colors.primary,
      [NotificationLevel.WARNING]: theme.colors.tertiary,
      [NotificationLevel.ERROR]: theme.colors.error,
    }),
    [theme],
  );
  return (
    <Fragment>
      <Stack.Screen options={getStackScreenOptions({ title: ROUTES.NOTIFICATIONS })} />
      <ScreenContainer scrollable isRoot={false}>
        <View style={{ paddingBottom: insets.bottom }}>
          {notifications.map(({ id, level, message, createdAt, category }) => (
            <View key={id} style={styles.listItem}>
              <IconSymbol
                name={categoryIconMap[category]}
                color={levelColorMap[level]}
                size={StaticTheme.iconSize.m}
              />
              <View style={styles.listContent}>
                <Text style={styles.message} numberOfLines={2}>
                  {message}
                </Text>
                <Text style={styles.time}>{dayjs(createdAt).fromNow()}</Text>
              </View>
            </View>
          ))}
          {/* TODO: base on API response */}
          {notifications.length === 0 && <Text style={styles.empty}>{t('No notifications')}</Text>}
          {hasMoreItems && (
            <ThemedIconButton
              name="arrow.down.circle"
              size="medium"
              onPress={handleLoadMore}
              style={styles.loadMore}
            />
          )}
        </View>
      </ScreenContainer>
    </Fragment>
  );
};

export default NotificationScreen;

const getStyles = createStyles<
  StyleRecord<'listItem' | 'listContent' | 'loadMore', 'message' | 'time' | 'empty'>
>({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: StaticTheme.spacing.sm,
    gap: StaticTheme.spacing.md,
    paddingVertical: StaticTheme.spacing.sm,
    borderBottomWidth: 1 / 3,
    borderColor: ({ colors }) => colors.outline,
  },
  listContent: {
    gap: StaticTheme.spacing.xs,
    flex: 1,
  },
  message: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
    color: ({ colors }) => colors.onSurface,
  },
  time: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.outline,
  },
  empty: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
    color: ({ colors }) => colors.onSurface,
    textAlign: 'center',
  },
  loadMore: { alignSelf: 'center', marginVertical: StaticTheme.spacing.md },
});
