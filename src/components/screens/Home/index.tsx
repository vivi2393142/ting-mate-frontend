import { default as dayjs } from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, List, Text } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { UserTextSize } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconSymbol from '@/components/atoms/IconSymbol';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedCheckbox from '@/components/atoms/ThemedCheckbox';
import ThemedView from '@/components/atoms/ThemedView';

enum TaskType {
  DONE = 'DONE',
  NOT_DONE = 'NOT_DONE',
  MISSED = 'MISSED',
}

// TODO: retrieve data from backend
const mockData = [
  {
    id: '1',
    icon: '💊',
    title: 'Take medication',
    time: {
      hour: 8,
      minute: 15,
    },
    status: TaskType.DONE,
  },
  {
    id: '2',
    icon: '🐱',
    title: 'Feed cat',
    time: {
      hour: 9,
      minute: 0,
    },
    status: TaskType.MISSED,
  },
  {
    id: '3',
    icon: '🍔',
    title: 'Lunch',
    time: {
      hour: 12,
      minute: 30,
    },
    status: TaskType.NOT_DONE,
  },
  {
    id: '4',
    icon: '💊',
    title: 'Take medication',
    time: {
      hour: 13,
      minute: 30,
    },
    status: TaskType.NOT_DONE,
  },
  {
    id: '5',
    icon: '🏃',
    title: 'Exercise',
    time: {
      hour: 16,
      minute: 0,
    },
    status: TaskType.NOT_DONE,
  },
];

const HomeScreen = () => {
  const { t } = useTranslation('home');
  const userTextSize = useUserTextSize();

  const theme = useAppTheme();
  const styleParams = useMemo(() => ({ userTextSize: userTextSize }), [userTextSize]);
  const styles = getStyles(theme, styleParams);

  return (
    <ScreenContainer style={styles.container}>
      <Text variant="headlineSmall" style={styles.headline}>
        {t('Todays Tasks')}
      </Text>
      <List.Section style={styles.listSection}>
        {mockData.map(({ id, title, icon, time, status }) => (
          <List.Item
            key={id}
            title={title}
            left={() => <Text style={styles.listIcon}>{icon}</Text>}
            right={() => (
              <ThemedView style={styles.rightContainer}>
                <Text style={styles.timeText} variant="titleSmall">
                  {dayjs().hour(time.hour).minute(time.minute).format('HH:mm')}
                </Text>
                <ThemedCheckbox status={status === TaskType.DONE ? 'checked' : 'unchecked'} />
              </ThemedView>
            )}
            style={[
              styles.listItem,
              status === TaskType.DONE ? styles.listItemDone : undefined,
              status === TaskType.MISSED ? styles.listItemMissed : undefined,
            ]}
            titleStyle={styles.listItemTitle}
            onPress={() => {
              // TODO: handle onPress
            }}
          />
        ))}
      </List.Section>
      <Button
        mode="contained"
        onPress={() => {
          // TODO: handle Add Task
        }}
        icon={({ color }) => <IconSymbol name="plus" color={color} size={16} />}
        style={styles.addButton}
        labelStyle={styles.addButtonLabel}
      >
        {t('Add Task')}
      </Button>
    </ScreenContainer>
  );
};

export default HomeScreen;

interface StyleParams {
  userTextSize: UserTextSize;
}

const getStyles = createStyles<
  StyleRecord<
    | 'container'
    | 'listSection'
    | 'listItem'
    | 'listItemDone'
    | 'listItemMissed'
    | 'rightContainer'
    | 'addButton',
    'headline' | 'listItemTitle' | 'timeText' | 'addButtonLabel' | 'listIcon'
  >,
  StyleParams
>({
  container: {
    gap: StaticTheme.spacing.xs,
  },
  headline: {
    paddingVertical: StaticTheme.spacing.xs,
  },
  listSection: {
    gap: StaticTheme.spacing.md,
    marginVertical: StaticTheme.spacing.sm,
  },
  listItem: {
    borderWidth: 1,
    paddingVertical: StaticTheme.spacing.xs,
    paddingLeft: StaticTheme.spacing.sm * 1.5,
    paddingRight: StaticTheme.spacing.sm * 1.5,
    borderRadius: StaticTheme.borderRadius.s,
    borderColor: ({ colors }) => colors.onSurface,
  },
  listItemDone: {
    opacity: 0.3,
    borderColor: ({ colors }) => colors.primary,
  },
  listItemMissed: {
    backgroundColor: ({ colors }) => colorWithAlpha(colors.errorContainer, 0.5),
    borderColor: ({ colors }) => colors.onErrorContainer,
  },
  listItemTitle: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
  },
  listIcon: {
    margin: 'auto',
    paddingHorizontal: StaticTheme.spacing.xs * 1.5,
    padding: StaticTheme.spacing.xs * 1.5,
    borderRadius: StaticTheme.borderRadius.round,
    backgroundColor: ({ colors }) => colors.background,
  },
  rightContainer: {
    flexDirection: 'row',
    gap: (_, { userTextSize }) =>
      userTextSize === UserTextSize.LARGE ? StaticTheme.spacing.lg : StaticTheme.spacing.sm,
    backgroundColor: 'transparent',
  },
  timeText: {
    margin: 'auto',
  },
  addButton: {
    borderRadius: StaticTheme.borderRadius.s,
  },
  addButtonLabel: {
    fontSize: ({ fonts }) => fonts.titleMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.titleMedium.fontWeight,
    marginVertical: StaticTheme.spacing.md,
  },
});
