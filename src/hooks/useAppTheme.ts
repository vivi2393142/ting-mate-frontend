import { useTheme as usePaperTheme } from 'react-native-paper';

import type { Theme } from '@/theme';

const useAppTheme = () => {
  return usePaperTheme() as Theme;
};

export default useAppTheme;
