import React, { AnchorHTMLAttributes, forwardRef, ReactNode } from 'react';

import NextLink from 'next/link';

interface AnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  children: ReactNode;
  newWindow?: boolean;
  prefetch?: boolean;
}

const Anchor = forwardRef<HTMLAnchorElement, AnchorProps>(
  ({ href = '', children, newWindow, prefetch = true, ...props }, forwardedRef) => {
    if (newWindow) {
      return (
        <a href={href} ref={forwardedRef} rel="noreferrer" target="_blank" {...props}>
          {children}
        </a>
      );
    }

    if (!href) {
      return (
        <a ref={forwardedRef} {...props}>
          {children}
        </a>
      );
    }

    if (href.includes('#')) {
      return (
        <a href={href} ref={forwardedRef} {...props}>
          {children}
        </a>
      );
    }

    return (
      <NextLink href={href} prefetch={prefetch} ref={forwardedRef} {...props}>
        {children}
      </NextLink>
    );
  },
);

Anchor.displayName = 'Anchor';

export default Anchor;
