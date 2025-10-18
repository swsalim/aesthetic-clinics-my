'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface TruncatedTextProps {
  text: string;
  limit?: number;
}

export function TruncatedText({ text, limit = 50 }: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const words = text.split(' ');
  const isTextLong = words.length > limit;
  const displayText = words.slice(0, limit).join(' ');

  if (!isTextLong) {
    return <p className="my-0">{text}</p>;
  }

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden">
        <div
          className={`transition-all duration-200 ${isExpanded ? 'max-h-[1000px]' : 'max-h-none'}`}>
          <p className="my-0" aria-hidden={!isExpanded}>
            {isExpanded ? text : `${displayText}...`}
          </p>
          {!isExpanded && <span className="sr-only">{text}</span>}
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative z-10 h-auto px-0 text-blue-800 transition-colors duration-200 hover:bg-transparent hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500">
        {isExpanded ? 'Show less' : 'Show more'}
      </Button>
    </div>
  );
}
