'use client';

import React, { useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { motion } from 'framer-motion';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import Container from '@/components/ui/container';
import Logo from '@/components/ui/logo';

interface NavLink {
  label: string;
  href: string;
}

const DashboardHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const links: NavLink[] = [
    { label: 'States', href: '/dashboard/states' },
    { label: 'Areas', href: '/dashboard/areas' },
    { label: 'Clinics', href: '/dashboard/clinics' },
    { label: 'Doctors', href: '/dashboard/doctors' },
    { label: 'Review Clinics', href: '/dashboard/clinics/review' },
  ];

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
    }

    router.push('/login');
  };

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(entry.intersectionRatio < 1),
      { threshold: [1] },
    );

    observer.observe(header);

    return () => {
      if (header) observer.unobserve(header);
    };
  }, []);

  return (
    <header
      className={cn('sticky inset-x-0 top-[-1px] z-50 bg-white duration-200 ease-in', {
        'shadow-lg': isSticky,
      })}
      ref={headerRef}>
      <Container className="flex items-center justify-between py-4">
        <div className="z-10 px-2 md:px-0">
          <Link href="/dashboard">
            <Logo className="relative h-8 w-8 sm:h-10 sm:w-10" />
          </Link>
        </div>
        <nav className="hidden md:ml-4 md:flex md:items-center md:gap-8">
          {links.map(({ label, href }, index) => (
            <React.Fragment key={label}>
              <Link
                href={href}
                className={cn(
                  'relative -mx-3 -my-2 rounded-lg border-none px-3 py-2 text-base font-medium transition-colors delay-150 hover:border-none hover:delay-0',
                  {
                    'text-gray-700 hover:text-gray-800': pathname !== href,
                    'text-blue-600 hover:text-blue-900': pathname === href,
                  },
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}>
                {hoveredIndex === index && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '0.5rem',
                      backgroundColor: 'rgb(243 244 246)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.15 } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </Link>
            </React.Fragment>
          ))}
          <Link href="#" onClick={handleLogout} className="ml-auto">
            Sign Out
          </Link>
        </nav>
      </Container>
    </header>
  );
};

export default DashboardHeader;
