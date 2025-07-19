import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { Badge } from 'react-native-paper';

import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import { useNotificationStore } from '@/store/notificationStore';

import ThemedIconButton from '@/components/atoms/ThemedIconButton';

const NotificationCenterButton = ({ style }: { style?: StyleProp<ViewStyle> }) => {
  const theme = useAppTheme();
  const router = useRouter();

  const notifications = useNotificationStore((s) => s.notifications);

  const hasUnread = useMemo(
    () => notifications?.some((notification) => !notification.isRead),
    [notifications],
  );

  const handlePress = () => {
    router.push(ROUTES.NOTIFICATIONS);
  };

  return (
    <View style={[styles.root, style]}>
      <ThemedIconButton
        name="bell"
        size="medium"
        color={theme.colors.outline}
        onPress={handlePress}
      />
      <Badge visible={hasUnread} size={8} style={styles.badge} />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { position: 'absolute', right: 1, top: 1 },
  root: {
    position: 'relative',
  },
});

export default NotificationCenterButton;
