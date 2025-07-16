import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

import { Route } from '@/constants/routes';
import useRouteTranslation from '@/hooks/useRouteTranslation';
import { isRouteValue } from '@/utils/validators';

const useStackScreenOptionsHelper = () => {
  const params = useLocalSearchParams();
  const { tRoutes } = useRouteTranslation();

  const from = params.from;
  const getStackScreenOptions = useCallback(
    ({ title }: { title?: Route }) => ({
      title: title ? tRoutes(title) : undefined,
      headerBackTitle: isRouteValue(from) ? tRoutes(from) : undefined,
    }),
    [from, tRoutes],
  );

  return getStackScreenOptions;
};

export default useStackScreenOptionsHelper;
