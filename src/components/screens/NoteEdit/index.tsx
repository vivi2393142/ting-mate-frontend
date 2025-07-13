import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Fragment, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, View } from 'react-native';
import { TextInput } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedButton from '@/components/atoms/ThemedButton';

const NoteEdit = () => {
  const { t } = useTranslation('connect');
  const { t: tCommon } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const params = useLocalSearchParams();
  const { id, title: initialTitle, text: initialText } = params;

  const [title, setTitle] = useState((initialTitle as string) || '');
  const [content, setContent] = useState((initialText as string) || '');

  const isEditMode = !!id;

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving note:', { id, title, content });
  };

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  const handleDeleteNote = useCallback(() => {
    // TODO: Implement delete functionality, show alert
    console.log('Deleting note:', { id });
  }, [id]);

  return (
    <Fragment>
      <Stack.Screen
        options={{
          title: isEditMode ? t('Edit Note') : t('New Note'),
          headerLeft: () => (
            <Button color={theme.colors.primary} onPress={handleCancel} title={tCommon('Cancel')} />
          ),
          headerRight: () => (
            <Button
              color={theme.colors.primary}
              onPress={handleSave}
              title={isEditMode ? tCommon('Save') : tCommon('Done')}
            />
          ),
        }}
      />
      <ScreenContainer isRoot={false} style={styles.container}>
        <FormInput
          label={t('Title')}
          icon="text.justify.leading"
          placeholder={t('Enter note title')}
          value={title}
          valueColor={theme.colors.onSurfaceVariant}
          onChangeValue={setTitle}
        />
        <View style={styles.contentInputWrapper}>
          <FormInput label={t('Content')} icon="note.text" value={''} readOnly divider={false} />
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
          />
        </View>
        {isEditMode && (
          <ThemedButton
            mode="outlined"
            onPress={handleDeleteNote}
            color="error"
            icon="trash"
            style={[styles.deleteButton, { marginBottom: insets.bottom }]}
          >
            {t('Delete Note')}
          </ThemedButton>
        )}
      </ScreenContainer>
    </Fragment>
  );
};

const getStyles = createStyles<
  StyleRecord<'container' | 'contentInputWrapper' | 'deleteButton', 'noteContent' | 'textInput'>
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
});

export default NoteEdit;
