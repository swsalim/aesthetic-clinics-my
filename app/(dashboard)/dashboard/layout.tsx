import { Metadata } from 'next';

import Container from '@/components/ui/container';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <section className="max-w-8xl mx-auto px-4 py-8 sm:px-6">
      <Container>{children}</Container>
    </section>
  );
}
