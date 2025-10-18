import { redirect } from 'next/navigation';

import { createServerClient } from '@/lib/supabase';

import DashboardHeader from '@/components/dashboard/dashboard-header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <DashboardHeader />
      <main className="flex-grow">{children}</main>
    </>
  );
}
