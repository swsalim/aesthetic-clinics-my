'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import pluralize from 'pluralize';

import { cn } from '@/lib/utils';

import { ImageKit } from '../image/image-kit';

interface StateWithCount {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  clinics: { count: number }[];
}

interface ExploreStatesClientProps {
  states: StateWithCount[];
}

export function ExploreStatesClient({ states }: ExploreStatesClientProps) {
  const [orderedStateIds, setOrderedStateIds] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('exploreStatesDate');
    const storedStateIds = localStorage.getItem('exploreStateIds');

    if (storedDate === today && storedStateIds) {
      setOrderedStateIds(JSON.parse(storedStateIds));
    } else {
      const randomizedIds = states.map((state) => state.id).sort(() => 0.5 - Math.random());
      localStorage.setItem('exploreStatesDate', today);
      localStorage.setItem('exploreStateIds', JSON.stringify(randomizedIds));
      setOrderedStateIds(randomizedIds);
    }
  }, [states]);

  // Create a map of states for easy lookup
  const statesMap = new Map(states.map((state) => [state.id, state]));

  // Get ordered states using the stored IDs
  const orderedStates = orderedStateIds
    .map((id) => statesMap.get(id))
    .filter((state): state is StateWithCount => state !== undefined);

  return (
    <div className="lg:grid-cols- grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8 lg:grid-cols-6">
      {orderedStates.map((state, index) => (
        <div
          key={state.id}
          className={cn(
            'overflow-hidden',
            (index === 0 || index === 6) && 'lg:col-span-3 lg:row-span-2',
            index === 2 && 'lg:col-span-2',
            index === 3 && 'lg:col-span-3',
            index === 5 && 'lg:col-span-2',
            index === 7 && 'lg:col-span-3',
            index === 8 && 'lg:col-span-2',
          )}>
          <Link
            href={`/${state.slug}`}
            className="relative overflow-hidden rounded-lg text-blue-300">
            <div
              className={cn(
                'group relative h-56 w-full overflow-hidden rounded-lg transition md:h-52 lg:h-56',
                (index === 0 || index === 6) && 'lg:h-full lg:max-h-[480px]',
              )}>
              {state.image && (
                <ImageKit
                  src={state.image}
                  alt={state.name}
                  width={600}
                  height={600}
                  sizes="(max-width: 600px) 100vw, 350px"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              )}
              {!state.image && (
                <ImageKit
                  src="placeholder-location.jpg"
                  alt={state.name}
                  width={600}
                  height={600}
                  sizes="(max-width: 600px) 100vw, 350px"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              )}
            </div>
            <div className="absolute -bottom-1 left-0 right-0 h-4/5 rounded-b-lg bg-gradient-to-t from-gray-900/100 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
              <h3 className="text-lg font-semibold">{state.name}</h3>
              <p className="text-base font-medium text-gray-100 dark:text-gray-100">
                {state.clinics?.[0].count} {pluralize('clinic', state.clinics?.[0].count)}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
