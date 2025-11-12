'use client';

import { useEffect, useState } from 'react';

import { formatDistanceToNow } from 'date-fns';

interface RelativeTimeProps {
  date: string | Date;
  addSuffix?: boolean;
  className?: string;
}

export function RelativeTime({ date, addSuffix = true, className }: RelativeTimeProps) {
  const [relativeTime, setRelativeTime] = useState(() =>
    formatDistanceToNow(new Date(date), { addSuffix }),
  );

  useEffect(() => {
    // Update every minute to keep relative time fresh
    const interval = setInterval(() => {
      setRelativeTime(formatDistanceToNow(new Date(date), { addSuffix }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date, addSuffix]);

  return <span className={className}>{relativeTime}</span>;
}
