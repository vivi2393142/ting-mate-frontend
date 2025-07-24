import { type ReactNode } from 'react';

import { ScrollView, View } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import ThemedText from '@/components/atoms/ThemedText';

interface ContentContainerProps {
  children: ReactNode;
  hasMoreItems?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

const ContentContainer = ({
  children,
  hasMoreItems,
  onLoadMore,
  isLoading,
}: ContentContainerProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    >
      <View>
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
};

interface RefreshRowProps {
  lastUpdated: Date | null;
  isFetching: boolean;
  onRefresh: () => void;
}

interface SharedContentProps extends ContentContainerProps, RefreshRowProps {
  title: string;
  titleRightNode?: ReactNode;
  contentAreaNode?: ReactNode;
}

const SharedContent = ({
  title,
  titleRightNode,
  hasMoreItems,
  isLoading,
  isFetching,
  onRefresh,
  onLoadMore,
  children,
  contentAreaNode,
}: SharedContentProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View>
      <View style={styles.titleContainer}>
        <ThemedText variant="titleMedium">{title}</ThemedText>
        <ThemedIconButton
          name={isFetching ? 'arrow.clockwise.circle' : 'arrow.clockwise'}
          onPress={onRefresh}
          size={'tiny'}
          color={theme.colors.onSurfaceVariant}
          loading={isFetching}
          disabled={isFetching}
          style={styles.refreshButton}
        />
        {titleRightNode}
      </View>
      <View style={styles.contentArea}>
        <ContentContainer hasMoreItems={hasMoreItems} onLoadMore={onLoadMore} isLoading={isLoading}>
          {children}
        </ContentContainer>
        {contentAreaNode}
      </View>
      {/* Last updated & refresh */}
      {/* <View style={styles.updateWrapper}>
        <ThemedText variant="bodyMedium" color="onSurfaceVariant">
          {t('Last updated:')}{' '}
          {lastUpdated ? dayjs(lastUpdated).format(LAST_UPDATE_DATETIME_FORMAT) : '--'}
        </ThemedText>
        <ThemedIconButton
          name={isFetching ? 'arrow.clockwise.circle' : 'arrow.clockwise'}
          onPress={onRefresh}
          size={'tiny'}
          color={theme.colors.onSurfaceVariant}
          loading={isFetching}
          disabled={isFetching}
        />
      </View> */}
    </View>
  );
};

const getStyles = createStyles<
  StyleRecord<
    | 'titleContainer'
    | 'refreshButton'
    | 'contentArea'
    | 'scrollContainer'
    | 'loadMoreButton'
    | 'updateWrapper'
  >
>({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: StaticTheme.spacing.xs,
  },
  refreshButton: {
    marginLeft: StaticTheme.spacing.xs,
    marginRight: 'auto',
  },
  contentArea: {
    flex: 1,
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
  },
  loadMoreButton: {
    alignSelf: 'center',
    marginTop: StaticTheme.spacing.sm,
  },
  updateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: StaticTheme.spacing.md,
  },
});

export default SharedContent;
