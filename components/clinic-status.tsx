'use client';

import { useEffect, useState } from 'react';

import { ClinicHours, ClinicSpecialHours } from '@/types/clinic';
import { AlarmClockIcon, ClockAlertIcon, ClockFadingIcon, ClockIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

type ClinicStatus = 'open' | 'closed' | 'opening-soon' | 'closing-soon';

function getClinicStatus(
  regularHours: Partial<ClinicHours>[],
  specialHours: Partial<ClinicSpecialHours>[],
  date: Date = new Date(),
): ClinicStatus {
  const dayOfWeek = date.getDay() - 1;
  const currentTime = date.toTimeString().slice(0, 5); // HH:mm format

  // Helper function to check if current time is within 30 minutes of a target time
  const isWithin30Minutes = (targetTime: string): boolean => {
    const currentMinutes =
      parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
    const targetMinutes =
      parseInt(targetTime.split(':')[0]) * 60 + parseInt(targetTime.split(':')[1]);
    const diff = Math.abs(currentMinutes - targetMinutes);
    return diff <= 30;
  };

  // Check special hours first
  const specialHoursForDate = specialHours.find(
    (sh) => sh.date === date.toISOString().split('T')[0],
  );

  if (specialHoursForDate) {
    if (specialHoursForDate.is_closed) return 'closed';
    if (!specialHoursForDate.open_time || !specialHoursForDate.close_time) return 'closed';

    // Check if closing soon
    if (isWithin30Minutes(specialHoursForDate.close_time)) return 'closing-soon';

    // Check if opening soon
    if (isWithin30Minutes(specialHoursForDate.open_time)) return 'opening-soon';

    return currentTime >= specialHoursForDate.open_time &&
      currentTime <= specialHoursForDate.close_time
      ? 'open'
      : 'closed';
  }

  // Check regular hours
  const regularHoursForDay = regularHours.filter((h) => h.day_of_week === dayOfWeek);
  if (!regularHoursForDay.length) return 'closed';

  // Check each shift for the day
  for (const shift of regularHoursForDay) {
    if (!shift.open_time || !shift.close_time) continue;

    // Check if closing soon
    if (isWithin30Minutes(shift.close_time)) return 'closing-soon';

    // Check if opening soon
    if (isWithin30Minutes(shift.open_time)) return 'opening-soon';

    // Check if currently open in this shift
    if (currentTime >= shift.open_time && currentTime <= shift.close_time) {
      return 'open';
    }
  }

  // If we get here, no shifts are currently active
  return 'closed';
}

interface ClinicStatusProps {
  hours: Partial<ClinicHours>[];
  specialHours: Partial<ClinicSpecialHours>[];
}

export function ClinicStatus({ hours, specialHours }: ClinicStatusProps) {
  const [status, setStatus] = useState<ClinicStatus | null>(null);

  useEffect(() => {
    const checkStatus = () => {
      setStatus(getClinicStatus(hours, specialHours));
    };

    // Check immediately
    checkStatus();

    // Check every minute
    const interval = setInterval(checkStatus, 60000);

    return () => clearInterval(interval);
  }, [hours, specialHours]);

  const statusConfig = {
    open: {
      variant: 'green' as const,
      text: 'Open',
    },
    closed: {
      variant: 'red' as const,
      text: 'Closed',
    },
    'opening-soon': {
      variant: 'yellow' as const,
      text: 'Opening Soon',
    },
    'closing-soon': {
      variant: 'yellow' as const,
      text: 'Closing Soon',
    },
  };

  return (
    <>
      {status && (
        <Badge variant={statusConfig[status].variant} className="duration-150 animate-in fade-in">
          {status === 'open' && <ClockIcon className="me-1 h-4 w-4" aria-hidden="true" />}
          {status === 'closed' && <ClockFadingIcon className="me-1 h-4 w-4" aria-hidden="true" />}
          {status === 'opening-soon' && (
            <AlarmClockIcon className="me-1 h-4 w-4" aria-hidden="true" />
          )}
          {status === 'closing-soon' && (
            <ClockAlertIcon className="me-1 h-4 w-4" aria-hidden="true" />
          )}
          {statusConfig[status].text}
        </Badge>
      )}
    </>
  );
}
