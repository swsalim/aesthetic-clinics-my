'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

interface TruncatedHtmlProps {
  html: string;
  limit?: number;
}

export function TruncatedHtml({ html, limit = 50 }: TruncatedHtmlProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isTextLong, setIsTextLong] = useState(false);

  useEffect(() => {
    // Create a temporary div to get the text content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || '';
    const words = text.split(' ');
    setIsTextLong(words.length > limit);
    setDisplayText(words.slice(0, limit).join(' '));
  }, [html, limit]);

  if (!isTextLong) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden">
        <div
          className={`transition-all duration-200 ${isExpanded ? 'max-h-[1000px]' : 'max-h-none'}`}>
          {isExpanded ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div>
              <p dangerouslySetInnerHTML={{ __html: `${displayText}...` }} />
            </div>
          )}
          {!isExpanded && <span className="sr-only">{html}</span>}
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
