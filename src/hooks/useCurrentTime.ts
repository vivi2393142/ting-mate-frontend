import { useEffect, useState } from 'react';

// Custom hook to get current time with controlled updates
const useCurrentTime = (updateIntervalMs: number = 60000) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [updateIntervalMs]);

  return currentTime;
};

export default useCurrentTime;
