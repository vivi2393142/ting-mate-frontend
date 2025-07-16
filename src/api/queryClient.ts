import { QueryCache, QueryClient } from '@tanstack/react-query';

import { syncCurrentUserToStore } from '@/api/user';
import { User } from '@/types/user';

const queryCache = new QueryCache({
  onSuccess: (data, query) => {
    if (query.queryKey[0] === 'currentUser') {
      syncCurrentUserToStore(data as User);
    }
  },
});

const queryClient = new QueryClient({
  queryCache,
});

export default queryClient;
