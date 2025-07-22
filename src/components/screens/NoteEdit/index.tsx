import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Alert, Button, View } from 'react-native';
import { TextInput } from 'react-native-paper';

import {
  useCreateSharedNote,
  useDeleteSharedNote,
  useGetSharedNote,
  useUpdateSharedNote,
} from '@/api/sharedNote';
import Skeleton from '@/components/atoms/Skeleton';
import useAppTheme from '@/hooks/useAppTheme';
import useStackScreenOptionsHelper from '@/hooks/useStackScreenOptionsHelper';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedButton from '@/components/atoms/ThemedButton';

const NoteEditScreen = () => {
  const { t } = useTranslation('connect');
  const { t: tCommon } = useTranslation('common');
  const getStackScreenOptions = useStackScreenOptionsHelper();

  const router = useRouter();

  const insets = useSafeAreaInsets();

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const params = useLocalSearchParams();
  const { id } = params;
  const noteId = typeof id === 'string' ? id : undefined;

  const isEditMode = !!noteId;
  const { data: editingNote, isLoading: isLoadingNote } = useGetSharedNote(noteId || '', {
    enabled: isEditMode,
  });

  const [isInit, setIsInit] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isInit) return;

    if (isEditMode && editingNote) {
      setTitle(editingNote.title || '');
      setContent(editingNote.content || '');
      setIsInit(true);
    }
    if (!isEditMode) {
      setIsInit(true);
    }
  }, [isEditMode, editingNote, isInit]);

  const createNoteMutation = useCreateSharedNote();
  const updateNoteMutation = useUpdateSharedNote();
  const deleteNoteMutation = useDeleteSharedNote();

  const isSaving = createNoteMutation.isPending || updateNoteMutation.isPending;
  const isDeleting = deleteNoteMutation.isPending;

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      Alert.alert(t('Please enter a title.'));
      return;
    }

    if (isEditMode) {
      updateNoteMutation.mutate(
        { noteId, data: { title, content } },
        {
          onSuccess: () => router.back(),
          onError: () => Alert.alert(t('Failed to update note. Please try again.')),
        },
      );
    } else {
      createNoteMutation.mutate(
        { title, content },
        {
          onSuccess: () => router.back(),
          onError: () => Alert.alert(t('Failed to create note. Please try again.')),
        },
      );
    }
  }, [title, isEditMode, t, updateNoteMutation, noteId, content, createNoteMutation, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleDeleteNote = useCallback(() => {
    if (!noteId) return;
    Alert.alert(t('Delete Note'), t('Are you sure you want to delete this note?'), [
      { text: tCommon('Cancel'), style: 'cancel' },
      {
        text: tCommon('Delete'),
        style: 'destructive',
        onPress: () => {
          deleteNoteMutation.mutate(noteId, {
            onSuccess: () => router.back(),
            onError: () => Alert.alert(t('Failed to delete note. Please try again.')),
          });
        },
      },
    ]);
  }, [noteId, t, tCommon, deleteNoteMutation, router]);

  return (
    <Fragment>
      <Stack.Screen
        options={{
          ...getStackScreenOptions({}),
          title: isEditMode ? t('Edit Note') : t('Add Note'),
          headerLeft: () => (
            <Button
              color={theme.colors.primary}
              onPress={handleCancel}
              title={tCommon('Cancel')}
              disabled={isSaving || isDeleting}
            />
          ),
          headerRight: () => (
            <Button
              color={theme.colors.primary}
              onPress={handleSave}
              title={isEditMode ? tCommon('Save') : tCommon('Done')}
              disabled={isSaving || isDeleting}
            />
          ),
        }}
      />
      <ScreenContainer isRoot={false} style={styles.container}>
        {isEditMode && isLoadingNote ? (
          <View style={styles.skeletonContainer}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} width={'100%'} height={40} />
            ))}
          </View>
        ) : (
          <Fragment>
            <FormInput
              label={t('Title')}
              icon="text.justify.leading"
              placeholder={t('Enter note title')}
              value={title}
              valueColor={theme.colors.onSurfaceVariant}
              onChangeValue={setTitle}
              disabled={isSaving || isDeleting}
            />
            <View style={styles.contentInputWrapper}>
              <FormInput
                label={t('Content')}
                icon="note.text"
                value={''}
                readOnly
                divider={false}
              />
              <TextInput
                dense
                multiline
                value={content}
                placeholder={t('Enter note content')}
                onChangeText={setContent}
                mode="outlined"
                outlineColor="transparent"
                activeOutlineColor="transparent"
                textColor={theme.colors.onSurfaceVariant}
                selectionColor={theme.colors.primary}
                placeholderTextColor={theme.colors.outline}
                contentStyle={styles.noteContent}
                style={styles.textInput}
                editable={!isSaving && !isDeleting}
              />
            </View>
            {isEditMode && (
              <ThemedButton
                mode="outlined"
                onPress={handleDeleteNote}
                color="error"
                icon="trash"
                style={[styles.deleteButton, { marginBottom: insets.bottom }]}
                disabled={isSaving || isDeleting}
              >
                {t('Delete Note')}
              </ThemedButton>
            )}
          </Fragment>
        )}
      </ScreenContainer>
    </Fragment>
  );
};

const getStyles = createStyles<
  StyleRecord<
    'container' | 'contentInputWrapper' | 'deleteButton' | 'skeletonContainer',
    'noteContent' | 'textInput'
  >
>({
  container: {
    flex: 1,
  },
  contentInputWrapper: {
    flex: 1,
    borderBottomWidth: 1 / 3,
    borderBottomColor: ({ colors }) => colors.outlineVariant,
    paddingBottom: StaticTheme.spacing.md,
  },
  deleteButton: {
    marginTop: StaticTheme.spacing.md,
  },
  noteContent: {
    paddingHorizontal: StaticTheme.spacing.sm,
    paddingVertical: StaticTheme.spacing.sm,
    flex: 1,
    borderWidth: 1 / 3,
    borderColor: ({ colors }) => colors.outlineVariant,
    borderRadius: StaticTheme.borderRadius.s,
  },
  textInput: {
    flex: 1,
  },
  skeletonContainer: {
    gap: StaticTheme.spacing.sm,
  },
});

export default NoteEditScreen;
