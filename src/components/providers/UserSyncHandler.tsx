import { useEffect } from 'react';

import { useCurrentUser } from '@/api/user';
import useUserStore from '@/store/useUserStore';

// User data sync handler, data will be synced to store by queryClient
const UserSyncHandler = () => {
  const token = useUserStore((s) => s.token);
  const anonymousId = useUserStore((s) => s.anonymousId);

  // Sync data automatically through queryClient
  useCurrentUser({ enabled: !!(token || anonymousId) });

  // Initialize anonymousId and token on app start
  useEffect(() => {
    useUserStore.getState().initAnonymousId();
    useUserStore.getState().initToken();
  }, []);

  return null;
};

export default UserSyncHandler;
