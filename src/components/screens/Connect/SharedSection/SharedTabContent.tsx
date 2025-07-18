import dayjs from 'dayjs';
import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ScrollView, View } from 'react-native';

import { LAST_UPDATE_DATETIME_FORMAT } from '@/constants';
import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import ThemedText from '@/components/atoms/ThemedText';

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

  if (!isExpanded) return <View style={styles.content}>{children}</View>;

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
};

interface RefreshRowProps {
  lastUpdated: Date | null;
  isFetching: boolean;
  onRefresh: () => void;
}

interface SharedTabContentProps extends ContentContainerProps, RefreshRowProps {
  contentAreaNode?: ReactNode;
}

const SharedTabContent = ({
  isExpanded,
  hasMoreItems,
  lastUpdated,
  isLoading,
  isFetching,
  onRefresh,
  onLoadMore,
  children,
  contentAreaNode,
}: SharedTabContentProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const { t } = useTranslation('connect');

  return (
    <Fragment>
      <View style={[styles.contentArea, isExpanded && styles.contentAreaExpanded]}>
        <ContentContainer
          isExpanded={isExpanded}
          hasMoreItems={hasMoreItems}
          onLoadMore={onLoadMore}
          isLoading={isLoading}
        >
          {children}
        </ContentContainer>
        {contentAreaNode}
      </View>
      {/* Last updated & refresh */}
      <View style={styles.updateWrapper}>
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
      </View>
    </Fragment>
  );
};

const getStyles = createStyles<
  StyleRecord<
    | 'contentArea'
    | 'contentAreaExpanded'
    | 'scrollContainer'
    | 'content'
    | 'loadMoreButton'
    | 'updateWrapper'
  >
>({
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
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: StaticTheme.spacing.sm,
  },
  loadMoreButton: {
    alignSelf: 'center',
    marginTop: StaticTheme.spacing.sm,
  },
  updateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: StaticTheme.spacing.xs * 1.5,
  },
});

export default SharedTabContent;
