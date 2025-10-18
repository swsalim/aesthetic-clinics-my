'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}
export default function AdsSquare() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Error loading AdSense:', err);
    }
  }, []);

  return (
    <aside className="my-4 block w-full before:block before:text-center before:text-[10px] before:font-medium before:uppercase before:leading-4 before:text-gray-500 before:content-['Advertisement'] md:my-8">
      <div className="relative mx-auto min-h-[250px] w-full bg-gray-50 text-center">
        <ins
          className="adsbygoogle relative mx-auto min-h-[250px] w-full bg-gray-50 text-center"
          style={{
            display: 'block',
            textAlign: 'center',
          }}
          data-ad-client="ca-pub-3799479098488751"
          data-ad-slot="2506925447"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
