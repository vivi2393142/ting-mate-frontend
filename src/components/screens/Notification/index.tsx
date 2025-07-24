import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Fragment, useCallback, useEffect, useMemo } from 'react';

import { Stack } from 'expo-router';
import { View } from 'react-native';

import { useMarkNotificationRead } from '@/api/notification';
import IconSymbol, { IconName } from '@/components/atoms/IconSymbol';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useStackScreenOptionsHelper from '@/hooks/useStackScreenOptionsHelper';
import { useNotificationStore } from '@/store/notificationStore';
import { StaticTheme } from '@/theme';
import { NotificationCategory, NotificationLevel } from '@/types/notification';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { useTranslation } from 'react-i18next';
import { TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import ThemedText from '@/components/atoms/ThemedText';
import colorWithAlpha from '@/utils/colorWithAlpha';

dayjs.extend(relativeTime);

const categoryIconMap: Record<NotificationCategory, IconName> = {
  [NotificationCategory.TASK]: 'checklist',
  [NotificationCategory.LINKING_ACCOUNT]: 'gearshape.fill',
  [NotificationCategory.SAFEZONE]: 'location',
  [NotificationCategory.SYSTEM]: 'bell',
};

const NotificationScreen = () => {
  const getStackScreenOptions = useStackScreenOptionsHelper();
  const { t } = useTranslation('home');

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const insets = useSafeAreaInsets();

  // Get synced notifications and pagination state from store
  const { notifications, isLoading, total, loadMore } = useNotificationStore();
  const hasMore = total > notifications.length;

  const markAsReadMutation = useMarkNotificationRead();

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const handleMarkAsRead = (id: string, isRead: boolean) => () => {
    if (!isRead) markAsReadMutation.mutate([id]);
  };

  const levelColorMap: Record<NotificationLevel, string> = useMemo(
    () => ({
      [NotificationLevel.GENERAL]: theme.colors.primary,
      [NotificationLevel.WARNING]: theme.colors.tertiary,
      [NotificationLevel.ERROR]: theme.colors.error,
    }),
    [theme],
  );

  useEffect(() => {
    return () => {
      // Mark all as read when screen unmounts
      const currentStore = useNotificationStore.getState();
      const unreadIds = currentStore.notifications.filter((n) => !n.isRead).map((n) => n.id);
      if (unreadIds.length > 0) markAsReadMutation.mutate(unreadIds);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      <Stack.Screen options={getStackScreenOptions({ title: ROUTES.NOTIFICATIONS })} />
      <ScreenContainer scrollable isRoot={false}>
        <View style={{ paddingBottom: insets.bottom }}>
          {notifications.map(({ id, level, message, createdAt, category, isRead }) => (
            <TouchableRipple
              key={id}
              style={[styles.listItem, !isRead && styles.listItemUnread]}
              onPress={handleMarkAsRead(id, isRead)}
            >
              <Fragment>
                <IconSymbol
                  name={categoryIconMap[category]}
                  color={levelColorMap[level]}
                  size={StaticTheme.iconSize.m}
                />
                <View style={styles.listContent}>
                  <ThemedText numberOfLines={2}>{message}</ThemedText>
                  <ThemedText variant="bodyMedium" color="outline">
                    {dayjs(createdAt).fromNow()}
                  </ThemedText>
                </View>
              </Fragment>
            </TouchableRipple>
          ))}
          {notifications.length === 0 && !isLoading && (
            <ThemedText style={styles.empty}>{t('No notifications')}</ThemedText>
          )}
          {hasMore && (
            <ThemedIconButton
              name="arrow.down.circle"
              size="medium"
              onPress={handleLoadMore}
              style={styles.loadMore}
              disabled={isLoading}
            />
          )}
        </View>
      </ScreenContainer>
    </Fragment>
  );
};

export default NotificationScreen;

const getStyles = createStyles<
  StyleRecord<'listItem' | 'listItemUnread' | 'listContent' | 'loadMore' | 'empty', 'empty'>
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
  listItemUnread: {
    backgroundColor: ({ colors }) => colorWithAlpha(colors.primary, 0.1),
  },
  listContent: {
    gap: StaticTheme.spacing.xs,
    flex: 1,
  },
  empty: {
    textAlign: 'center',
  },
  loadMore: { alignSelf: 'center', marginVertical: StaticTheme.spacing.md },
});
