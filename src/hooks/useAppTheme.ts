import type { MD3Theme } from 'react-native-paper';
import { useTheme as usePaperTheme } from 'react-native-paper';

import { spacing } from '@/theme';

// Extend the theme type
type CustomTheme = MD3Theme & {
  spacing: typeof spacing;
};

const useAppTheme = () => {
  return usePaperTheme() as CustomTheme;
};

export default useAppTheme;
