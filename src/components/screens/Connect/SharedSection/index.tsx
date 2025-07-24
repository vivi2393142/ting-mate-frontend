import { View } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import SharedLogContent from '@/components/screens/Connect/SharedSection/SharedLogContent';
import SharedNoteContent from '@/components/screens/Connect/SharedSection/SharedNoteContent';

const SharedSection = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.root}>
      <View style={styles.section}>
        <SharedNoteContent />
      </View>
      <View style={styles.section}>
        <SharedLogContent />
      </View>
    </View>
  );
};

const getStyles = createStyles<StyleRecord<'root' | 'section'>>({
  root: {
    gap: StaticTheme.spacing.lg,
  },
  section: {
    gap: StaticTheme.spacing.sm,
    backgroundColor: ({ colors }) => colorWithAlpha(colors.surfaceVariant, 0.5),
    borderRadius: StaticTheme.borderRadius.s,
    paddingHorizontal: StaticTheme.spacing.sm * 1.5,
    paddingVertical: StaticTheme.spacing.sm,
  },
});

export default SharedSection;
