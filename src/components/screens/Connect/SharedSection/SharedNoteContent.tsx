import { useRouter } from 'expo-router';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { useGetSharedNotes } from '@/api/sharedNote';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import type { SharedNote } from '@/types/connect';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { keepPreviousData } from '@tanstack/react-query';

import Skeleton from '@/components/atoms/Skeleton';
import ThemedIconButton from '@/components/atoms/ThemedIconButton';
import ThemedText from '@/components/atoms/ThemedText';
import ChipItem from '@/components/screens/Connect/SharedSection/ChipItem';
import SharedTabContent from '@/components/screens/Connect/SharedSection/SharedTabContent';

const MIN_ITEM_COUNT = 3;

const SharedNoteContent = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const router = useRouter();

  const { t } = useTranslation('connect');

  const [lastNoteUpdate, setLastNoteUpdate] = useState<Date | null>(null);

  const {
    data: sharedNotesData,
    isLoading: isLoadingNotes,
    isFetching: isFetchingNotes,
    refetch: refetchNotes,
  } = useGetSharedNotes({
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (sharedNotesData) setLastNoteUpdate(new Date());
  }, [sharedNotesData]);

  const handleRefreshNotes = useCallback(() => {
    refetchNotes();
  }, [refetchNotes]);

  const handleNotePress = useCallback(
    (note: SharedNote) => {
      router.push({
        pathname: ROUTES.NOTE_EDIT,
        params: {
          id: note.id,
          from: ROUTES.CONNECT,
        },
      });
    },
    [router],
  );

  const handleAddNote = useCallback(() => {
    router.push({
      pathname: ROUTES.NOTE_EDIT,
      params: { from: ROUTES.CONNECT },
    });
  }, [router]);

  return (
    <SharedTabContent
      isExpanded={true}
      isLoading={isFetchingNotes}
      lastUpdated={lastNoteUpdate}
      isFetching={isFetchingNotes}
      onRefresh={handleRefreshNotes}
      contentAreaNode={
        sharedNotesData?.notes?.length !== 0 ? (
          <ThemedIconButton
            name="plus.circle.fill"
            size="large"
            onPress={handleAddNote}
            style={styles.addNoteButton}
          />
        ) : null
      }
    >
      <Fragment>
        {isLoadingNotes && (
          <View style={styles.loadingContainer}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} width={'100%'} height={28} variant="rectangular" />
            ))}
          </View>
        )}
        {!isLoadingNotes &&
          sharedNotesData?.notes?.map((note, idx) =>
            idx < MIN_ITEM_COUNT ? (
              <ChipItem
                key={note.id}
                label={note.title}
                description={note.content || ''}
                onPress={() => handleNotePress(note)}
              />
            ) : null,
          )}
        {!isLoadingNotes && !sharedNotesData?.notes?.length && (
          <View style={styles.contentNoteTextContainer}>
            <ThemedText color="onSurfaceVariant" style={styles.contentNoteText}>
              {t('No Note Found')}
            </ThemedText>
            <ThemedIconButton name="plus.circle.fill" size="large" onPress={handleAddNote} />
          </View>
        )}
      </Fragment>
    </SharedTabContent>
  );
};

const getStyles = createStyles<
  StyleRecord<'addNoteButton' | 'loadingContainer' | 'contentNoteTextContainer', 'contentNoteText'>
>({
  contentNoteTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: StaticTheme.spacing.xs,
  },
  contentNoteText: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
  addNoteButton: {
    position: 'absolute',
    bottom: StaticTheme.spacing.sm,
    right: StaticTheme.spacing.sm,
  },
  loadingContainer: {
    gap: StaticTheme.spacing.xs,
  },
});

export default SharedNoteContent;
