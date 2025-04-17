import React from 'react';

import Script from 'next/script';

type JsonLdData = {
  '@context': string;
  '@type': string | string[];
  [key: string]: unknown;
};

interface JsonLdProps {
  id: string;
  children: JsonLdData;
}

const JsonLd = ({ id, children }: JsonLdProps): React.ReactElement => {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(children) }}
    />
  );
};

export default JsonLd;
