import { useEffect } from 'react';

import { useCurrentUser } from '@/api/user';
import useUserStore from '@/store/useUserStore';

// User data sync handler, data will be synced to store by queryClient
const UserSyncHandler = () => {
  const { token, anonymousId } = useUserStore.getState();
  useCurrentUser({ enabled: !!(token || anonymousId) });

  // Initialize anonymousId and token on app start
  useEffect(() => {
    useUserStore.getState().initAnonymousId();
    useUserStore.getState().initToken();
  }, []);

  return null;
};

export default UserSyncHandler;
