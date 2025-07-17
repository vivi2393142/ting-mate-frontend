import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import ScreenContainer from '@/components/atoms/ScreenContainer';
import EmergencySection from '@/components/screens/Connect/EmergencySection';
import LocationSection from '@/components/screens/Connect/LocationSection';
import SharedSection from '@/components/screens/Connect/SharedSection';

const ConnectScreen = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <ScreenContainer scrollable style={styles.container} contentContainerStyle={styles.content}>
      <LocationSection />
      <EmergencySection />
      <SharedSection />
    </ScreenContainer>
  );
};

const getStyles = createStyles<StyleRecord<'container' | 'content'>>({
  container: {
    flex: 1,
  },
  content: {
    gap: StaticTheme.spacing.md * 1.5,
    paddingBottom: StaticTheme.spacing.md,
  },
});

export default ConnectScreen;
