import { QueryCache, QueryClient } from '@tanstack/react-query';

import { syncCurrentUserToStore, transformUserFromAPI, UserSchema } from '@/api/user';

const queryCache = new QueryCache({
  onSuccess: (data, query) => {
    if (query.queryKey[0] === 'currentUser') {
      const validatedData = UserSchema.parse(data);
      syncCurrentUserToStore(transformUserFromAPI(validatedData));
    }
  },
});

const queryClient = new QueryClient({
  queryCache,
});

export default queryClient;
