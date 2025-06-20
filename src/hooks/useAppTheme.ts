import { useTheme as usePaperTheme } from 'react-native-paper';

import type { CustomTheme } from '@/theme';

const useAppTheme = () => {
  return usePaperTheme() as CustomTheme;
};

export default useAppTheme;
