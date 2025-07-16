import { useEffect } from 'react';

import { useCurrentUser } from '@/api/user';
import useAuthStore from '@/store/useAuthStore';

// User data sync handler, data will be synced to store by queryClient
const UserSyncHandler = () => {
  const token = useAuthStore((s) => s.token);
  const anonymousId = useAuthStore((s) => s.anonymousId);

  // Sync data automatically through queryClient
  useCurrentUser({ enabled: !!(token || anonymousId) });

  // Initialize anonymousId and token on app start
  useEffect(() => {
    useAuthStore.getState().initStore();
  }, []);

  return null;
};

export default UserSyncHandler;
