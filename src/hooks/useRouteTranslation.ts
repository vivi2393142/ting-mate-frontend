import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { type Route } from '@/constants/routes';

interface useRouteTranslation extends Omit<ReturnType<typeof useTranslation>, 't'> {
  tRoutes: (route: Route, options?: { count?: number; lowerCase?: boolean }) => string;
}

const useRouteTranslation = (): useRouteTranslation => {
  const { t, ...methods } = useTranslation('routes');

  const tRoutes = useCallback(
    (route: Route) => {
      return t(route);
    },
    [t],
  );

  return {
    ...methods,
    tRoutes,
  };
};

export default useRouteTranslation;
