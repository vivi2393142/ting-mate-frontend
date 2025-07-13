import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Fragment } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';

const LogDetail = () => {
  const { t } = useTranslation('connect');
  const { t: tCommon } = useTranslation('common');

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const params = useLocalSearchParams();
  const { id } = params;

  // TODO: Fetch actual log data by ID
  const logData = {
    id: id as string,
    time: '8:10 AM',
    date: '2024-01-15', // TODO: Get from actual data
    text: 'Took medicationTook medicationTook medicationTook medicationTook medicationTook medication',
    user: 'John Doe',
  };

  return (
    <Fragment>
      <Stack.Screen
        options={{
          title: t('Log Detail'),
          headerBackTitle: tCommon('Connect'),
        }}
      />
      <ScreenContainer isRoot={false} scrollable>
        <FormInput
          label={t('User')}
          icon="text.justify.leading"
          value={logData.user}
          valueColor={theme.colors.outline}
          readOnly
        />
        <FormInput
          label={t('Date')}
          icon="calendar"
          value={logData.date}
          valueColor={theme.colors.outline}
          readOnly
        />
        <FormInput
          label={t('Time')}
          icon="clock"
          value={logData.time}
          valueColor={theme.colors.outline}
          readOnly
        />
        <View style={styles.contentInputWrapper}>
          <FormInput label={t('Content')} icon="note.text" value={''} readOnly divider={false} />
          <TextInput
            dense
            multiline
            readOnly
            value={logData.text}
            mode="outlined"
            outlineColor="transparent"
            activeOutlineColor="transparent"
            textColor={theme.colors.outline}
            contentStyle={styles.contentContent}
          />
        </View>
      </ScreenContainer>
    </Fragment>
  );
};

const getStyles = createStyles<StyleRecord<'contentInputWrapper', 'contentContent'>>({
  contentInputWrapper: {
    flex: 1,
    borderBottomWidth: 1 / 3,
    borderBottomColor: ({ colors }) => colors.outlineVariant,
    paddingBottom: StaticTheme.spacing.md,
  },
  contentContent: {
    paddingHorizontal: StaticTheme.spacing.sm,
    paddingVertical: StaticTheme.spacing.sm,
  },
});

export default LogDetail;
