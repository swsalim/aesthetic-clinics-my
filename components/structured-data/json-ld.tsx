import React from 'react';

type JsonLdData = {
  '@context': string;
  '@type': string | string[];
  [key: string]: unknown;
};

interface JsonLdProps {
  id: string;
  children: JsonLdData;
}

/**
 * A plain script tag is part of the server HTML. next/script only attaches
 * this payload on the client, so crawlers never saw the JSON-LD.
 */
const JsonLd = ({ id, children }: JsonLdProps): React.ReactElement => {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(children).replace(/</g, '\\u003c'),
      }}
    />
  );
};

export default JsonLd;
