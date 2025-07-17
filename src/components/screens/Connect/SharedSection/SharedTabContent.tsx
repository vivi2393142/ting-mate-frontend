import dayjs from 'dayjs';
import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ScrollView, Text, View } from 'react-native';

import { LAST_UPDATE_DATETIME_FORMAT } from '@/constants';
import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedIconButton from '@/components/atoms/ThemedIconButton';

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
        <Text style={styles.updateText}>
          {t('Last updated:')}{' '}
          {lastUpdated ? dayjs(lastUpdated).format(LAST_UPDATE_DATETIME_FORMAT) : '--'}
        </Text>
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
    | 'contentNoteTextContainer'
    | 'updateWrapper',
    'contentNoteText' | 'limitNoteText' | 'loadingText' | 'updateText'
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
  contentNoteTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: StaticTheme.spacing.xs,
  },
  contentNoteText: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  limitNoteText: {
    color: ({ colors }) => colors.outline,
    marginTop: StaticTheme.spacing.xs,
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
  loadingText: {
    textAlign: 'center' as const,
    paddingVertical: StaticTheme.spacing.md,
    color: ({ colors }) => colors.onSurfaceVariant,
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
  },
  updateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: StaticTheme.spacing.xs * 1.5,
  },
  updateText: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.onSurfaceVariant,
  },
});

export default SharedTabContent;
